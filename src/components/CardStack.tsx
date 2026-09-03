import { useState, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, Animated,
  PanResponder, Dimensions, TouchableOpacity, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, GLASS, SHADOW, NEON } from '../tokens';
import { imageMap } from '../imageMap';

const SCREEN_W = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_W * 0.25;
const CARD_W = Math.min(SCREEN_W - 48, 400);
const CARD_H = CARD_W * 1.2;

interface CardStackProps {
  items: any[];
  onCardPress?: (item: any) => void;
  onFavorite?: (id: number) => void;
  onSwipeRight?: (item: any) => void;
  favorites?: number[];
  getSafetyColor?: (s: string) => string;
  getSafetyLabel?: (s: string) => string;
}

export default function CardStack({
  items,
  onCardPress,
  onFavorite,
  onSwipeRight,
  favorites = [],
  getSafetyColor,
  getSafetyLabel,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [disliked, setDisliked] = useState<number[]>([]);

  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        pan.setValue({ x: g.dx, y: g.dy });
        const progress = Math.min(Math.abs(g.dx) / SWIPE_THRESHOLD, 1);
        scale.setValue(0.95 + progress * 0.05);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          swipe('right');
        } else if (g.dx < -SWIPE_THRESHOLD) {
          swipe('left');
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
          Animated.spring(scale, { toValue: 0.95, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const swipe = (dir: 'left' | 'right') => {
    const x = dir === 'right' ? SCREEN_W : -SCREEN_W;
    Animated.parallel([
      Animated.timing(pan, { toValue: { x, y: 0 }, duration: 300, useNativeDriver: false }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start(() => {
      if (dir === 'right') {
        setLiked(p => [...p, items[currentIndex]?.id]);
        onSwipeRight?.(items[currentIndex]);
      } else {
        setDisliked(p => [...p, items[currentIndex]?.id]);
      }
      pan.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      scale.setValue(0.95);
      setCurrentIndex(p => p + 1);
    });
  };

  const reset = () => {
    setCurrentIndex(0);
    setLiked([]);
    setDisliked([]);
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
    scale.setValue(0.95);
  };

  if (!items.length) {
    return (
      <View style={st.empty}>
        <Ionicons name="layers-outline" size={48} color={T.textMuted} />
        <Text style={st.emptyText}>Sin posiciones</Text>
      </View>
    );
  }

  if (currentIndex >= items.length) {
    return (
      <View style={st.empty}>
        <Ionicons name="checkmark-circle-outline" size={48} color={T.primary} />
        <Text style={[st.emptyText, { color: T.primary }]}>¡Exploraste todas!</Text>
        <Text style={st.emptySub}>{liked.length} favoritas · {disliked.length} descartadas</Text>
        <TouchableOpacity style={st.resetBtn} onPress={reset}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={st.resetBtnText}>Empezar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = items[currentIndex];
  const next = items[currentIndex + 1];
  const imgId = String(current.id).padStart(3, '0');

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={st.container}>
        {/* Next card (behind) */}
        {next && (
          <View style={[st.card, st.cardBehind]}>
            <Image
              source={Platform.OS === 'web' ? { uri: `/images/${String(next.id).padStart(3, '0')}.png` } : (imageMap[String(next.id).padStart(3, '0')] || imageMap['001'])}
              style={st.cardImage}
              resizeMode="cover"
            />
            <View style={[st.cardOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
          </View>
        )}

        {/* Current card (swipeable) */}
        <Animated.View
          style={[
            st.card,
            st.cardFront,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate },
                { scale },
              ],
              opacity,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={() => onCardPress?.(current)}>
            <Image
              source={Platform.OS === 'web' ? { uri: `/images/${imgId}.png` } : (imageMap[imgId] || imageMap['001'])}
              style={st.cardImage}
              resizeMode="cover"
            />
            <View style={st.cardOverlay}>
              <View style={st.cardHeader}>
                <View style={[st.safetyBadge, { backgroundColor: getSafetyColor(current.safety) }]}>
                  <Text style={st.safetyText}>{getSafetyLabel(current.safety)}</Text>
                </View>
                <TouchableOpacity
                  style={st.favBtn}
                  onPress={() => onFavorite?.(current.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={favorites.includes(current.id) ? 'star' : 'star-outline'}
                    size={22}
                    color={favorites.includes(current.id) ? T.accent : '#fff'}
                  />
                </TouchableOpacity>
              </View>

              <View style={st.cardBottom}>
                <Text style={st.cardTitle}>{current.nameEs}</Text>
                <Text style={st.cardId}>#{current.id}</Text>
                {current.tags?.length > 0 && (
                  <View style={st.tagRow}>
                    {current.tags.slice(0, 3).map((tag: string, i: number) => (
                      <View key={i} style={st.tag}>
                        <Text style={st.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* LIKE overlay */}
            <Animated.View style={[st.labelOverlay, { opacity: likeOpacity, left: 20 }]}>
              <View style={[st.label, { borderColor: T.primary }]}>
                <Text style={[st.labelText, { color: T.primary }]}>LIKE</Text>
              </View>
            </Animated.View>

            {/* NOPE overlay */}
            <Animated.View style={[st.labelOverlay, { opacity: nopeOpacity, right: 20, left: undefined }]}>
              <View style={[st.label, { borderColor: T.accent }]}>
                <Text style={[st.labelText, { color: T.accent }]}>NOPE</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Action buttons */}
        <View style={st.actions}>
          <TouchableOpacity style={[st.actionBtn, st.actionNope]} onPress={() => swipe('left')}>
            <Ionicons name="close" size={28} color={T.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.actionBtn, st.actionInfo]}
            onPress={() => onCardPress?.(current)}
          >
            <Ionicons name="information" size={24} color={T.info} />
          </TouchableOpacity>
          <TouchableOpacity style={[st.actionBtn, st.actionLike]} onPress={() => swipe('right')}>
            <Ionicons name="star" size={28} color={T.primary} />
          </TouchableOpacity>
        </View>

        {/* Counter */}
        <Text style={st.counter}>{currentIndex + 1} / {items.length}</Text>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.lg,
    paddingVertical: S.lg,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 90,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: '#0a0d14',
    ...SHADOW.lg,
  },
  cardBehind: {
    position: 'absolute',
    opacity: 0.5,
    transform: [{ scale: 0.92 }, { translateY: 16 }],
  },
  cardFront: {
    zIndex: 1,
  },
  cardImage: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#111',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: S.lg,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  safetyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.sm,
  },
  safetyText: {
    color: '#fff',
    fontSize: FS.xs,
    fontFamily: F.bold,
  },
  favBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: R.sm,
    padding: 8,
  },
  cardBottom: {
    gap: 4,
  },
  cardTitle: {
    fontSize: FS['2xl'],
    fontFamily: F.display,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  cardId: {
    fontSize: FS.sm,
    fontFamily: F.regular,
    color: 'rgba(255,255,255,0.5)',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: S.xs,
  },
  tag: {
    backgroundColor: 'rgba(0,229,199,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,229,199,0.3)',
  },
  tagText: {
    fontSize: FS.xs,
    fontFamily: F.medium,
    color: T.primary,
  },

  // Swipe labels
  labelOverlay: {
    position: 'absolute',
    top: 40,
  },
  label: {
    borderWidth: 3,
    borderRadius: R.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  labelText: {
    fontSize: FS['2xl'],
    fontFamily: F.display,
    fontWeight: '900',
  },

  // Action buttons
  actions: {
    flexDirection: 'row',
    gap: S.lg,
    alignItems: 'center',
    paddingTop: S.lg,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...SHADOW.md,
  },
  actionNope: {
    backgroundColor: 'rgba(247,37,133,0.1)',
    borderColor: 'rgba(247,37,133,0.3)',
  },
  actionInfo: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.3)',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  actionLike: {
    backgroundColor: 'rgba(0,229,199,0.1)',
    borderColor: 'rgba(0,229,199,0.3)',
  },

  counter: {
    fontSize: FS.sm,
    fontFamily: F.medium,
    color: T.textMuted,
    paddingTop: S.sm,
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.md,
  },
  emptyText: {
    fontSize: FS.xl,
    fontFamily: F.semibold,
    color: T.textSecondary,
  },
  emptySub: {
    fontSize: FS.sm,
    color: T.textMuted,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: T.primary,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderRadius: R.md,
    marginTop: S.md,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: FS.base,
    fontFamily: F.bold,
  },
});
