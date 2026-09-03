import { useState, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, Animated,
  TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, GLASS, SHADOW } from '../tokens';
import { imageMap } from '../imageMap';

const { width: SCREEN_W } = Dimensions.get('window');

const SAFETY_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  'Safe': { color: T.success, label: 'Segura', icon: '🟢' },
  'Be careful': { color: T.warning, label: 'Moderada', icon: '🟡' },
  'Risky': { color: T.danger, label: 'Arriesgada', icon: '🔴' },
};

const CAT_ICONS: Record<string, string> = {
  cowgirl: '🤠', doggy: '🐕', face_to_face: '😍', standing: '🧍',
  spooning: '🥄', sitting: '🪑', kneeling: '🙏', lying: '🛏️',
  oral: '💋', anal: '🔥', reverse: '🔄', sideways: '↔️',
  criss_cross: '✳️', man_on_top: '💪',
};

interface EvervaultCardProps {
  item: any;
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

function getTips(item: any): string[] {
  const tips: string[] = [];
  const tags = item.tags || [];
  const cats = item.categories || [];
  if (cats.includes('face_to_face') || tags.includes('cara a cara')) tips.push('Manten contacto visual');
  if (cats.includes('oral')) tips.push('Usa las manos como complemento');
  if (item.safety === 'Risky') tips.push('Comunicate con tu pareja');
  if (tags.includes('mujer arriba')) tips.push(' ella controla el ritmo');
  if (tags.includes('hombre arriba')) tips.push('El control lo lleva él');
  if (cats.includes('spooning') || tags.includes('cucharas')) tips.push('Ideal para relajarse');
  if (cats.includes('standing')) tips.push('Usa superficie de apoyo');
  if (cats.includes('anal')) tips.push('Usa lubricante abundante');
  if (cats.includes('lying')) tips.push('Acomoda almohadas');
  if (tips.length < 2) tips.push('Explora a tu ritmo');
  return tips.slice(0, 3);
}

export default function EvervaultCard({
  item,
  onPress,
  onFavorite,
  isFavorite = false,
}: EvervaultCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const imgId = String(item.id).padStart(3, '0');
  const safety = SAFETY_CONFIG[item.safety] || SAFETY_CONFIG['Safe'];
  const tips = getTips(item);
  const categories = (item.categories || []).slice(0, 3);

  const toggleInfo = () => {
    if (showInfo) {
      Animated.timing(flipAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start(() => setShowInfo(false));
    } else {
      setShowInfo(true);
      Animated.timing(flipAnim, { toValue: 1, duration: 250, useNativeDriver: false }).start();
    }
  };

  const handlePressIn = () => {
    Animated.spring(glowAnim, { toValue: 1, useNativeDriver: false }).start();
  };

  const handlePressOut = () => {
    Animated.spring(glowAnim, { toValue: 0, useNativeDriver: false }).start();
  };

  const glowBorder = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,229,199,0.08)', 'rgba(0,229,199,0.3)'],
  });

  const infoOpacity = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[st.card, { borderColor: glowBorder }]}>
      {!showInfo ? (
        // FRONT — image
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleInfo}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={st.imageWrap}>
            <Image source={Platform.OS === 'web' ? { uri: `/images/${imgId}.png` } : (imageMap[imgId] || imageMap['001'])} style={st.image} resizeMode="cover" />
            <View style={st.imageOverlay} />
            <View style={[st.safetyBadge, { backgroundColor: safety.color }]}>
              <Text style={st.safetyText}>{safety.label}</Text>
            </View>
            <TouchableOpacity
              style={st.favBtn}
              onPress={onFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={18} color={isFavorite ? T.accent : '#fff'} />
            </TouchableOpacity>
            <View style={st.frontBottom}>
              <Text style={st.frontTitle} numberOfLines={1}>{item.nameEs}</Text>
              <Text style={st.frontId}>#{item.id}</Text>
            </View>
          </View>
          <View style={st.frontInfo}>
            <View style={st.tagRow}>
              {categories.map((cat: string, i: number) => (
                <View key={i} style={st.catTag}>
                  <Text style={st.catTagText}>{CAT_ICONS[cat] || '•'} {cat.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        // BACK — ficha técnica
        <Animated.View style={[st.infoWrap, { opacity: infoOpacity }]}>
          <TouchableOpacity activeOpacity={0.85} onPress={toggleInfo} style={st.infoContent}>
            <View style={st.infoHeader}>
              <Text style={st.infoTitle}>{item.nameEs}</Text>
              <View style={[st.safetyBadgeSmall, { backgroundColor: safety.color }]}>
                <Text style={st.safetyTextSmall}>{safety.icon} {safety.label}</Text>
              </View>
            </View>

            <View style={st.infoSection}>
              <Text style={st.infoSectionTitle}>Categorías</Text>
              <View style={st.tagRow}>
                {categories.map((cat: string, i: number) => (
                  <View key={i} style={st.infoTag}>
                    <Text style={st.infoTagText}>{CAT_ICONS[cat] || '•'} {cat.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={st.infoSection}>
              <Text style={st.infoSectionTitle}>Tips</Text>
              {tips.map((tip, i) => (
                <View key={i} style={st.tipRow}>
                  <Ionicons name="bulb-outline" size={14} color="#ffd166" />
                  <Text style={st.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={st.infoSection}>
              <Text style={st.infoSectionTitle}>Tags</Text>
              <View style={st.tagRow}>
                {(item.tags || []).slice(0, 5).map((tag: string, i: number) => (
                  <View key={i} style={st.tagMini}>
                    <Text style={st.tagMiniText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={st.infoFooter}>
              <Text style={st.infoFooterText}>Toca para volver</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const st = StyleSheet.create({
  card: {
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(26,31,53,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,199,0.08)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3), 0 0 6px rgba(0,229,199,0.08)',
  },

  // FRONT
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#0a0d14',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,229,199,0.1)',
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
  frontBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: S.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  frontTitle: {
    fontSize: FS.base,
    fontFamily: F.semibold,
    color: '#fff',
  },
  frontId: {
    fontSize: FS.xs,
    color: 'rgba(255,255,255,0.4)',
  },
  frontInfo: {
    padding: S.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  catTag: {
    backgroundColor: 'rgba(0,229,199,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,229,199,0.15)',
  },
  catTagText: {
    fontSize: 10,
    fontFamily: F.medium,
    color: T.primary,
    textTransform: 'capitalize' as const,
  },

  // BACK — ficha técnica
  infoWrap: {
    padding: S.lg,
    minHeight: 280,
  },
  infoContent: {
    gap: S.md,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: FS.lg,
    fontFamily: F.display,
    color: T.text,
    flex: 1,
  },
  safetyBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
  },
  safetyTextSmall: {
    color: '#fff',
    fontSize: 10,
    fontFamily: F.bold,
  },
  infoSection: {
    gap: 6,
  },
  infoSectionTitle: {
    fontSize: FS.xs,
    fontFamily: F.semibold,
    color: T.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  infoTag: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
  },
  infoTagText: {
    fontSize: 10,
    fontFamily: F.medium,
    color: '#3b82f6',
    textTransform: 'capitalize' as const,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipText: {
    fontSize: FS.xs,
    fontFamily: F.regular,
    color: T.textSecondary,
    flex: 1,
  },
  tagMini: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagMiniText: {
    fontSize: 10,
    fontFamily: F.medium,
    color: T.textMuted,
  },
  infoFooter: {
    alignItems: 'center',
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  infoFooterText: {
    fontSize: FS.xs,
    color: T.textMuted,
  },
});
