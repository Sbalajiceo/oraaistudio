import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAnthropic } from '@/hooks/useAnthropic';

type Props = {
  visible: boolean;
  initialQuery?: string;
  onClose: () => void;
};

const WAVE_DELAYS = [0.12, 0.24, 0.36, 0.48, 0.36, 0.24, 0.12];

export default function VoiceOverlay({ visible, initialQuery, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { ask } = useAnthropic();

  const opacity = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef(WAVE_DELAYS.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);
  const waveComposite = useRef<Animated.CompositeAnimation | null>(null);

  const [status, setStatus] = useState<'listening' | 'responding' | 'idle'>('listening');
  const [transcript, setTranscript] = useState('');
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusText = {
    listening: 'Listening...',
    responding: 'Responding...',
    idle: 'Tap to speak again',
  }[status];

  const startPulse = useCallback(() => {
    pulseAnim.current = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, {
          toValue: 1.06,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orbScale, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.current.start();
  }, [orbScale]);

  const startWaves = useCallback(() => {
    const animations = waveAnims.map((anim, i) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(WAVE_DELAYS[i] * 1000),
          Animated.timing(anim, {
            toValue: 1,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
    });
    waveComposite.current = Animated.parallel(animations);
    waveComposite.current.start();
  }, [waveAnims]);

  const stopAnimations = useCallback(() => {
    pulseAnim.current?.stop();
    waveComposite.current?.stop();
  }, []);

  const clearTimers = useCallback(() => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    if (responseTimer.current) clearTimeout(responseTimer.current);
    typeTimer.current = null;
    responseTimer.current = null;
  }, []);

  const typeText = useCallback(
    (text: string, onDone: () => void) => {
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
    },
    []
  );

  const runSession = useCallback(
    async (query: string) => {
      setStatus('listening');
      setTranscript('');

      await new Promise<void>((res) => {
        responseTimer.current = setTimeout(res, 800);
      });

      typeText(query, async () => {
        setStatus('responding');
        const answer = await ask(query);
        setTranscript(answer);
        setStatus('idle');
      });
    },
    [ask, typeText]
  );

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
      startPulse();
      startWaves();
      const query = initialQuery ?? 'How is my heart rate looking?';
      runSession(query);
    } else {
      clearTimers();
      stopAnimations();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      orbScale.setValue(1);
      waveAnims.forEach((a) => a.setValue(0));
      setTranscript('');
      setStatus('listening');
    }
    return clearTimers;
  }, [visible, initialQuery]);

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity, pointerEvents: visible ? 'auto' : 'none' },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Top bar */}
      <View style={[styles.topbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Feather name="arrow-left" size={17} color="rgba(255,255,255,0.65)" />
        </TouchableOpacity>
        <Text style={styles.voiceTitle}>Voice mode</Text>
      </View>

      {/* Center */}
      <View style={styles.center}>
        <Text style={styles.statusText}>{statusText}</Text>

        {/* Animated orb */}
        <Animated.View style={[styles.orbWrap, { transform: [{ scale: orbScale }] }]}>
          <Svg width={108} height={108} viewBox="0 0 108 108">
            <Defs>
              <RadialGradient id="voiceOrb" cx="35%" cy="28%" r="70%" gradientUnits="userSpaceOnUse">
                <Stop offset="0%" stopColor="#D4CEFF" />
                <Stop offset="45%" stopColor="#7B6EF6" />
                <Stop offset="75%" stopColor="#4A3ABF" />
                <Stop offset="100%" stopColor="#2E228A" />
              </RadialGradient>
            </Defs>
            <Circle cx="54" cy="54" r="54" fill="url(#voiceOrb)" />
            {/* Specular highlight */}
            <Ellipse
              cx="42" cy="36" rx="13" ry="8"
              fill="rgba(255,255,255,0.22)"
              transform="rotate(-18 42 36)"
            />
          </Svg>
        </Animated.View>

        {/* Wave bars */}
        <View style={styles.waveWrap}>
          {waveAnims.map((anim, i) => {
            const barHeight = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [6, 28],
            });
            return (
              <Animated.View
                key={i}
                style={[styles.waveBar, { height: barHeight }]}
              />
            );
          })}
        </View>

        <Text style={styles.transcript}>{transcript}</Text>
      </View>

      {/* Bottom */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity style={styles.endBtn} onPress={onClose}>
          <MaterialIcons name="stop" size={24} color={Colors.red} />
        </TouchableOpacity>
        <Text style={styles.endLabel}>End session</Text>
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
  voiceTitle: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 30,
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
  waveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 28,
    height: 32,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(123,110,246,0.65)',
  },
  transcript: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 240,
    marginTop: 22,
    lineHeight: 24,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  bottom: {
    alignItems: 'center',
    gap: 8,
  },
  endBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(226,87,76,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(226,87,76,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: 'rgba(255,255,255,0.22)',
  },
});
