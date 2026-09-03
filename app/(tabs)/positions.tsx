import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, useWindowDimensions, Image, Modal, Animated, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, BP, SHARED, GLASS, SHADOW, NEON, useResponsive } from '../../src/tokens';
import { imageMap } from '../../src/imageMap';
import CardStack from '../../src/components/CardStack';
import EvervaultCard from '../../src/components/EvervaultCard';
import BackgroundGradient from '../../src/components/BackgroundGradient';
import RatingModal from '../../src/components/RatingModal';
import RouletteWheel, { RouletteItem } from '../../src/components/RouletteWheel';

function getImageSource(id: number) {
  const key = String(id).padStart(3, '0');
  if (Platform.OS === 'web') return { uri: `/images/${key}.png` };
  return imageMap[key] || imageMap['001'];
}

const FILTER_GROUPS = [
  {
    label: 'Nivel',
    icon: '📊',
    items: [
      { id: 'safe', name: 'Segura', icon: '🟢', color: T.success, safety: 'Safe' },
      { id: 'moderate', name: 'Moderada', icon: '🟡', color: T.warning, safety: 'Be careful' },
      { id: 'risky', name: 'Arriesgada', icon: '🔴', color: T.danger, safety: 'Risky' },
    ],
  },
  {
    label: 'Lugar',
    icon: '📍',
    items: [
      { id: 'cama', name: 'Cama', icon: '🛏️', color: T.primary, tags: ['en la cama'] },
      { id: 'silla', name: 'Silla', icon: '🪑', color: '#118ab2', tags: ['en silla', 'en sillón', 'sillón'] },
      { id: 'sofa', name: 'Sofá', icon: '🛋️', color: '#7b2ff7', tags: ['en sofá', 'sofá'] },
      { id: 'mesa', name: 'Mesa', icon: '🍽️', color: '#ffd166', tags: ['en mesa'] },
      { id: 'pelota', name: 'Pelota', icon: '⚽', color: '#f59e0b', tags: ['en pelota'] },
    ],
  },
  {
    label: 'Posición',
    icon: '💃',
    items: [
      { id: 'all', name: 'Todas', icon: '✨', color: T.primary, tags: [] },
      { id: 'doggy', name: 'Doggy', icon: '🐕', color: '#f72585', tags: ['doggy', 'por detrás', 'entrada trasera'] },
      { id: 'cowgirl', name: 'Cowgirl', icon: '🤠', color: '#7b2ff7', tags: ['cowgirl', 'mujer arriba'] },
      { id: 'man_top', name: 'H arriba', icon: '💪', color: '#118ab2', tags: ['hombre arriba'] },
      { id: 'spooning', name: 'Cucharas', icon: '🥄', color: '#06d6a0', tags: ['cucharas', 'cucharas reversa'] },
      { id: 'standing', name: 'De pie', icon: '🧍', color: '#ffd166', tags: ['de pie', 'de pie y cargando'] },
      { id: 'oral', name: 'Oral', icon: '💋', color: '#f72585', tags: ['sexo oral', 'cunnilingus'] },
      { id: 'anal', name: 'Anal', icon: '🔥', color: '#ef4444', tags: ['sexo anal', 'juego anal'] },
      { id: 'face_to_face', name: 'Cara a cara', icon: '😍', color: '#f72585', tags: ['cara a cara'] },
      { id: 'sitting', name: 'Sentados', icon: '🪑', color: '#ef4444', tags: ['sentados'] },
      { id: 'kneeling', name: 'Arrodillados', icon: '🙏', color: '#f59e0b', tags: ['arrodillados'] },
      { id: 'lying', name: 'Acostados', icon: '🛏️', color: '#4cc9f0', tags: ['acostados'] },
      { id: 'sideways', name: 'De lado', icon: '↔️', color: '#06d6a0', tags: ['de lado'] },
      { id: 'reverse', name: 'Reversa', icon: '🔄', color: '#4cc9f0', tags: ['reversa'] },
    ],
  },
];

const ALL_FILTER_ITEMS = FILTER_GROUPS.flatMap(g => g.items);

type SubView = 'menu' | 'random' | 'catalog' | 'mylist';
type MyListTab = 'favorites' | 'done' | 'skipped' | 'toTry';
type ViewMode = 'grid' | 'stack' | 'evervault';
type MyListViewMode = 'cards' | 'simple';

const VIEW_MODES: { key: ViewMode; icon: string; label: string }[] = [
  { key: 'grid', icon: 'grid', label: 'Cuadrícula' },
  { key: 'stack', icon: 'layers', label: 'Stack' },
  { key: 'evervault', icon: 'square', label: 'Tarjetas' },
];

