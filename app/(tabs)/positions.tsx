import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, useWindowDimensions, Image, Modal, Animated, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, BP, SHARED, useResponsive } from '../../src/tokens';

const FILTER_GROUPS = [
  {
    label: 'Nivel',
    icon: '📊',
    items: [
      { id: 'nivel_medio', name: 'Medio', icon: '🟡', color: '#f59e0b', tags: ['nivel medio'] },
      { id: 'nivel_dificil', name: 'Difícil', icon: '🔴', color: '#ef4444', tags: ['nivel difícil'] },
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
type MyListTab = 'favorites' | 'done' | 'skipped';

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
  const [randomPos, setRandomPos] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(true);

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
      if (f) setFavorites(JSON.parse(f));
      if (d) setDone(JSON.parse(d));
      if (s) setSkipped(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => { try { localStorage?.setItem('pos_favorites', JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => { try { localStorage?.setItem('pos_done', JSON.stringify(done)); } catch {} }, [done]);
  useEffect(() => { try { localStorage?.setItem('pos_skipped', JSON.stringify(skipped)); } catch {} }, [skipped]);

  const toggleFavorite = (id: number) => setFavorites(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
  const toggleDone = (id: number) => setDone(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
  const toggleSkipped = (id: number) => setSkipped(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRandomPos(null);
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
          matchCat = p.tags?.some((t: string) => filterItem.tags.includes(t)) || false;
        }
      }
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory, positions]);

  const mylistPositions = useMemo(() => {
    return positions.filter(p => myListTab === 'favorites' ? favorites.includes(p.id) : myListTab === 'done' ? done.includes(p.id) : skipped.includes(p.id));
  }, [positions, favorites, done, skipped, myListTab]);

  const openPosition = (pos: any) => { setSelectedPosition(pos); setDescExpanded(false); };

  // ===== RENDER: Position Detail Modal =====
  const renderModal = () => (
    <Modal visible={!!selectedPosition} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={[s.modalContent, isDesktop && { maxWidth: 800, width: '80%' }]}>
          {selectedPosition && (
            <>
              <View style={s.modalHeader}>
                <Text style={[s.modalTitle, isDesktop && { fontSize: FS['3xl'] }]}>{selectedPosition.nameEs}</Text>
                <TouchableOpacity onPress={() => setSelectedPosition(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={24} color={T.text} />
                </TouchableOpacity>
              </View>
              <View style={[isDesktop && { flexDirection: 'row', gap: S.lg }]}>
                <Image source={{ uri: `/images_final_v2/${String(selectedPosition.id).padStart(3, '0')}.png` }} style={[s.modalImage, isDesktop && { width: 320, height: 320, marginBottom: 0, flexShrink: 0 }]} resizeMode="contain" />
                <View style={[isDesktop && { flex: 1 }]}>
                  <View style={s.modalMeta}>
                    <View style={[s.badge, { backgroundColor: getSafetyColor(selectedPosition.safety) }]}>
                      <Text style={s.badgeText}>{getSafetyLabel(selectedPosition.safety)}</Text>
                    </View>
                    <Text style={s.modalId}>#{selectedPosition.id}</Text>
                    <View style={s.modalActions}>
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
                      <Text style={[s.modalDesc, { lineHeight: 26 }]}>{selectedPosition.descEs}</Text>
                    ) : (
                      <TouchableOpacity activeOpacity={0.7} onPress={() => setDescExpanded(!descExpanded)}>
                        <Text style={s.modalDesc}>
                          {descExpanded ? selectedPosition.descEs : (selectedPosition.descEs || '').slice(0, 120)}
                          {!descExpanded && (selectedPosition.descEs || '').length > 120 && <Text style={{ color: T.primary, fontFamily: F.bold }}> ...ver más</Text>}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <View style={s.tagRow}>
                      {selectedPosition.tags?.map((tag: string, i: number) => (
                        <View key={i} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
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

  // ===== VIEW: Menu =====
  if (subView === 'menu') {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Posiciones</Text>
          <Text style={s.subtitle}>519 posiciones para explorar</Text>
        </View>
        <View style={[s.menuGrid, isDesktop && s.menuGridDesktop]}>
          <TouchableOpacity style={s.menuCard} onPress={() => { setSubView('random'); rollDice(); }}>
            <Text style={s.menuCardIcon}>🎲</Text>
            <Text style={[s.menuCardTitle, { color: T.primary }]}>Posición Random</Text>
            <Text style={s.menuCardDesc}>Tira el dado y descubre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.menuCard} onPress={() => setSubView('mylist')}>
            <Ionicons name="bookmark" size={36} color={T.accent} />
            <Text style={[s.menuCardTitle, { color: T.accent }]}>Mi Lista</Text>
            <Text style={s.menuCardDesc}>Favoritas · Hechas · Omitidas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.menuCard} onPress={() => setSubView('catalog')}>
            <Ionicons name="grid" size={36} color="#7b2ff7" />
            <Text style={[s.menuCardTitle, { color: '#7b2ff7' }]}>Catálogo</Text>
            <Text style={s.menuCardDesc}>Explora todas las posiciones</Text>
          </TouchableOpacity>
        </View>
        {renderModal()}
      </View>
    );
  }

  // ===== VIEW: Random / Dice =====
  if (subView === 'random') {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => { setRandomPos(null); setSubView('menu'); }}>
              <Ionicons name="arrow-back" size={24} color={T.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Dado</Text>
              <Text style={s.subtitle}>Tira el dado</Text>
            </View>
          </View>
        </View>
        <View style={s.diceArea}>
          {!randomPos && !isRolling && (
            <TouchableOpacity style={s.diceBtn} onPress={rollDice}>
              <Text style={s.diceEmoji}>🎲</Text>
              <Text style={s.diceBtnText}>Tirar dado</Text>
            </TouchableOpacity>
          )}
          {isRolling && (
            <Animated.View style={{ transform: [{ rotate: diceRotate }] }}>
              <Text style={{ fontSize: 100 }}>🎲</Text>
            </Animated.View>
          )}
          {randomPos && !isRolling && (
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
              <View style={[s.glassCard, { width: '100%', maxWidth: 500 }]}>
                <Image source={{ uri: `/images_final_v2/${String(randomPos.id).padStart(3, '0')}.png` }} style={{ width: '100%', height: 220, backgroundColor: '#000' }} resizeMode="contain" />
                <View style={{ padding: S.lg }}>
                  <View style={s.modalMeta}>
                    <View style={[s.badge, { backgroundColor: getSafetyColor(randomPos.safety) }]}>
                      <Text style={s.badgeText}>{getSafetyLabel(randomPos.safety)}</Text>
                    </View>
                    <Text style={s.modalId}>#{randomPos.id}</Text>
                  </View>
                  <Text style={{ fontSize: FS.xl, fontFamily: F.display, color: T.text, marginTop: S.sm }}>{randomPos.nameEs}</Text>
                  <Text style={[s.modalDesc, { marginTop: S.sm }]} numberOfLines={4}>{randomPos.descEs}</Text>
                  <View style={[s.tagRow, { marginTop: S.md }]}>
                    {randomPos.tags?.slice(0, 4).map((tag: string, i: number) => (
                      <View key={i} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
                    ))}
                  </View>
                  <View style={[s.modalActions, { marginTop: S.lg, justifyContent: 'flex-start' }]}>
                    <TouchableOpacity style={s.iconBtn} onPress={() => toggleFavorite(randomPos.id)}>
                      <Ionicons name={favorites.includes(randomPos.id) ? 'star' : 'star-outline'} size={22} color={T.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.iconBtn} onPress={() => toggleDone(randomPos.id)}>
                      <Ionicons name={done.includes(randomPos.id) ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} color={T.success} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.iconBtn} onPress={() => toggleSkipped(randomPos.id)}>
                      <Ionicons name={skipped.includes(randomPos.id) ? 'close-circle' : 'close-circle-outline'} size={22} color={T.warning} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.btnPrimary, { flex: 1, marginLeft: S.sm }]} onPress={rollDice}>
                      <Ionicons name="refresh" size={18} color="#fff" />
                      <Text style={s.btnPrimaryText}>Otra</Text>
                    </TouchableOpacity>
                  </View>
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
    return (
      <View style={s.container}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => setSubView('menu')}>
              <Ionicons name="arrow-back" size={24} color={T.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Mi Lista</Text>
              <Text style={s.subtitle}>{favorites.length} fav · {done.length} hechas · {skipped.length} omitidas</Text>
            </View>
          </View>
        </View>
        <View style={s.tabRow}>
          {([['favorites', 'Favoritas', 'star', T.accent], ['done', 'Hechas', 'checkmark-circle', T.success], ['skipped', 'Omitidas', 'close-circle', T.warning]] as const).map(([key, label, icon, color]) => (
            <TouchableOpacity key={key} style={[s.tab, myListTab === key && { borderColor: color }]} onPress={() => setMyListTab(key)}>
              <Ionicons name={icon as any} size={16} color={myListTab === key ? color : T.textMuted} />
              <Text style={[s.tabText, myListTab === key && { color }]}>{label} ({key === 'favorites' ? favorites.length : key === 'done' ? done.length : skipped.length})</Text>
            </TouchableOpacity>
          ))}
        </View>
        {mylistPositions.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="bookmark-outline" size={48} color={T.textMuted} />
            <Text style={s.emptyText}>Sin elementos</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.gridContent}>
            <View style={[s.grid, { gridTemplateColumns: `repeat(${R2.numColumns}, 1fr)` }]}>
              {mylistPositions.map((pos: any) => (
                <TouchableOpacity key={pos.id} style={s.card} onPress={() => openPosition(pos)} activeOpacity={0.7}>
                  <Image source={{ uri: `/images_final_v2/${String(pos.id).padStart(3, '0')}.png` }} style={s.cardImage} resizeMode="contain" />
                  <View style={s.cardInfo}>
                    <Text style={s.cardTitle} numberOfLines={1}>{pos.nameEs}</Text>
                    <View style={s.cardActions}>
                      <TouchableOpacity onPress={() => toggleFavorite(pos.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                        <Ionicons name={favorites.includes(pos.id) ? 'star' : 'star-outline'} size={14} color={favorites.includes(pos.id) ? T.accent : T.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleDone(pos.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                        <Ionicons name={done.includes(pos.id) ? 'checkmark-circle' : 'checkmark-circle-outline'} size={14} color={done.includes(pos.id) ? T.success : T.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleSkipped(pos.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                        <Ionicons name={skipped.includes(pos.id) ? 'close-circle' : 'close-circle-outline'} size={14} color={skipped.includes(pos.id) ? T.warning : T.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
        {renderModal()}
      </View>
    );
  }

  // ===== VIEW: Catalog =====
  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => setSubView('menu')}>
            <Ionicons name="arrow-back" size={24} color={T.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Catálogo</Text>
            <Text style={s.subtitle}>{filtered.length} de {positions.length}</Text>
          </View>
        </View>
      </View>

      <View style={s.filtersContainer}>
        <View style={s.searchRow}>
          <View style={[s.searchBox, { flex: 1 }]}>
            <Ionicons name="search" size={18} color={T.textMuted} />
            <TextInput style={s.searchInput} placeholder="Buscar posición..." placeholderTextColor={T.textMuted} value={search} onChangeText={setSearch} />
            {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={T.textMuted} /></TouchableOpacity>}
          </View>
          <TouchableOpacity style={[s.filterToggle, showFilters && s.filterToggleActive]} onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name={showFilters ? 'options' : 'options-outline'} size={18} color={showFilters ? T.primary : T.textMuted} />
            <Text style={[s.filterToggleText, showFilters && { color: T.primary }]}>Filtros</Text>
          </TouchableOpacity>
        </View>
        {showFilters && (
          <ScrollView style={s.filtersScroll} showsVerticalScrollIndicator={false}>
            {FILTER_GROUPS.map(group => (
              <View key={group.label} style={s.filterGroup}>
                <Text style={s.filterGroupLabel}>{group.icon} {group.label}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
                  {group.items.map(cat => (
                    <TouchableOpacity key={cat.id} style={[s.chip, selectedCategory === cat.id && { backgroundColor: cat.color + '18', borderColor: cat.color }]} onPress={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}>
                      <Text style={s.chipIcon}>{cat.icon}</Text>
                      <Text style={[s.chipText, selectedCategory === cat.id && { color: cat.color, fontFamily: F.semibold }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView contentContainerStyle={s.gridContent}>
        <View style={[s.grid, { gridTemplateColumns: `repeat(${R2.numColumns}, 1fr)` }]}>
          {filtered.map((pos: any) => (
            <TouchableOpacity key={pos.id} style={s.card} onPress={() => openPosition(pos)} activeOpacity={0.7}>
              <Image source={{ uri: `/images_final_v2/${String(pos.id).padStart(3, '0')}.png` }} style={s.cardImage} resizeMode="contain" />
              <View style={[s.badge, { position: 'absolute', top: 8, right: 8, backgroundColor: getSafetyColor(pos.safety) }]}>
                <Text style={s.badgeText}>{getSafetyLabel(pos.safety)}</Text>
              </View>
              <TouchableOpacity style={[s.favBtn, favorites.includes(pos.id) && s.favBtnActive]} onPress={() => toggleFavorite(pos.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={favorites.includes(pos.id) ? 'star' : 'star-outline'} size={16} color={favorites.includes(pos.id) ? T.accent : T.textMuted} />
              </TouchableOpacity>
              <View style={s.cardInfo}>
                <Text style={s.cardTitle} numberOfLines={1}>{pos.nameEs}</Text>
                <View style={s.tagRow}>
                  {pos.tags?.slice(0, 2).map((tag: string, i: number) => (
                    <View key={i} style={s.tagMini}><Text style={s.tagMiniText}>{tag}</Text></View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {renderModal()}
    </View>
  );
}

// ===== STYLES =====
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { paddingHorizontal: S.lg, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: S.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  title: { fontSize: FS['3xl'], fontFamily: F.display, color: T.text },
  subtitle: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, marginTop: 2 },

  // Menu
  menuGrid: { padding: S.lg, gap: S.md },
  menuGridDesktop: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  menuCard: {
    ...SHARED.glassCard, alignItems: 'center', gap: S.sm,
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: R.md, paddingHorizontal: S.md, gap: S.sm },
  searchInput: { flex: 1, color: T.text, fontSize: FS.base, fontFamily: F.regular, paddingVertical: 12 },
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: S.xs, paddingHorizontal: S.md, paddingVertical: S.sm, borderRadius: R.md, backgroundColor: T.surface, borderWidth: 1.5, borderColor: T.border },
  filterToggleActive: { borderColor: T.primary, backgroundColor: T.primary + '10' },
  filterToggleText: { fontSize: FS.sm, fontFamily: F.medium, color: T.textMuted },

  catScroll: { paddingVertical: S.xs },
  filtersScroll: { maxHeight: 160 },
  filterGroup: { marginBottom: S.xs },
  filterGroupLabel: { fontSize: FS.xs, fontFamily: F.semibold, color: T.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: S.xs, marginLeft: S.lg },

  // Chips
  chip: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.md, paddingVertical: 10, borderRadius: R.full, backgroundColor: T.surface, borderWidth: 1.5, borderColor: T.border },
  chipIcon: { fontSize: 16 },
  chipText: { color: T.textSecondary, fontSize: FS.sm, fontFamily: F.medium },

  // Grid
  gridContent: { padding: S.lg },
  grid: { display: 'grid', gap: S.md },

  // Cards
  card: { ...SHARED.glassCard, overflow: 'hidden' },
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
  tabRow: { flexDirection: 'row', paddingHorizontal: S.lg, gap: S.sm, marginBottom: S.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, ...SHARED.chip },
  tabText: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textMuted },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: FS.lg, fontFamily: F.regular, color: T.textSecondary, marginTop: S.md },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: T.bgAlt, borderRadius: R.xl, maxHeight: '90%', padding: S.lg, overflow: 'hidden', width: '95%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  modalTitle: { fontSize: FS['2xl'], fontFamily: F.display, color: T.text, flex: 1 },
  modalImage: { width: '100%', height: 200, backgroundColor: '#000', borderRadius: R.lg, marginBottom: S.md },
  modalMeta: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.sm },
  modalActions: { flexDirection: 'row', gap: S.sm, marginLeft: 'auto' },
  modalId: { fontSize: FS.sm, fontFamily: F.regular, color: T.textMuted, flex: 1 },
  modalDesc: { fontSize: FS.base, fontFamily: F.regular, color: T.textSecondary, lineHeight: 22 },

  // Shared components
  glassCard: { ...SHARED.glassCard },
  badge: { ...SHARED.badge },
  badgeText: { color: '#fff', fontSize: FS.xs, fontFamily: F.bold },
  btnPrimary: { ...SHARED.btnPrimary, flexDirection: 'row', gap: S.sm },
  btnPrimaryText: { color: '#fff', fontSize: FS.base, fontFamily: F.bold },
  iconBtn: { backgroundColor: T.surface, borderRadius: R.md, padding: 10, borderWidth: 1, borderColor: T.border },
});
