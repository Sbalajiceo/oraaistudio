import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Keyboard,
  Platform,
  KeyboardEvent,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAnthropic } from '@/hooks/useAnthropic';

// Context chips — swap for user-specific suggestions from backend/memory
const CONTEXT_CHIPS = [
  'Explain my latest labs',
  'Is my BP okay?',
  'What should I eat today?',
  'How did I sleep last night?',
  "What's my recovery looking like?",
];

type Status = 'waiting' | 'listening' | 'responding' | 'idle';

type Props = {
  visible: boolean;
  /** Provided when a chip/card prompt is tapped — auto-runs that query. */
  initialQuery?: string;
  onClose: () => void;
};

const WAVE_DELAYS = [0.12, 0.24, 0.36, 0.48, 0.36, 0.24, 0.12];

export default function VoiceOverlay({ visible, initialQuery, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { ask } = useAnthropic();

  // ── Animations ──────────────────────────────────────────────────────────
  const opacity  = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef(WAVE_DELAYS.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);
  const waveComp  = useRef<Animated.CompositeAnimation | null>(null);

  // ── State ────────────────────────────────────────────────────────────────
  const [status, setStatus]         = useState<Status>('waiting');
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText]   = useState('');
  const [kbHeight, setKbHeight]     = useState(0);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const inputRef      = useRef<TextInput>(null);
  const typeTimer     = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Keyboard listener (reliable on iOS inside absolute overlay) ──────────
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      setKbHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setKbHeight(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  // ── Animation helpers ────────────────────────────────────────────────────
  const startPulse = useCallback(() => {
    pulseAnim.current = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, { toValue: 1.07, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1,    duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulseAnim.current.start();
  }, [orbScale]);

  const startWaves = useCallback(() => {
    const anims = waveAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(WAVE_DELAYS[i] * 1000),
          Animated.timing(anim, { toValue: 1, duration: 550, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      )
    );
    waveComp.current = Animated.parallel(anims);
    waveComp.current.start();
  }, [waveAnims]);

  const stopAnimations = useCallback(() => {
    pulseAnim.current?.stop();
    waveComp.current?.stop();
  }, []);

  const clearTimers = useCallback(() => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    if (responseTimer.current) clearTimeout(responseTimer.current);
    typeTimer.current = null;
    responseTimer.current = null;
  }, []);

  // ── Typewriter ───────────────────────────────────────────────────────────
  const typeText = useCallback((text: string, onDone: () => void) => {
    let i = 0;
    setTranscript('');
    typeTimer.current = setInterval(() => {
      i++;
      setTranscript(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typeTimer.current!);
        typeTimer.current = null;
        onDone();
      }
    }, 36);
  }, []);

  // ── Query runner ─────────────────────────────────────────────────────────
  const runSession = useCallback(async (query: string) => {
    Keyboard.dismiss();
    setInputText('');
    setStatus('listening');

    await new Promise<void>((res) => {
      responseTimer.current = setTimeout(res, 600);
    });

    typeText(query, async () => {
      setStatus('responding');
      const answer = await ask(query);
      setTranscript(answer);
      setStatus('idle');
    });
  }, [ask, typeText]);

  // ── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      startPulse();
      startWaves();
      if (initialQuery) {
        runSession(initialQuery);
      } else {
        setStatus('waiting');
        setTranscript('');
        // No auto-focus — let user choose to type or tap a chip
      }
    } else {
      clearTimers();
      stopAnimations();
      Keyboard.dismiss();
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      orbScale.setValue(1);
      waveAnims.forEach((a) => a.setValue(0));
      setTranscript('');
      setInputText('');
      setStatus('waiting');
    }
    return clearTimers;
  }, [visible, initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Input handlers ───────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const q = inputText.trim();
    if (q) runSession(q);
  }, [inputText, runSession]);

  /** Return key: send if text present, close overlay if empty */
  const handleReturnKey = useCallback(() => {
    if (inputText.trim()) {
      handleSend();
    } else {
      onClose();
    }
  }, [inputText, handleSend, onClose]);

  const isActive = status === 'listening' || status === 'responding' || status === 'idle';

  const statusLabel: Record<Status, string> = {
    waiting:    'Tap a suggestion or type below',
    listening:  'Listening...',
    responding: 'Thinking...',
    idle:       'Ask a follow-up or tap a suggestion',
  };

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <View style={[styles.topbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose} hitSlop={12}>
          <Feather name="arrow-left" size={17} color="rgba(255,255,255,0.65)" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ask Ora</Text>
      </View>

      {/* ── Scrollable centre ─────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.statusText}>{statusLabel[status]}</Text>

        {/* Pulsing orb */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={status === 'waiting' ? onClose : undefined}
          style={styles.orbWrap}
        >
          <Animated.View style={{ transform: [{ scale: orbScale }] }}>
            <Svg width={108} height={108} viewBox="0 0 108 108">
              <Defs>
                <RadialGradient id="voiceOrb" cx="35%" cy="28%" r="70%" gradientUnits="userSpaceOnUse">
                  <Stop offset="0%"   stopColor="#D4CEFF" />
                  <Stop offset="45%"  stopColor="#7B6EF6" />
                  <Stop offset="75%"  stopColor="#4A3ABF" />
                  <Stop offset="100%" stopColor="#2E228A" />
                </RadialGradient>
              </Defs>
              <Circle cx="54" cy="54" r="54" fill="url(#voiceOrb)" />
              <Ellipse cx="42" cy="36" rx="13" ry="8" fill="rgba(255,255,255,0.22)" transform="rotate(-18 42 36)" />
            </Svg>
          </Animated.View>
          {status === 'waiting' && (
            <Text style={styles.orbHint}>tap to close</Text>
          )}
        </TouchableOpacity>

        {/* Wave bars while listening / processing */}
        {(status === 'listening' || status === 'responding') && (
          <View style={styles.waveWrap}>
            {waveAnims.map((anim, i) => {
              const h = anim.interpolate({ inputRange: [0, 1], outputRange: [6, 28] });
              return <Animated.View key={i} style={[styles.waveBar, { height: h }]} />;
            })}
          </View>
        )}

        {/* Transcript / response text */}
        {isActive && transcript.length > 0 && (
          <Text style={styles.transcript}>{transcript}</Text>
        )}

        {/* Context chips — waiting and after response */}
        {(status === 'waiting' || status === 'idle') && (
          <View style={styles.chips}>
            {CONTEXT_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.chip}
                onPress={() => runSession(chip)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Text input (keyboard-aware) ──────────────────────────────────── */}
      <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 16) + kbHeight }]}>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything..."
            placeholderTextColor="rgba(255,255,255,0.28)"
            returnKeyType="send"
            onSubmitEditing={handleReturnKey}
            blurOnSubmit={false}
            multiline={false}
          />
          {inputText.trim().length > 0 ? (
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
              <Feather name="arrow-up" size={15} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendBtnGhost} onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={15} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.hint}>Return to send · Return on empty to dismiss</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.voiceBg,
    borderRadius: 36,
    zIndex: 20,
    flexDirection: 'column',
  },

  // Top bar
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 4,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  statusText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.28)',
    marginBottom: 28,
    textAlign: 'center',
  },

  // Orb
  orbWrap: {
    alignItems: 'center',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 4,
  },
  orbHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.2)',
    marginTop: 8,
  },

  // Waves
  waveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 24,
    height: 32,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(123,110,246,0.65)',
  },

  // Transcript
  transcript: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
    maxWidth: 280,
  },

  // Chips
  chips: {
    marginTop: 28,
    gap: 10,
    width: '100%',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: 'rgba(123,110,246,0.18)',
    borderWidth: 0.5,
    borderColor: 'rgba(123,110,246,0.45)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  chipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
  },

  // Input area
  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    padding: 0,
    margin: 0,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnGhost: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.16)',
    textAlign: 'center',
    letterSpacing: 0.2,
    paddingBottom: 4,
  },
});
