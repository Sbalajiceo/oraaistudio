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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAnthropic } from '@/hooks/useAnthropic';

// ─── Data-aware context chips ───────────────────────────────────────────────
// Replace with chips derived from the user's latest health data at runtime.
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
  /** When provided the overlay immediately runs this query (chip/card tap). */
  initialQuery?: string;
  onClose: () => void;
};

const WAVE_DELAYS = [0.12, 0.24, 0.36, 0.48, 0.36, 0.24, 0.12];

export default function VoiceOverlay({ visible, initialQuery, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { ask } = useAnthropic();

  // ── Animations ──────────────────────────────────────────────────────────
  const opacity    = useRef(new Animated.Value(0)).current;
  const orbScale   = useRef(new Animated.Value(1)).current;
  const waveAnims  = useRef(WAVE_DELAYS.map(() => new Animated.Value(0))).current;
  const pulseAnim  = useRef<Animated.CompositeAnimation | null>(null);
  const waveComp   = useRef<Animated.CompositeAnimation | null>(null);

  // ── State ────────────────────────────────────────────────────────────────
  const [status, setStatus]       = useState<Status>('waiting');
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText]   = useState('');

  // ── Refs ─────────────────────────────────────────────────────────────────
  const inputRef     = useRef<TextInput>(null);
  const typeTimer    = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap      = useRef<number | null>(null);

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

  // ── Typewriter effect ────────────────────────────────────────────────────
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
    setStatus('listening');
    setInputText('');
    inputRef.current?.blur();

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
        // Small delay so overlay is visible before keyboard appears
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    } else {
      clearTimers();
      stopAnimations();
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      orbScale.setValue(1);
      waveAnims.forEach((a) => a.setValue(0));
      setTranscript('');
      setInputText('');
      setStatus('waiting');
    }
    return clearTimers;
  }, [visible, initialQuery]);

  // ── Input handlers ───────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const q = inputText.trim();
    if (q) {
      runSession(q);
    }
  }, [inputText, runSession]);

  /** Return key: send if text present, dismiss if empty */
  const handleReturnKey = useCallback(() => {
    if (inputText.trim()) {
      handleSend();
    } else {
      onClose();
    }
  }, [inputText, handleSend, onClose]);

  /** Double-tap anywhere on the dark background → dismiss */
  const handleBackgroundTap = useCallback(() => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 350) {
      lastTap.current = null;
      onClose();
    } else {
      lastTap.current = now;
    }
  }, [onClose]);

  const isActive = status === 'listening' || status === 'responding' || status === 'idle';

  const statusLabel: Record<Status, string> = {
    waiting:    'Tap a suggestion or type below',
    listening:  'Listening...',
    responding: 'Thinking...',
    idle:       'Tap a suggestion or ask another',
  };

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <KeyboardAvoidingView
        style={styles.kvFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Tap background to double-tap-dismiss (behind everything) */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleBackgroundTap}
        />

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <View style={[styles.topbar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Feather name="arrow-left" size={17} color="rgba(255,255,255,0.65)" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Ask Ora</Text>
        </View>

        {/* ── Centre ────────────────────────────────────────────────────── */}
        <View style={styles.center} pointerEvents="box-none">
          <Text style={styles.statusText}>{statusLabel[status]}</Text>

          {/* Pulsing orb */}
          <Animated.View style={[styles.orbWrap, { transform: [{ scale: orbScale }] }]}>
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

          {/* Wave bars — visible while listening / responding */}
          {isActive && status !== 'idle' && (
            <View style={styles.waveWrap}>
              {waveAnims.map((anim, i) => {
                const h = anim.interpolate({ inputRange: [0, 1], outputRange: [6, 28] });
                return <Animated.View key={i} style={[styles.waveBar, { height: h }]} />;
              })}
            </View>
          )}

          {/* Transcript / response */}
          {isActive && (
            <ScrollView
              style={styles.transcriptScroll}
              contentContainerStyle={styles.transcriptContent}
              showsVerticalScrollIndicator={false}
              pointerEvents="none"
            >
              <Text style={styles.transcript}>{transcript}</Text>
            </ScrollView>
          )}

          {/* Context chips — shown in waiting mode and after idle */}
          {(status === 'waiting' || status === 'idle') && (
            <View style={styles.chips} pointerEvents="box-none">
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
        </View>

        {/* ── Bottom text input ──────────────────────────────────────────── */}
        <View style={[styles.inputRow, { marginBottom: insets.bottom + 20 }]}>
          <View style={styles.inputWrap}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              returnKeyType="send"
              onSubmitEditing={handleReturnKey}
              blurOnSubmit={false}
              multiline={false}
            />
            {inputText.trim().length > 0 && (
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
                <Feather name="arrow-up" size={15} color="white" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.hint}>Double-tap background · Return to dismiss</Text>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.voiceBg,
    borderRadius: 36,
    zIndex: 20,
  },
  kvFlex: {
    flex: 1,
  },

  // Top bar
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
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

  // Centre
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  orbWrap: {
    width: 108,
    height: 108,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
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
  transcriptScroll: {
    maxHeight: 110,
    marginTop: 18,
    width: '100%',
  },
  transcriptContent: {
    alignItems: 'center',
  },
  transcript: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  // Context chips
  chips: {
    marginTop: 28,
    gap: 9,
    width: '100%',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: 'rgba(123,110,246,0.18)',
    borderWidth: 0.5,
    borderColor: 'rgba(123,110,246,0.4)',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  chipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  // Text input row
  inputRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
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
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.18)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
