import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, BP, SHARED, GLASS, SHADOW, useResponsive } from '../../src/tokens';
import BackgroundGradient from '../../src/components/BackgroundGradient';

const TRUTH_CATS = [
  { id: 'all', name: 'Todas', icon: '✨', color: T.primary },
  { id: 'descubrimiento', name: 'Descubrimiento', icon: '🔍', color: '#4cc9f0' },
  { id: 'deseos', name: 'Deseos', icon: '🔥', color: '#f72585' },
  { id: 'fantasias', name: 'Fantasías', icon: '💭', color: '#7b2ff7' },
  { id: 'recuerdos', name: 'Recuerdos', icon: '📸', color: '#ffd166' },
  { id: 'juegos', name: 'Juegos', icon: '🎮', color: T.primary },
  { id: 'intimidad', name: 'Intimidad', icon: '💕', color: '#f72585' },
  { id: 'caliente', name: 'Caliente', icon: '🌡️', color: '#ef4444' },
];

const DARE_CATS = [
  { id: 'all', name: 'Todas', icon: '✨', color: T.primary },
  { id: 'sensual', name: 'Sensual', icon: '💋', color: '#f72585' },
  { id: 'erotico', name: 'Erotico', icon: '🔥', color: '#ef4444' },
  { id: 'divertido', name: 'Divertido', icon: '😂', color: '#ffd166' },
  { id: 'atrevido', name: 'Atrevido', icon: '😈', color: '#7b2ff7' },
  { id: 'extremo', name: 'Extremo', icon: '⚡', color: '#ef4444' },
  { id: 'romantico', name: 'Romántico', icon: '💕', color: '#f72585' },
];

const INTENSITY_LEVELS = [
  { id: 1, label: 'Suave', icon: '🌱', color: T.success, desc: 'Tímido, para romper el hielo' },
  { id: 2, label: 'Cálida', icon: '🌤️', color: '#4cc9f0', desc: 'Un poco más atrevido' },
  { id: 3, label: 'Picante', icon: '🌶️', color: T.warning, desc: 'Directo y sensual' },
  { id: 4, label: 'Caliente', icon: '🔥', color: '#f72585', desc: 'Explícito y atrevido' },
  { id: 5, label: 'Extremo', icon: '⚡', color: T.danger, desc: 'Sin límites' },
];

type GameType = 'truth' | 'dare';