export default function PositionsScreen() {
  const { width } = useWindowDimensions();
  const R2 = useResponsive(width);
  const isDesktop = width >= BP.lg;

  const [positions, setPositions] = useState<any[]>([]);
  const [subView, setSubView] = useState<SubView>('menu');
  const [myListTab, setMyListTab] = useState<MyListTab>('favorites');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [toTry, setToTry] = useState<number[]>([]);
  const [randomPos, setRandomPos] = useState<any>(null);
  const [randomDescExpanded, setRandomDescExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showViewPicker, setShowViewPicker] = useState(false);
  const [evervaultIndex, setEvervaultIndex] = useState(0);
  const [myListViewMode, setMyListViewMode] = useState<MyListViewMode>('cards');
  const [ratings, setRatings] = useState<any>({});
  const [herName, setHerName] = useState('');
  const [hisName, setHisName] = useState('');
  const [ratingModalPos, setRatingModalPos] = useState<any>(null);
  const [hechasFilter, setHechasFilter] = useState<'all' | 'her' | 'his' | 'super'>('all');
  const [showHechasFilters, setShowHechasFilters] = useState(false);
  const [toTryRouletteOpen, setToTryRouletteOpen] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const diceAnim = useRef(new Animated.Value(0)).current;
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    fetch('/data/positions.json')
      .then(r => r.json())
      .then(d => setPositions(d))
      .catch(() => setPositions(require('../../data/positions.json')));
  }, []);

  useEffect(() => {
    try {
      const f = localStorage?.getItem('pos_favorites');
      const d = localStorage?.getItem('pos_done');
      const s = localStorage?.getItem('pos_skipped');
      const t = localStorage?.getItem('pos_toTry');
      const v = localStorage?.getItem('pos_viewMode');
      const r = localStorage?.getItem('pos_ratings');
      const hn = localStorage?.getItem('couple_herName');
      const hs = localStorage?.getItem('couple_hisName');
      if (f) setFavorites(JSON.parse(f));
      if (d) setDone(JSON.parse(d));
      if (s) setSkipped(JSON.parse(s));
      if (t) setToTry(JSON.parse(t));
      if (v && ['grid', 'stack', 'evervault'].includes(v)) setViewMode(v as ViewMode);
      if (r) setRatings(JSON.parse(r));
      if (hn) setHerName(hn);
      if (hs) setHisName(hs);
    } catch {}
  }, []);

  useEffect(() => { try { localStorage?.setItem('pos_favorites', JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => { try { localStorage?.setItem('pos_done', JSON.stringify(done)); } catch {} }, [done]);
  useEffect(() => { try { localStorage?.setItem('pos_skipped', JSON.stringify(skipped)); } catch {} }, [skipped]);
  useEffect(() => { try { localStorage?.setItem('pos_toTry', JSON.stringify(toTry)); } catch {} }, [toTry]);
  useEffect(() => { try { localStorage?.setItem('pos_viewMode', viewMode); } catch {} }, [viewMode]);
  useEffect(() => { try { localStorage?.setItem('pos_ratings', JSON.stringify(ratings)); } catch {} }, [ratings]);

  const saveRating = (positionId: number, perspective: 'ella' | 'el', rating: any) => {
    setRatings((prev: any) => ({
      ...prev,
      [positionId]: {
        ...prev[positionId],
        [perspective]: rating,
      },
    }));
  };

  const toggleFavorite = (id: number) => setFavorites(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
  const toggleDone = (id: number) => setDone(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
  const toggleSkipped = (id: number) => setSkipped(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
  const toggleToTry = (id: number) => setToTry(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
  const moveToDone = (id: number) => { setToTry(p => p.filter(f => f !== id)); setDone(p => p.includes(id) ? p : [...p, id]); };

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRandomPos(null);
    setRandomDescExpanded(false);
    Animated.sequence([
      Animated.timing(diceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(diceAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(diceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(diceAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(diceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(diceAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setRandomPos(positions[Math.floor(Math.random() * positions.length)]);
      setIsRolling(false);
    });
  };

  const diceRotate = diceAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  const getSafetyColor = (s: string) => s === 'Safe' ? T.success : s === 'Be careful' ? T.warning : T.danger;
  const getSafetyLabel = (s: string) => s === 'Safe' ? 'Segura' : s === 'Be careful' ? 'Moderada' : 'Arriesgada';

  const filtered = useMemo(() => {
    return positions.filter((p: any) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.nameEs.toLowerCase().includes(search.toLowerCase()) || p.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
      let matchCat = true;
      if (selectedCategory !== 'all') {
        const filterItem = ALL_FILTER_ITEMS.find(f => f.id === selectedCategory);
        if (filterItem) {
          if ('safety' in filterItem && filterItem.safety) {
            matchCat = p.safety === filterItem.safety;
          } else if ('tags' in filterItem && filterItem.tags) {
            matchCat = p.tags?.some((t: string) => (filterItem as any).tags.includes(t)) || false;
          }
        }
      }
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory, positions]);

  const mylistPositions = useMemo(() => {
    return positions.filter(p => myListTab === 'favorites' ? favorites.includes(p.id) : myListTab === 'done' ? done.includes(p.id) : myListTab === 'toTry' ? toTry.includes(p.id) : skipped.includes(p.id));
  }, [positions, favorites, done, skipped, toTry, myListTab]);

  const getAvgRating = (posId: number) => {
    const r = ratings[posId];
    if (!r) return 0;
    const scores: number[] = [];
    if (r.ella?.connection) scores.push(r.ella.connection);
    if (r.el?.connection) scores.push(r.el.connection);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const filteredDone = useMemo(() => {
    const donePositions = positions.filter(p => done.includes(p.id));
    if (hechasFilter === 'all') return donePositions.sort((a, b) => getAvgRating(b.id) - getAvgRating(a.id));
    if (hechasFilter === 'her') return donePositions.filter(p => ratings[p.id]?.ella?.wouldRepeat).sort((a, b) => (ratings[b.id]?.ella?.connection || 0) - (ratings[a.id]?.ella?.connection || 0));
    if (hechasFilter === 'his') return donePositions.filter(p => ratings[p.id]?.el?.wouldRepeat).sort((a, b) => (ratings[b.id]?.el?.connection || 0) - (ratings[a.id]?.el?.connection || 0));
    if (hechasFilter === 'super') {
      return donePositions.filter(p => {
        const r = ratings[p.id];
        return r?.ella?.connection && r?.el?.connection && getAvgRating(p.id) >= 4;
      }).sort((a, b) => getAvgRating(b.id) - getAvgRating(a.id));
    }
    return donePositions;
  }, [positions, done, ratings, hechasFilter]);

  const openPosition = (pos: any) => { setSelectedPosition(pos); setDescExpanded(false); };

  const toTryRouletteItems: RouletteItem[] = useMemo(() => {
    const toTryPositions = positions.filter(p => toTry.includes(p.id));
    return toTryPositions.map(p => ({
      id: String(p.id),
      label: p.nameEs || p.name,
    }));
  }, [positions, toTry]);

  const showConfetti = () => {
    setConfettiVisible(true);
    confettiAnim.setValue(0);
    Animated.timing(confettiAnim, { toValue: 1, duration: 2000, useNativeDriver: true }).start(() => {
      setConfettiVisible(false);
    });
  };

  const handleToTryRouletteResult = (item: RouletteItem) => {
    setToTryRouletteOpen(false);
    showConfetti();
    const posId = parseInt(item.id);
    const pos = positions.find(p => p.id === posId);
    if (pos) {
      setTimeout(() => openPosition(pos), 600);
    }
  };

  // ===== View Mode Picker =====
  const renderViewPicker = () => (
    <Modal visible={showViewPicker} transparent animationType="fade">
      <TouchableOpacity style={st.pickerOverlay} activeOpacity={1} onPress={() => setShowViewPicker(false)}>
        <View style={st.pickerSheet}>
          <Text style={st.pickerTitle}>Vista del catálogo</Text>
          {VIEW_MODES.map(vm => (
            <TouchableOpacity
              key={vm.key}
              style={[st.pickerItem, viewMode === vm.key && st.pickerItemActive]}
              onPress={() => { setViewMode(vm.key); setShowViewPicker(false); }}
            >
              <Ionicons name={vm.icon as any} size={20} color={viewMode === vm.key ? T.primary : T.textSecondary} />
              <Text style={[st.pickerLabel, viewMode === vm.key && { color: T.primary, fontFamily: F.semibold }]}>{vm.label}</Text>
              {viewMode === vm.key && <Ionicons name="checkmark" size={18} color={T.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ===== RENDER: Position Detail Modal =====
  const renderModal = () => (
    <Modal visible={!!selectedPosition} animationType="slide" transparent>
      <View style={st.modalOverlay}>
        <View style={[st.modalContent, isDesktop ? { maxWidth: 800, width: '80%' as any } : undefined]}>
          {selectedPosition && (
            <>
              <View style={st.modalHeader}>
                <Text style={[st.modalTitle, isDesktop && { fontSize: FS['3xl'] }]}>{selectedPosition.nameEs}</Text>
                <TouchableOpacity onPress={() => setSelectedPosition(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={24} color={T.text} />
                </TouchableOpacity>
              </View>
              <View style={[isDesktop && { flexDirection: 'row', gap: S.lg }]}>
                <Image source={getImageSource(selectedPosition.id)} style={[st.modalImage, isDesktop && { width: 320, height: 320, marginBottom: 0, flexShrink: 0 }]} resizeMode="contain" />
                <View style={[isDesktop && { flex: 1 }]}>
                  <View style={st.modalMeta}>
                    <View style={[st.badge, { backgroundColor: getSafetyColor(selectedPosition.safety) }]}>
                      <Text style={st.badgeText}>{getSafetyLabel(selectedPosition.safety)}</Text>
                    </View>
                    <Text style={st.modalId}>#{selectedPosition.id}</Text>
                    <View style={st.modalActions}>
                      <TouchableOpacity onPress={() => toggleFavorite(selectedPosition.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name={favorites.includes(selectedPosition.id) ? 'star' : 'star-outline'} size={22} color={T.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleDone(selectedPosition.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name={done.includes(selectedPosition.id) ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} color={T.success} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleSkipped(selectedPosition.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name={skipped.includes(selectedPosition.id) ? 'close-circle' : 'close-circle-outline'} size={22} color={T.warning} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ScrollView style={isDesktop ? {} : { maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                    {isDesktop ? (
                      <Text style={[st.modalDesc, { lineHeight: 26 }]}>{selectedPosition.descEs}</Text>
                    ) : (
                      <TouchableOpacity activeOpacity={0.7} onPress={() => setDescExpanded(!descExpanded)}>
                        <Text style={st.modalDesc}>
                          {descExpanded ? selectedPosition.descEs : (selectedPosition.descEs || '').slice(0, 120)}
                          {!descExpanded && (selectedPosition.descEs || '').length > 120 && <Text style={{ color: T.primary, fontFamily: F.bold }}> ...ver más</Text>}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <View style={st.tagRow}>
                      {selectedPosition.tags?.map((tag: string, i: number) => (
                        <View key={i} style={st.tag}><Text style={st.tagText}>{tag}</Text></View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // ===== RENDER: Grid Card =====
  const renderGridCard = (pos: any) => (
    <TouchableOpacity key={pos.id} style={st.card} onPress={() => openPosition(pos)} activeOpacity={0.7}>
      <Image source={getImageSource(pos.id)} style={st.cardImage} resizeMode="contain" />
      <View style={[st.badge, { position: 'absolute' as const, top: 8, right: 8, backgroundColor: getSafetyColor(pos.safety) }]}>
        <Text style={st.badgeText}>{getSafetyLabel(pos.safety)}</Text>
      </View>
      <TouchableOpacity style={[st.favBtn, favorites.includes(pos.id) && st.favBtnActive]} onPress={() => toggleFavorite(pos.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name={favorites.includes(pos.id) ? 'star' : 'star-outline'} size={16} color={favorites.includes(pos.id) ? T.accent : T.textMuted} />
      </TouchableOpacity>
      <View style={st.cardInfo}>
        <Text style={st.cardTitle} numberOfLines={1}>{pos.nameEs}</Text>
        <View style={st.tagRow}>
          {pos.tags?.slice(0, 2).map((tag: string, i: number) => (
            <View key={i} style={st.tagMini}><Text style={st.tagMiniText}>{tag}</Text></View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  // ===== VIEW: Menu =====
  if (subView === 'menu') {
    return (
      <View style={st.container}>
        <BackgroundGradient />
        <View style={st.header}>
          <Text style={st.title}>Posiciones</Text>
          <Text style={st.subtitle}>519 posiciones para explorar</Text>
        </View>
        <View style={[s.menuGrid, isDesktop && s.menuGridDesktop]}>
          <TouchableOpacity style={[st.menuCard, { boxShadow: '0 0 12px rgba(0,229,199,0.15)' }]} onPress={() => { setSubView('random'); rollDice(); }}>
            <Text style={st.menuCardIcon}>🎲</Text>
            <Text style={[st.menuCardTitle, { color: T.primary }]}>Posición Random</Text>
            <Text style={st.menuCardDesc}>Tira el dado y descubre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.menuCard, { boxShadow: '0 0 12px rgba(247,37,133,0.15)' }]} onPress={() => setSubView('mylist')}>
            <Ionicons name="bookmark" size={36} color={T.accent} />
            <Text style={[st.menuCardTitle, { color: T.accent }]}>Mi Lista</Text>
            <Text style={st.menuCardDesc}>Favoritas · Hechas · Omitidas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.menuCard, { boxShadow: '0 0 12px rgba(59,130,246,0.15)' }]} onPress={() => setSubView('catalog')}>
            <Ionicons name="grid" size={36} color="#3b82f6" />
            <Text style={[st.menuCardTitle, { color: '#3b82f6' }]}>Catálogo</Text>
            <Text style={st.menuCardDesc}>Explora todas las posiciones</Text>
          </TouchableOpacity>
        </View>
        {renderModal()}
      </View>
    );
  }

  // ===== VIEW: Random / Dice =====
  if (subView === 'random') {
    return (
      <View style={st.container}>
        <BackgroundGradient />
        <View style={st.header}>
          <View style={st.headerRow}>
            <TouchableOpacity onPress={() => { setRandomPos(null); setSubView('menu'); }}>
              <Ionicons name="arrow-back" size={24} color={T.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={st.title}>Dado</Text>
              <Text style={st.subtitle}>Tira el dado</Text>
            </View>
          </View>
        </View>
        <View style={st.diceArea}>
          {!randomPos && !isRolling && (
            <TouchableOpacity style={st.diceBtn} onPress={rollDice}>
              <Text style={st.diceEmoji}>🎲</Text>
              <Text style={st.diceBtnText}>Tirar dado</Text>
            </TouchableOpacity>
          )}
          {isRolling && (
            <Animated.View style={{ transform: [{ rotate: diceRotate }] }}>
              <Text style={{ fontSize: 100 }}>🎲</Text>
            </Animated.View>
          )}
          {randomPos && !isRolling && (
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
              <View style={[st.randomCard, SHADOW.neonCyan]}>
                <Image source={getImageSource(randomPos.id)} style={st.randomCardImage} resizeMode="contain" />
                <View style={st.randomCardBody}>
                  <View style={st.modalMeta}>
                    <View style={[st.badge, { backgroundColor: getSafetyColor(randomPos.safety) }]}>
                      <Text style={st.badgeText}>{getSafetyLabel(randomPos.safety)}</Text>
                    </View>
                    <Text style={st.modalId}>#{randomPos.id}</Text>
                  </View>
                  <Text style={st.randomCardTitle}>{randomPos.nameEs}</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => setRandomDescExpanded(!randomDescExpanded)}>
                    <Text style={st.randomCardDesc}>
                      {randomDescExpanded ? randomPos.descEs : (randomPos.descEs || '').slice(0, 140)}
                      {!randomDescExpanded && (randomPos.descEs || '').length > 140 && <Text style={{ color: T.primary, fontFamily: F.bold }}> ...ver más</Text>}
                    </Text>
                  </TouchableOpacity>
                  <View style={[st.tagRow, { marginTop: S.md }]}>
                    {randomPos.tags?.slice(0, 4).map((tag: string, i: number) => (
                      <View key={i} style={st.tag}><Text style={st.tagText}>{tag}</Text></View>
                    ))}
                  </View>
                </View>
                <View style={st.randomCardActions}>
                  <TouchableOpacity style={st.iconBtn} onPress={() => toggleFavorite(randomPos.id)}>
                    <Ionicons name={favorites.includes(randomPos.id) ? 'star' : 'star-outline'} size={22} color={T.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={st.iconBtn} onPress={() => toggleDone(randomPos.id)}>
                    <Ionicons name={done.includes(randomPos.id) ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} color={T.success} />
                  </TouchableOpacity>
                  <TouchableOpacity style={st.iconBtn} onPress={() => toggleSkipped(randomPos.id)}>
                    <Ionicons name={skipped.includes(randomPos.id) ? 'close-circle' : 'close-circle-outline'} size={22} color={T.warning} />
                  </TouchableOpacity>
                  <TouchableOpacity style={st.randomOtraBtn} onPress={rollDice}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={st.randomOtraBtnText}>Otra</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
        {renderModal()}
      </View>
    );
  }

  // ===== VIEW: My List =====
  if (subView === 'mylist') {
    const displayPositions = myListTab === 'done' ? filteredDone : mylistPositions;

    return (
      <View style={st.container}>
        <BackgroundGradient />
        <View style={st.mylistHeader}>
          <View style={st.headerRow}>
            <TouchableOpacity onPress={() => setSubView('menu')}>
              <Ionicons name="arrow-back" size={24} color={T.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={st.title}>Mi Lista</Text>
              <Text style={st.subtitle}>{favorites.length} fav · {done.length} hechas · {skipped.length} omitidas</Text>
            </View>
          </View>
        </View>
        <View style={st.tabRowCenter}>
          {([['favorites', 'Favoritas', 'star', T.accent], ['toTry', 'Por probar', 'flask', '#a855f7'], ['done', 'Hechas', 'checkmark-circle', T.success], ['skipped', 'Omitidas', 'close-circle', T.warning]] as const).map(([key, label, icon, color]) => (
            <TouchableOpacity key={key} style={[st.tab, myListTab === key && { borderColor: color, backgroundColor: color + '12' }]} onPress={() => setMyListTab(key)}>
              <Ionicons name={icon as any} size={16} color={myListTab === key ? color : T.textMuted} />
              <Text style={[st.tabText, myListTab === key && { color }]}>{label} ({key === 'favorites' ? favorites.length : key === 'done' ? done.length : key === 'toTry' ? toTry.length : skipped.length})</Text>
            </TouchableOpacity>
          ))}
        </View>
        {myListTab === 'toTry' && toTry.length > 1 && (
          <TouchableOpacity style={st.rouletteIconBtn} onPress={() => setToTryRouletteOpen(true)}>
            <Ionicons name="disc" size={20} color="#a855f7" />
          </TouchableOpacity>
        )}
        {myListTab === 'done' && done.length > 0 && (
          <>
            <TouchableOpacity style={st.hechasToggleBtn} onPress={() => setShowHechasFilters(p => !p)}>
              <Ionicons name={showHechasFilters ? 'options' : 'options-outline'} size={16} color={T.textMuted} />
              <Text style={st.hechasToggleText}>Filtros</Text>
            </TouchableOpacity>
            {showHechasFilters && (
              <View style={st.hechasFilterRow}>
                {([['all', 'Todas'], ['her', herName || 'Ella'], ['his', hisName || 'Él'], ['super', 'Super conexión']] as const).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[st.hechasFilter, hechasFilter === key && st.hechasFilterActive]}
                    onPress={() => setHechasFilter(key as any)}
                  >
                    <Text style={[st.hechasFilterText, hechasFilter === key && st.hechasFilterTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
        {displayPositions.length === 0 ? (
          <View style={st.empty}>
            <Ionicons name="bookmark-outline" size={48} color={T.textMuted} />
            <Text style={st.emptyText}>Sin elementos</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={st.mylistGrid} style={{ flex: 1 }}>
            <View style={st.mylistGridInner}>
              {displayPositions.map((pos: any) => {
                const r = ratings[pos.id];
                const avg = getAvgRating(pos.id);
                return (
                  <TouchableOpacity key={pos.id} style={st.mylistCard} onPress={() => openPosition(pos)} activeOpacity={0.7}>
                    <Image source={getImageSource(pos.id)} style={st.mylistCardImage} resizeMode="contain" />
                    <View style={st.mylistCardBottom}>
                      <Text style={st.mylistCardTitle} numberOfLines={1}>{pos.nameEs}</Text>
                      <Text style={st.mylistCardId}>#{pos.id}</Text>
                      {myListTab === 'done' && avg > 0 && (
                        <View style={st.ratingBadge}>
                          <Ionicons name="star" size={12} color="#ffd166" />
                          <Text style={st.ratingBadgeText}>{avg.toFixed(1)}</Text>
                          {r?.ella?.connection && r?.el?.connection && (
                            <Text style={st.ratingBadgeNames}>
                              {' '}{herName || 'E'}:{r.ella.connection} · {hisName || 'L'}:{r.el.connection}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                    <View style={st.mylistCardActions}>
                      <TouchableOpacity onPress={() => toggleFavorite(pos.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                        <Ionicons name={favorites.includes(pos.id) ? 'star' : 'star-outline'} size={16} color={favorites.includes(pos.id) ? T.accent : T.textMuted} />
                      </TouchableOpacity>
                      {myListTab === 'toTry' ? (
                        <>
                          <TouchableOpacity onPress={() => moveToDone(pos.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                            <Ionicons name="checkmark-circle-outline" size={16} color={T.success} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => toggleToTry(pos.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                            <Ionicons name="trash-outline" size={16} color={T.danger} />
                          </TouchableOpacity>
                        </>
                      ) : myListTab === 'done' ? (
                        <TouchableOpacity onPress={() => setRatingModalPos(pos)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                          <Ionicons name="create-outline" size={16} color={T.primary} />
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity onPress={() => toggleDone(pos.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                            <Ionicons name={done.includes(pos.id) ? 'checkmark-circle' : 'checkmark-circle-outline'} size={16} color={done.includes(pos.id) ? T.success : T.textMuted} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => toggleSkipped(pos.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                            <Ionicons name={skipped.includes(pos.id) ? 'close-circle' : 'close-circle-outline'} size={16} color={skipped.includes(pos.id) ? T.warning : T.textMuted} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
        {renderModal()}
        <RatingModal
          visible={!!ratingModalPos}
          position={ratingModalPos}
          onClose={() => setRatingModalPos(null)}
          onSave={saveRating}
          existingRating={ratingModalPos ? ratings[ratingModalPos.id] : undefined}
        />
        <RouletteWheel
          items={toTryRouletteItems}
          visible={toTryRouletteOpen}
          centerLabel="GIRAR"
          onSpinEnd={handleToTryRouletteResult}
          onClose={() => setToTryRouletteOpen(false)}
          resultTitle="Tu posición elegida"
        />
        {confettiVisible && (
          <View style={st.confettiOverlay} pointerEvents="none">
            {Array.from({ length: 40 }).map((_, i) => {
              const colors = ['#f72585', '#4cc9f0', '#ffd166', '#06d6a0', '#7b2ff7', '#ef4444', T.primary];
              const x = Math.random() * 100;
              const delay = Math.random() * 0.5;
              const size = 6 + Math.random() * 8;
              return (
                <Animated.View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: -10,
                    width: size,
                    height: size,
                    borderRadius: Math.random() > 0.5 ? size / 2 : 2,
                    backgroundColor: colors[i % colors.length],
                    opacity: confettiAnim.interpolate({
                      inputRange: [0, 0.1, 0.8, 1],
                      outputRange: [0, 1, 1, 0],
                    }),
                    transform: [{
                      translateY: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 600 + Math.random() * 200],
                      }),
                    }, {
                      rotate: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${360 + Math.random() * 720}deg`],
                      }),
                    }],
                  }}
                />
              );
            })}
          </View>
        )}
      </View>
    );
  }

  // ===== VIEW: Catalog =====
  return (
    <View style={st.container}>
      <BackgroundGradient />
      <View style={st.header}>
        <View style={st.headerRow}>
          <TouchableOpacity onPress={() => setSubView('menu')}>
            <Ionicons name="arrow-back" size={24} color={T.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={st.title}>Catálogo</Text>
            <Text style={st.subtitle}>{filtered.length} de {positions.length}</Text>
          </View>
          <TouchableOpacity
            style={[st.viewModeBtn, showViewPicker && st.viewModeBtnActive]}
            onPress={() => setShowViewPicker(true)}
          >
            <Ionicons name={VIEW_MODES.find(v => v.key === viewMode)?.icon as any ?? 'grid'} size={18} color={T.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={st.filtersContainer}>
        <View style={st.searchRow}>
          <View style={[st.searchBox, { flex: 1 }]}>
            <Ionicons name="search" size={18} color={T.textMuted} />
            <TextInput style={st.searchInput} placeholder="Buscar posición..." placeholderTextColor={T.textMuted} value={search} onChangeText={setSearch} />
            {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={T.textMuted} /></TouchableOpacity>}
          </View>
          <TouchableOpacity style={[st.filterToggle, showFilters && st.filterToggleActive]} onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name={showFilters ? 'options' : 'options-outline'} size={18} color={showFilters ? T.primary : T.textMuted} />
            <Text style={[st.filterToggleText, showFilters && { color: T.primary }]}>Filtros</Text>
          </TouchableOpacity>
        </View>
        {showFilters && (
          <ScrollView style={st.filtersScroll} showsVerticalScrollIndicator={false}>
            {FILTER_GROUPS.map(group => (
              <View key={group.label} style={st.filterGroup}>
                <Text style={st.filterGroupLabel}>{group.icon} {group.label}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.catScroll}>
                  {group.items.map(cat => (
                    <TouchableOpacity key={cat.id} style={[st.chip, selectedCategory === cat.id && { backgroundColor: cat.color + '18', borderColor: cat.color }]} onPress={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}>
                      <Text style={st.chipIcon}>{cat.icon}</Text>
                      <Text style={[st.chipText, selectedCategory === cat.id && { color: cat.color, fontFamily: F.semibold }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {viewMode === 'stack' ? (
        <CardStack
          items={filtered}
          onCardPress={openPosition}
          onFavorite={toggleFavorite}
          onSwipeRight={(item) => { if (!toTry.includes(item.id)) toggleToTry(item.id); }}
          favorites={favorites}
          getSafetyColor={getSafetyColor}
          getSafetyLabel={getSafetyLabel}
        />
      ) : viewMode === 'evervault' ? (
        <ScrollView contentContainerStyle={st.evervaultScroll}>
          <View style={st.evervaultNav}>
            <TouchableOpacity
              style={[st.evervaultNavBtn, evervaultIndex === 0 && { opacity: 0.3 }]}
              onPress={() => setEvervaultIndex(p => Math.max(0, p - 1))}
              disabled={evervaultIndex === 0}
            >
              <Ionicons name="chevron-back" size={28} color={T.text} />
            </TouchableOpacity>
            <Text style={st.evervaultCounter}>{evervaultIndex + 1} / {filtered.length}</Text>
            <TouchableOpacity
              style={[st.evervaultNavBtn, evervaultIndex >= filtered.length - 1 && { opacity: 0.3 }]}
              onPress={() => setEvervaultIndex(p => Math.min(filtered.length - 1, p + 1))}
              disabled={evervaultIndex >= filtered.length - 1}
            >
              <Ionicons name="chevron-forward" size={28} color={T.text} />
            </TouchableOpacity>
          </View>
          <View style={st.evervaultCardWrap}>
            <EvervaultCard
              key={filtered[evervaultIndex].id}
              item={filtered[evervaultIndex]}
              onPress={() => openPosition(filtered[evervaultIndex])}
              onFavorite={() => toggleFavorite(filtered[evervaultIndex].id)}
              isFavorite={favorites.includes(filtered[evervaultIndex].id)}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={st.gridContent}>
          <View style={[st.grid, { gridTemplateColumns: `repeat(${R2.numColumns}, 1fr)` }]}>
            {filtered.map((pos: any) => renderGridCard(pos))}
          </View>
        </ScrollView>
      )}
      {renderModal()}
      {renderViewPicker()}
      <RatingModal
        visible={!!ratingModalPos}
        position={ratingModalPos}
        herName={herName}
        hisName={hisName}
        onClose={() => setRatingModalPos(null)}
        onSave={saveRating}
        existingRating={ratingModalPos ? ratings[ratingModalPos.id] : undefined}
      />
    </View>
  );
}

// ===== STYLES =====
const s = StyleSheet.create({
  menuGrid: { padding: S.lg, gap: S.md },
  menuGridDesktop: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
});

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { paddingHorizontal: S.lg, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: S.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  title: { fontSize: FS['3xl'], fontFamily: F.display, color: T.text },
  subtitle: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, marginTop: 2 },

  // Menu
  menuCard: {
    ...GLASS.card, alignItems: 'center', gap: S.sm,
    paddingVertical: S.xl, paddingHorizontal: S.lg,
    minHeight: 140, justifyContent: 'center',
  },
  menuCardIcon: { fontSize: 36, marginBottom: S.xs },
  menuCardTitle: { fontSize: FS.base, fontFamily: F.bold, textAlign: 'center' },
  menuCardDesc: { fontSize: FS.xs, fontFamily: F.regular, color: T.textSecondary, textAlign: 'center' },

  // Dice
  diceArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: S.lg },
  diceBtn: { alignItems: 'center', gap: S.md },
  diceEmoji: { fontSize: 80 },
  diceBtnText: { fontSize: FS.lg, fontFamily: F.semibold, color: T.textSecondary },

  // Filters
  filtersContainer: { paddingHorizontal: S.lg, paddingBottom: S.sm },
  searchRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.sm },
  searchBox: { flexDirection: 'row', alignItems: 'center', ...GLASS.chip, paddingHorizontal: S.md, gap: S.sm },
  searchInput: { flex: 1, color: T.text, fontSize: FS.base, fontFamily: F.regular, paddingVertical: 12 },
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: S.xs, paddingHorizontal: S.md, paddingVertical: S.sm, borderRadius: R.md, ...GLASS.chip },
  filterToggleActive: { borderColor: T.primary, backgroundColor: T.primary + '10' },
  filterToggleText: { fontSize: FS.sm, fontFamily: F.medium, color: T.textMuted },

  catScroll: { paddingVertical: S.xs },
  filtersScroll: { maxHeight: 160 },
  filterGroup: { marginBottom: S.xs },
  filterGroupLabel: { fontSize: FS.xs, fontFamily: F.semibold, color: T.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: S.xs, marginLeft: S.lg },

  // Chips
  chip: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.md, paddingVertical: 10, borderRadius: R.full, ...GLASS.chip },
  chipIcon: { fontSize: 16 },
  chipText: { color: T.textSecondary, fontSize: FS.sm, fontFamily: F.medium },

  // Grid
  gridContent: { padding: S.lg },
  grid: { display: 'grid', gap: S.md },

  // Cards
  card: {
    backgroundColor: 'rgba(26,31,53,0.85)',
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,229,199,0.12)',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3), 0 0 8px rgba(0,229,199,0.1)',
  } as any,
  cardImage: { width: '100%', aspectRatio: 1, backgroundColor: '#000' },
  cardInfo: { padding: S.md },
  cardTitle: { fontSize: FS.base, fontFamily: F.semibold, color: T.text, marginBottom: S.xs },
  cardActions: { flexDirection: 'row', gap: S.sm },
  favBtn: { position: 'absolute', top: 8, left: 8, backgroundColor: '#00000060', borderRadius: R.sm, padding: 5 },
  favBtnActive: { backgroundColor: '#00000090' },

  // Tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { backgroundColor: T.primary + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.sm },
  tagText: { fontSize: FS.xs, fontFamily: F.medium, color: T.primary },
  tagMini: { backgroundColor: T.primary + '12', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagMiniText: { fontSize: 10, fontFamily: F.medium, color: T.primary },

  // Tabs
  tabRow: { paddingHorizontal: S.lg, marginBottom: S.sm, alignItems: 'center' },
  tabRowCenter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: S.sm, paddingHorizontal: S.lg, marginBottom: S.sm },
  mylistHeader: { paddingHorizontal: S.lg, paddingTop: S.sm, paddingBottom: S.xs },

  hechasFilterRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: S.xs, paddingHorizontal: S.lg, marginBottom: S.sm },
  hechasToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center',
    paddingHorizontal: S.md, paddingVertical: 6, borderRadius: R.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(26,31,53,0.5)',
    marginBottom: S.sm,
  },
  hechasToggleText: { fontSize: FS.xs, fontFamily: F.medium, color: T.textMuted },
  hechasFilter: {
    paddingHorizontal: S.md,
    paddingVertical: 5,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(26,31,53,0.5)',
  },
  hechasFilterActive: { borderColor: T.primary, backgroundColor: T.primary + '18' },

  // Roulette
  rouletteIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(168,85,247,0.15)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)', marginHorizontal: S.lg, marginVertical: S.sm, alignSelf: 'flex-end' },

  // Confetti
  confettiOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  hechasFilterText: { fontSize: FS.xs, fontFamily: F.medium, color: T.textMuted },
  hechasFilterTextActive: { color: T.primary },

  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingBadgeText: { fontSize: FS.xs, fontFamily: F.bold, color: '#ffd166' },
  ratingBadgeNames: { fontSize: FS.xs, color: T.textMuted, fontFamily: F.regular },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, ...GLASS.chip, paddingHorizontal: S.md, paddingVertical: 6, height: 36, flexShrink: 0 },
  tabText: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textMuted },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: FS.lg, fontFamily: F.regular, color: T.textSecondary, marginTop: S.md },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { ...GLASS.elevated, maxHeight: '90%', padding: S.lg, overflow: 'hidden', width: '95%', borderColor: 'rgba(0,229,199,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 6px rgba(0,229,199,0.08)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  modalTitle: { fontSize: FS['2xl'], fontFamily: F.display, color: T.text, flex: 1 },
  modalImage: { width: '100%', height: 200, backgroundColor: '#000', borderRadius: R.lg, marginBottom: S.md },
  modalMeta: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.sm },
  modalActions: { flexDirection: 'row', gap: S.sm, marginLeft: 'auto' },
  modalId: { fontSize: FS.sm, fontFamily: F.regular, color: T.textMuted, flex: 1 },
  modalDesc: { fontSize: FS.base, fontFamily: F.regular, color: T.textSecondary, lineHeight: 22 },

  // Shared
  glassCard: { ...GLASS.card },
  badge: { ...SHARED.badge },
  badgeText: { color: '#fff', fontSize: FS.xs, fontFamily: F.bold },
  btnPrimary: { ...SHARED.btnPrimary, flexDirection: 'row', gap: S.sm },
  btnPrimaryText: { color: '#fff', fontSize: FS.base, fontFamily: F.bold },
  iconBtn: { ...GLASS.card, padding: 10 },

  // Random card
  randomCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(26,31,53,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...SHADOW.lg,
  },
  randomCardImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
  },
  randomCardBody: {
    padding: S.lg,
  },
  randomCardTitle: {
    fontSize: FS.xl,
    fontFamily: F.display,
    color: T.text,
    marginTop: S.sm,
    marginBottom: S.xs,
  },
  randomCardDesc: {
    fontSize: FS.base,
    fontFamily: F.regular,
    color: T.textSecondary,
    lineHeight: 22,
  },
  randomCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingBottom: S.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: S.md,
  },
  randomOtraBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    backgroundColor: T.primary,
    paddingVertical: 12,
    borderRadius: R.md,
    ...SHADOW.neonCyan,
  },
  randomOtraBtnText: {
    color: '#fff',
    fontSize: FS.base,
    fontFamily: F.bold,
  },

  // View mode picker
  // My List cards — simple, centered, no tags
  mylistGrid: {
    flexGrow: 1,
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.lg,
    gap: S.sm,
  },
  mylistGridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: S.md,
  },
  mylistCard: {
    width: 280,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(26,31,53,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,199,0.08)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3), 0 0 6px rgba(0,229,199,0.08)',
  },
  mylistCardImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#0a0d14',
  },
  mylistCardBottom: {
    paddingHorizontal: S.md,
    paddingTop: S.md,
    alignItems: 'center',
  },
  mylistCardTitle: {
    fontSize: FS.base,
    fontFamily: F.semibold,
    color: T.text,
    textAlign: 'center',
  },
  mylistCardId: {
    fontSize: FS.xs,
    color: T.textMuted,
    marginTop: 2,
  },
  mylistCardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: S.lg,
    paddingVertical: S.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: S.md,
  },

  trophyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,209,102,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,209,102,0.3)',
    boxShadow: '0 0 12px rgba(255,209,102,0.2)',
  },

  viewModeBtn: { width: 40, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', ...GLASS.chip },
  viewModeBtnActive: { borderColor: T.primary, backgroundColor: T.primary + '12' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerSheet: { ...GLASS.elevated, ...SHADOW.lg, width: 260, padding: S.lg, gap: S.sm },
  pickerTitle: { fontSize: FS.lg, fontFamily: F.bold, color: T.text, marginBottom: S.sm },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, paddingHorizontal: S.md, borderRadius: R.md },
  pickerItemActive: { backgroundColor: T.primary + '12' },
  // Evervault single card view
  evervaultScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.lg,
    paddingVertical: S.lg,
  },
  evervaultNav: { flexDirection: 'row', alignItems: 'center', gap: S.lg, marginBottom: S.lg },
  evervaultNavBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...GLASS.card,
    ...SHADOW.sm,
  },
  evervaultCounter: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textSecondary },
  evervaultCardWrap: { width: '100%', maxWidth: 400 },

  pickerLabel: { flex: 1, fontSize: FS.base, fontFamily: F.medium, color: T.textSecondary },
});
