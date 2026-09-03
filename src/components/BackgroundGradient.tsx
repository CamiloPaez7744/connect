import { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { T } from '../tokens';

const { width: W, height: H } = Dimensions.get('window');

function WebGradient() {
  return (
    <View style={[st.container, { pointerEvents: 'none' as const }]}>
      <style>{`
        #bg-base {
          position: fixed;
          inset: 0;
          z-index: -2;
          background-color: ${T.bg};
        }
        #bg-orb-blue {
          position: fixed;
          width: 140%;
          height: 120%;
          top: -30%;
          left: -20%;
          z-index: -1;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, transparent 65%);
          animation: driftBlue 10s ease-in-out infinite alternate;
          pointer-events: none;
        }
        #bg-orb-teal {
          position: fixed;
          width: 130%;
          height: 110%;
          bottom: -25%;
          right: -15%;
          z-index: -1;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0,229,199,0.16) 0%, transparent 60%);
          animation: driftTeal 10s ease-in-out infinite alternate-reverse;
          pointer-events: none;
        }
        @keyframes driftBlue {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(4%, 3%) scale(1.05); }
          100% { transform: translate(-2%, -2%) scale(0.97); }
        }
        @keyframes driftTeal {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-5%, -4%) scale(1.06); }
          100% { transform: translate(3%, 2%) scale(0.95); }
        }
      `}</style>
      <div id="bg-base" />
      <div id="bg-orb-blue" />
      <div id="bg-orb-teal" />
    </View>
  );
}

function NativeGradient() {
  const pulse1 = useRef(new Animated.Value(0.14)).current;
  const pulse2 = useRef(new Animated.Value(0.12)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse1, { toValue: 0.20, duration: 5000, useNativeDriver: false }),
            Animated.timing(pulse1, { toValue: 0.10, duration: 5000, useNativeDriver: false }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse2, { toValue: 0.16, duration: 5000, useNativeDriver: false }),
            Animated.timing(pulse2, { toValue: 0.08, duration: 5000, useNativeDriver: false }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(drift, { toValue: 1, duration: 8000, useNativeDriver: false }),
            Animated.timing(drift, { toValue: 0, duration: 8000, useNativeDriver: false }),
          ])
        ),
      ])
    ).start();
  }, []);

  const blueX = drift.interpolate({ inputRange: [0, 1], outputRange: [-W * 0.05, W * 0.05] });
  const blueY = drift.interpolate({ inputRange: [0, 1], outputRange: [-H * 0.03, H * 0.03] });
  const tealX = drift.interpolate({ inputRange: [0, 1], outputRange: [W * 0.05, -W * 0.05] });
  const tealY = drift.interpolate({ inputRange: [0, 1], outputRange: [H * 0.04, -H * 0.04] });

  return (
    <View style={[st.container, { pointerEvents: 'none' as const }]}>
      <Animated.View
        style={[
          st.orb,
          { backgroundColor: '#3b82f6' },
          { opacity: pulse1, width: W * 0.9, height: H * 0.7, top: -H * 0.2, left: -W * 0.3, transform: [{ translateX: blueX }, { translateY: blueY }] },
        ]}
      />
      <Animated.View
        style={[
          st.orb,
          { backgroundColor: '#00e5c7' },
          { opacity: pulse2, width: W * 0.85, height: H * 0.65, bottom: -H * 0.15, right: -W * 0.25, transform: [{ translateX: tealX }, { translateY: tealY }] },
        ]}
      />
    </View>
  );
}

export default function BackgroundGradient() {
  if (Platform.OS === 'web') return <WebGradient />;
  return <NativeGradient />;
}

const st = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
});