export default function GameScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BP.lg;

  const [gameType, setGameType] = useState<GameType>('truth');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxIntensity, setMaxIntensity] = useState(5);
  const [selectedIntensity, setSelectedIntensity] = useState(1);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showIntensity, setShowIntensity] = useState(false);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const [questions, setQuestions] = useState<any[]>([]);
  const [dares, setDares] = useState<any[]>([]);
  const [herName, setHerName] = useState('');
  const [hisName, setHisName] = useState('');

  useEffect(() => {
    if (Platform.OS === 'web') {
      fetch('/data/questions.json').then(r => r.json()).then(d => setQuestions(d)).catch(() => setQuestions(require('../../data/questions.json')));
      fetch('/data/dares.json').then(r => r.json()).then(d => setDares(d)).catch(() => setDares(require('../../data/dares.json')));
    } else {
      setQuestions(require('../../data/questions.json'));
      setDares(require('../../data/dares.json'));
    }
    (async () => {
      try {
        const explicit = await AsyncStorage.getItem('settings_explicitMode');
        if (explicit === 'false') setMaxIntensity(3);
        else setMaxIntensity(5);
        const h = await AsyncStorage.getItem('couple_herName');
        const s = await AsyncStorage.getItem('couple_hisName');
        if (h) setHerName(h);
        if (s) setHisName(s);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    setSelectedIntensity(1);
    setUsedIds([]);
    setShowCard(false);
    setCurrentCard(null);
  }, [gameType]);

  const categories = gameType === 'truth' ? TRUTH_CATS : DARE_CATS;

  const flipCard = () => {
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    const data = gameType === 'truth' ? questions : dares;
    let available = data.filter((c: any) => !usedIds.includes(c.id));
    available = available.filter((c: any) => c.intensity === selectedIntensity);
    if (selectedCategory !== 'all') available = available.filter((c: any) => c.category === selectedCategory);
    if (available.length === 0) {
      setUsedIds([]);
      available = data.filter((c: any) => c.intensity === selectedIntensity);
      if (selectedCategory !== 'all') available = available.filter((c: any) => c.category === selectedCategory);
    }
    const card = available[Math.floor(Math.random() * available.length)];
    if (card) {
      setCurrentCard(card);
      setUsedIds(p => [...p, card.id]);
      setShowCard(true);
      setHistory(p => [{ ...card, type: gameType }, ...p]);
    }
  };

  const cardRotate = cardAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const levelInfo = (i: number) => INTENSITY_LEVELS.find(l => l.id === i) || INTENSITY_LEVELS[0];
  const catInfo = (id: string) => [...TRUTH_CATS, ...DARE_CATS].find(c => c.id === id) || TRUTH_CATS[0];

  const personalize = (text: string) => {
    if (!herName && !hisName) return text;
    const she = herName || 'Ella';
    const he = hisName || 'Él';
    return text.replace(/\buno\b/gi, he).replace(/\bel otro\b/gi, she).replace(/\buna\b/gi, she);
  };

  return (
    <View style={s.container}>
      <BackgroundGradient />
      <View style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>Verdad o Reto</Text>
          </View>
          <View style={s.headerBtns}>
            <TouchableOpacity style={s.filterBtn} onPress={() => { setShowIntensity(p => !p); setShowFilters(false); }}>
              <Text style={s.filterBtnEmoji}>{levelInfo(selectedIntensity).icon}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.filterBtn} onPress={() => { setShowFilters(p => !p); setShowIntensity(false); }}>
              <Ionicons name={showFilters ? 'options' : 'options-outline'} size={18} color={T.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showIntensity && (
        <View style={s.intensityWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.intensityScroll}>
            {INTENSITY_LEVELS.filter(l => l.id <= maxIntensity).map(level => {
              const active = selectedIntensity === level.id;
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[s.intensityBtn, active && { backgroundColor: level.color + '20', borderColor: level.color, boxShadow: `0 0 12px ${level.color}30` }]}
                  onPress={() => { setSelectedIntensity(level.id); setShowIntensity(false); setUsedIds([]); setShowCard(false); setCurrentCard(null); }}
                >
                  <Text style={s.intensityEmoji}>{level.icon}</Text>
                  <Text style={[s.intensityLabel, active && { color: level.color }]}>{level.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={s.typeRow}>
        <TouchableOpacity style={[s.typeBtn, gameType === 'truth' && s.typeBtnActive, gameType === 'truth' && { boxShadow: '0 0 16px rgba(76,201,240,0.25)' }]} onPress={() => { setGameType('truth'); setSelectedCategory('all'); }}>
          <Ionicons name="chatbubble" size={18} color={gameType === 'truth' ? '#fff' : T.textMuted} />
          <Text style={[s.typeBtnText, gameType === 'truth' && { color: '#fff' }]}>Verdad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.typeBtn, gameType === 'dare' && s.typeBtnActiveDare, gameType === 'dare' && { boxShadow: '0 0 16px rgba(247,37,133,0.25)' }]} onPress={() => { setGameType('dare'); setSelectedCategory('all'); }}>
          <Ionicons name="flame" size={18} color={gameType === 'dare' ? '#fff' : T.textMuted} />
          <Text style={[s.typeBtnText, gameType === 'dare' && { color: '#fff' }]}>Reto</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={s.catWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
            {categories.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity key={cat.id} style={[s.chip, active && { backgroundColor: cat.color + '18', borderColor: cat.color }]} onPress={() => setSelectedCategory(active ? 'all' : cat.id)}>
                  <Text style={[s.chipIcon, active && { transform: [{ scale: 1.15 }] }]}>{cat.icon}</Text>
                  <Text style={[s.chipText, active && { color: cat.color, fontFamily: F.semibold }]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={s.cardArea}>
        {showCard && currentCard ? (
          <Animated.View style={[s.gameCard, { transform: [{ rotateY: cardRotate }] }, isDesktop && { maxWidth: 500 }, { boxShadow: gameType === 'truth' ? '0 0 20px rgba(76,201,240,0.2)' : '0 0 20px rgba(247,37,133,0.2)' }]}>
            <View style={s.cardHeader}>
              <View style={[s.badge, { backgroundColor: gameType === 'truth' ? '#4cc9f025' : '#f7258525' }]}>
                <Text style={[s.badgeText, { color: gameType === 'truth' ? '#4cc9f0' : '#f72585' }]}>
                  {gameType === 'truth' ? '💬 Verdad' : '🔥 Reto'}
                </Text>
              </View>
              <View style={[s.badge, { backgroundColor: levelInfo(currentCard.intensity).color + '25' }]}>
                <Text style={[s.badgeText, { color: levelInfo(currentCard.intensity).color }]}>
                  {levelInfo(currentCard.intensity).icon} {levelInfo(currentCard.intensity).label}
                </Text>
              </View>
            </View>
            <Text style={s.cardContent}>{personalize(currentCard.question || currentCard.dare)}</Text>
            <Text style={s.cardCat}>{catInfo(currentCard.category).icon} {catInfo(currentCard.category).name}</Text>
          </Animated.View>
        ) : (
          <View style={s.placeholder}>
            <Ionicons name={gameType === 'truth' ? 'chatbubble-outline' : 'flame-outline'} size={64} color={T.textMuted} />
            <Text style={s.placeholderText}>{gameType === 'truth' ? 'Presiona para una verdad' : 'Presiona para un reto'}</Text>
            <Text style={s.placeholderSub}>Nivel: {levelInfo(selectedIntensity).icon} {levelInfo(selectedIntensity).label}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={[s.drawBtn, gameType === 'truth' ? { backgroundColor: '#4cc9f0', boxShadow: '0 0 16px rgba(76,201,240,0.3)' } : { backgroundColor: '#f72585', boxShadow: '0 0 16px rgba(247,37,133,0.3)' }]} onPress={flipCard}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={s.drawBtnText}>{showCard ? 'Otra carta' : 'Sacar carta'}</Text>
      </TouchableOpacity>

      {history.length > 0 && (
        <View style={s.historySection}>
          <Text style={s.historyTitle}>Historial ({history.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {history.slice(0, 10).map((h, i) => (
              <View key={i} style={s.historyChip}>
                <Text>{h.type === 'truth' ? '💬' : '🔥'}</Text>
                <Text style={s.historyText} numberOfLines={1}>{(h.question || h.dare || '').slice(0, 25)}...</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { paddingHorizontal: S.lg, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: S.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: FS['3xl'], fontFamily: F.display, color: T.text },
  headerBtns: { flexDirection: 'row', gap: S.sm },

  filterBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    ...GLASS.chip, borderWidth: 1,
  },
  filterBtnEmoji: { fontSize: 18 },

  intensityWrap: { marginBottom: S.sm },
  intensityScroll: { paddingHorizontal: S.lg, gap: S.sm },
  intensityBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: S.md, paddingVertical: 8,
    borderRadius: R.full, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(26,31,53,0.5)',
  },
  intensityEmoji: { fontSize: 16 },
  intensityLabel: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textSecondary },

  typeRow: { flexDirection: 'row', paddingHorizontal: S.lg, gap: S.md, marginBottom: S.md },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, ...GLASS.card, paddingVertical: S.lg, ...SHADOW.sm },
  typeBtnActive: { backgroundColor: '#4cc9f025', borderColor: '#4cc9f0' },
  typeBtnActiveDare: { backgroundColor: '#f7258525', borderColor: '#f72585' },
  typeBtnText: { fontSize: FS.lg, fontFamily: F.semibold, color: T.textMuted },

  catWrap: { marginBottom: S.lg },
  catScroll: { paddingHorizontal: S.lg, gap: S.sm },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    paddingHorizontal: S.md, paddingVertical: 10,
    borderRadius: R.full,
    ...GLASS.chip,
    borderWidth: 1.5,
  },
  chipIcon: { fontSize: 16 },
  chipText: { color: T.textSecondary, fontSize: FS.sm, fontFamily: F.medium },

  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: S.lg },
  gameCard: { width: '100%', ...GLASS.card, padding: S.xl, ...SHADOW.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: S.lg },
  cardContent: { fontSize: FS.xl, fontFamily: F.medium, color: T.text, lineHeight: 30, textAlign: 'center', marginBottom: S.lg },
  cardCat: { fontSize: FS.sm, fontFamily: F.regular, color: T.textMuted, textAlign: 'center' },
  placeholder: { alignItems: 'center', gap: S.md },
  placeholderText: { fontSize: FS.lg, fontFamily: F.regular, color: T.textMuted },
  placeholderSub: { fontSize: FS.sm, fontFamily: F.medium, color: T.textSecondary },

  drawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, marginHorizontal: S.lg, marginBottom: S.md, paddingVertical: S.lg, borderRadius: R.lg, ...SHADOW.md },
  drawBtnText: { color: '#fff', fontSize: FS.lg, fontFamily: F.bold },

  historySection: { paddingHorizontal: S.lg, paddingBottom: S.lg },
  historyTitle: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textSecondary, marginBottom: S.sm },
  historyChip: { flexDirection: 'row', alignItems: 'center', gap: S.sm, ...GLASS.chip, paddingHorizontal: S.md, paddingVertical: S.sm, marginRight: S.sm },
  historyText: { fontSize: FS.xs, fontFamily: F.regular, color: T.textSecondary, maxWidth: 100 },

  badge: { ...SHARED.badge },
  badgeText: { fontSize: FS.xs, fontFamily: F.bold },
});
