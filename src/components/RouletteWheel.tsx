import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Platform } from 'react-native';
import { Svg, Path, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, SHARED, GLASS, SHADOW } from '../tokens';

// Color palette — vibrant, distinct, no two adjacent will clash
const COLOR_PALETTE = [
  '#f72585', // Magenta
  '#4cc9f0', // Cyan
  '#ffd166', // Yellow
  '#06d6a0', // Green
  '#7b2ff7', // Purple
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#ff9f1c', // Orange
  '#2ec4b6', // Teal
  '#e71d36', // Crimson
  '#a855f7', // Violet
  '#10b981', // Emerald
];

function degToRad(deg: number) { return (deg * Math.PI) / 180; }

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = degToRad(endAngle - 90);
  const end = degToRad(startAngle - 90);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2} Z`;
}

/** Ensure no two adjacent segments share the same color */
function assignColors(items: RouletteItem[]): string[] {
  const colors: string[] = [];
  const usedLast: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.color) {
      colors.push(item.color);
      usedLast.push(item.color);
    } else {
      // Pick from palette avoiding the last used color
      const lastColor = i > 0 ? colors[i - 1] : '';
      const prevPrevColor = i > 1 ? colors[i - 2] : '';
      let picked = COLOR_PALETTE.find(c => c !== lastColor && c !== prevPrevColor && !usedLast.slice(-2).includes(c))
        || COLOR_PALETTE.find(c => c !== lastColor)
        || COLOR_PALETTE[i % COLOR_PALETTE.length];
      colors.push(picked);
      usedLast.push(picked);
    }
  }

  // Second pass: fix any adjacency issues from user-provided colors
  for (let i = 0; i < colors.length; i++) {
    const next = (i + 1) % colors.length;
    if (colors[i] === colors[next]) {
      const alt = COLOR_PALETTE.find(c => c !== colors[i] && c !== colors[(i - 1 + colors.length) % colors.length] && c !== colors[(next + 1) % colors.length]);
      if (alt) colors[next] = alt;
    }
  }

  return colors;
}

export interface RouletteItem {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  image?: string;
}

interface RouletteWheelProps {
  items: RouletteItem[];
  size?: number;
  centerLabel?: string;
  spinning?: boolean;
  onSpinStart?: () => void;
  onSpinEnd?: (item: RouletteItem, index: number) => void;
  visible?: boolean;
  onClose?: () => void;
  resultTitle?: string;
}

export default function RouletteWheel({
  items,
  size = 280,
  centerLabel = 'GIRAR',
  spinning: externalSpinning,
  onSpinStart,
  onSpinEnd,
  visible = false,
  onClose,
  resultTitle,
}: RouletteWheelProps) {
  const [internalSpinning, setInternalSpinning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'landing' | 'done'>('idle');
  const [pickedItem, setPickedItem] = useState<RouletteItem | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number>(-1);

  const wheelRotation = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;

  const isSpinning = externalSpinning ?? internalSpinning;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const segmentAngle = 360 / items.length;
  const colors = assignColors(items);

  // Reset phase when modal reopens
  useEffect(() => {
    if (visible) {
      setPhase('idle');
      setPickedItem(null);
      setPickedIndex(-1);
      wheelRotation.setValue(0);
    }
  }, [visible]);

  const spin = () => {
    if (phase === 'spinning' || items.length < 2) return;
    setInternalSpinning(true);
    setPhase('spinning');
    resultFade.setValue(0);
    onSpinStart?.();

    const targetIdx = Math.floor(Math.random() * items.length);
    const extraSpins = 6 + Math.floor(Math.random() * 5);
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const targetAngle = targetIdx * segmentAngle + segmentAngle / 2 + randomOffset;
    const totalSpin = extraSpins * 360 + (360 - targetAngle);
    const duration = 3000 + Math.floor(Math.random() * 2000);

    wheelRotation.setValue(0);
    Animated.timing(wheelRotation, { toValue: totalSpin, duration, useNativeDriver: true }).start(() => {
      setPickedItem(items[targetIdx]);
      setPickedIndex(targetIdx);
      setPhase('landing');

      bounceAnim.setValue(0.3);
      resultFade.setValue(0);
      Animated.parallel([
        Animated.spring(bounceAnim, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
        Animated.timing(resultFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setPhase('done');
        setInternalSpinning(false);
        setTimeout(() => {
          onSpinEnd?.(items[targetIdx], targetIdx);
        }, 900);
      });
    });
  };

  const wheelSpin = wheelRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const renderWheel = () => (
    <View style={[s.wheelWrap, { width: size, height: size }]}>
      {/* Pointer */}
      <View style={s.pointer}>
        <View style={s.pointerTriangle} />
      </View>

      {/* Spinning wheel */}
      <Animated.View style={[{ width: size, height: size }, { transform: [{ rotate: wheelSpin }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            {items.map((item, i) => (
              <RadialGradient key={item.id} id={`rg-${item.id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors[i]} stopOpacity="1" />
                <Stop offset="100%" stopColor={colors[i]} stopOpacity="0.7" />
              </RadialGradient>
            ))}
          </Defs>
          {/* Outer ring */}
          <Circle cx={cx} cy={cy} r={r + 6} fill="#2a2a3a" />
          <Circle cx={cx} cy={cy} r={r + 3} fill="#4a4a5a" />
          <Circle cx={cx} cy={cy} r={r + 1} fill="#3a3a4a" />
          {/* Segments */}
          {items.map((item, i) => {
            const start = i * segmentAngle;
            const end = (i + 1) * segmentAngle;
            return <Path key={item.id} d={describeArc(cx, cy, r, start, end)} fill={`url(#rg-${item.id})`} />;
          })}
          {/* Divider lines */}
          {items.map((item, i) => {
            const angle = degToRad(i * segmentAngle - 90);
            const x1 = cx + 20 * Math.cos(angle);
            const y1 = cy + 20 * Math.sin(angle);
            const x2 = cx + (r + 1) * Math.cos(angle);
            const y2 = cy + (r + 1) * Math.sin(angle);
            return <Path key={`d-${item.id}`} d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke="#2a2a3a" strokeWidth="2.5" />;
          })}
        </Svg>

        {/* Icons/text overlay */}
        {items.map((item, i) => {
          const midAngle = degToRad(i * segmentAngle + segmentAngle / 2 - 90);
          const iconR = r * 0.62;
          const ix = cx + iconR * Math.cos(midAngle);
          const iy = cy + iconR * Math.sin(midAngle);
          if (item.image) {
            return null;
          }
          if (item.icon) {
            return (
              <Text key={`ic-${item.id}`} style={[s.segIcon, { left: ix - 16, top: iy - 16, fontSize: size > 240 ? 26 : 20 }]}>
                {item.icon}
              </Text>
            );
          }
          // Show truncated label text
          const maxChars = Math.floor(size / 40);
          const displayText = item.label.length > maxChars ? item.label.slice(0, maxChars) + '…' : item.label;
          return (
            <Text key={`ic-${item.id}`} style={[s.segLabel, { left: ix - 30, top: iy - 10, width: 60, fontSize: size > 240 ? 10 : 8 }]}>
              {displayText}
            </Text>
          );
        })}
      </Animated.View>

      {/* Center button */}
      <View style={[s.centerOuter, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14, top: cy - size * 0.14, left: cx - size * 0.14 }]}>
        <TouchableOpacity style={[s.centerBtn, { width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11 }]} onPress={spin} disabled={isSpinning}>
          <Text style={[s.centerText, { fontSize: size > 240 ? FS.sm : FS.xs }]}>{isSpinning ? '...' : centerLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResult = () => pickedItem && (
    <Animated.View style={{ alignItems: 'center', opacity: resultFade, transform: [{ scale: bounceAnim }] }}>
      {pickedItem.image ? (
        <View style={[s.resultImage, { borderColor: colors[pickedIndex] + '60' }]}>
          <Text style={{ fontSize: 48 }}>{pickedItem.icon || '🎯'}</Text>
        </View>
      ) : (
        <Text style={[s.resultIcon, { color: colors[pickedIndex] }]}>{pickedItem.icon || '🎯'}</Text>
      )}
      <Text style={[s.resultLabel, { color: colors[pickedIndex] }]}>{pickedItem.label}</Text>
      {resultTitle && <Text style={s.resultSub}>{resultTitle}</Text>}
    </Animated.View>
  );

  // Modal mode
  if (visible !== undefined) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalContent}>
            {phase !== 'done' && renderWheel()}
            {phase === 'done' && renderResult()}
          </View>
        </View>
      </Modal>
    );
  }

  // Inline mode
  return (
    <View style={s.inlineWrap}>
      {phase !== 'done' && renderWheel()}
      {phase === 'done' && renderResult()}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { alignItems: 'center', padding: S.xl },
  inlineWrap: { alignItems: 'center', paddingVertical: S.md },

  wheelWrap: { alignItems: 'center', marginBottom: S.xl },
  pointer: { position: 'absolute', top: -6, zIndex: 10, alignItems: 'center' },
  pointerTriangle: {
    width: 0, height: 0,
    borderLeftWidth: 14, borderRightWidth: 14, borderTopWidth: 22,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
  },
  segIcon: { position: 'absolute', width: 32, height: 32, textAlign: 'center' },
  segLabel: { position: 'absolute', textAlign: 'center', color: '#fff', fontFamily: F.semibold, textShadow: '0 1px 3px rgba(0,0,0,0.6)' },

  centerOuter: {
    position: 'absolute',
    backgroundColor: '#3a3a4a',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
  },
  centerBtn: {
    backgroundColor: '#e8e8e8',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15), 0 1px 2px rgba(255,255,255,0.3)',
  },
  centerText: { fontFamily: F.extrabold, color: '#333', letterSpacing: 1 },

  resultImage: { width: 80, height: 80, borderRadius: 40, ...GLASS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: S.md },
  resultIcon: { fontSize: 72, marginBottom: S.md },
  resultLabel: { fontSize: FS['2xl'], fontFamily: F.display, marginBottom: S.xs },
  resultSub: { fontSize: FS.base, fontFamily: F.regular, color: T.textSecondary },

  spinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, backgroundColor: '#7b2ff7', paddingHorizontal: S.xl, paddingVertical: S.md, borderRadius: R.lg, boxShadow: '0 2px 12px rgba(123,47,247,0.25)' },
  spinBtnText: { color: '#fff', fontSize: FS.base, fontFamily: F.semibold },
});
