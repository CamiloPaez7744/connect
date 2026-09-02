import { useState, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, Animated,
  TouchableOpacity, PanResponder, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, GLASS, SHADOW, NEON } from '../tokens';

const { width: SCREEN_W } = Dimensions.get('window');

interface EvervaultCardProps {
  item: any;
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  safetyColor?: string;
  safetyLabel?: string;
  style?: any;
}

export default function EvervaultCard({
  item,
  onPress,
  onFavorite,
  isFavorite = false,
  safetyColor = T.success,
  safetyLabel = 'Safe',
  style,
}: EvervaultCardProps) {
  const [hovered, setHovered] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(0)).current;

  const imgId = String(item.id).padStart(3, '0');

  // Shimmer animation
  const startShimmer = () => {
    shimmerX.setValue(-SCREEN_W);
    Animated.loop(
      Animated.timing(shimmerX, {
        toValue: SCREEN_W,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopShimmer = () => {
    shimmerX.stopAnimation();
    shimmerX.setValue(-SCREEN_W);
  };

  const handlePressIn = () => {
    setHovered(true);
    Animated.parallel([
      Animated.spring(glowAnim, { toValue: 1, useNativeDriver: false }),
      Animated.spring(borderAnim, { toValue: 1, useNativeDriver: false }),
    ]).start();
    startShimmer();
  };

  const handlePressOut = () => {
    setHovered(false);
    Animated.parallel([
      Animated.spring(glowAnim, { toValue: 0, useNativeDriver: false }),
      Animated.spring(borderAnim, { toValue: 0, useNativeDriver: false }),
    ]).start(() => stopShimmer());
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,229,199,0)', 'rgba(0,229,199,0.25)'],
  });

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.08)', 'rgba(0,229,199,0.5)'],
  });

  const labelOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View
      style={[
        st.card,
        {
          shadowColor: T.primary,
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.15, 0.5],
          }),
          shadowRadius: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [12, 28],
          }),
          borderColor,
        },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={st.imageWrap}>
          <Image
            source={{ uri: `/images/${imgId}.png` }}
            style={st.image}
            resizeMode="contain"
          />

          {/* Neon gradient overlay on hover */}
          <Animated.View style={[st.gradientOverlay, { opacity: glowAnim }]}>
            <View style={st.gradientTop} />
            <View style={st.gradientBottom} />
          </Animated.View>

          {/* Shimmer line */}
          <Animated.View
            style={[
              st.shimmerLine,
              { transform: [{ translateX: shimmerX }] },
            ]}
          />

          {/* Hover label */}
          <Animated.View style={[st.hoverLabel, { opacity: labelOpacity }]}>
            <Ionicons name="eye" size={16} color="#fff" />
            <Text style={st.hoverLabelText}>Ver detalles</Text>
          </Animated.View>

          {/* Safety badge */}
          <View style={[st.safetyBadge, { backgroundColor: safetyColor }]}>
            <Text style={st.safetyText}>{safetyLabel}</Text>
          </View>

          {/* Favorite button */}
          <TouchableOpacity
            style={st.favBtn}
            onPress={onFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={18}
              color={isFavorite ? T.accent : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <View style={st.info}>
          <Text style={st.title} numberOfLines={1}>{item.nameEs}</Text>
          <Text style={st.id}>#{item.id}</Text>
          {item.tags?.length > 0 && (
            <View style={st.tagRow}>
              {item.tags.slice(0, 2).map((tag: string, i: number) => (
                <View key={i} style={st.tag}>
                  <Text style={st.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  card: {
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(26,31,53,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...SHADOW.md,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // Neon cyan gradient from top
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,229,199,0.3)',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    // Neon magenta gradient from bottom
    borderTopWidth: 2,
    borderTopColor: 'rgba(247,37,133,0.3)',
  },
  shimmerLine: {
    position: 'absolute',
    top: 0,
    width: 120,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ skewX: '-20deg' }],
  },
  hoverLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.sm,
  },
  hoverLabelText: {
    color: '#fff',
    fontSize: FS.xs,
    fontFamily: F.medium,
  },
  safetyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.sm,
  },
  safetyText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: F.bold,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: R.sm,
    padding: 6,
  },
  info: {
    padding: S.md,
    gap: 4,
  },
  title: {
    fontSize: FS.base,
    fontFamily: F.semibold,
    color: T.text,
  },
  id: {
    fontSize: FS.xs,
    color: T.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: S.xs,
  },
  tag: {
    backgroundColor: 'rgba(0,229,199,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontFamily: F.medium,
    color: T.primary,
  },
});
