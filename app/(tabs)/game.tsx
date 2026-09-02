import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, BP, SHARED, GLASS, SHADOW, useResponsive } from '../../src/tokens';
import BackgroundGradient from '../../src/components/BackgroundGradient';

const GAME_MODES = [
  { id: 'pareja', name: 'Pareja', icon: '💑', color: T.accent },
  { id: 'grupo', name: 'Grupo', icon: '👥', color: '#7b2ff7' },
];

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

type GameType = 'truth' | 'dare';

export default function GameScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BP.lg;

  const [gameType, setGameType] = useState<GameType>('truth');
  const [gameMode, setGameMode] = useState('pareja');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);
  const [usedCards, setUsedCards] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const [questions, setQuestions] = useState<any[]>([]);
  const [dares, setDares] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/questions.json').then(r => r.json()).then(d => setQuestions(d)).catch(() => setQuestions(require('../../data/questions.json')));
    fetch('/data/dares.json').then(r => r.json()).then(d => setDares(d)).catch(() => setDares(require('../../data/dares.json')));
  }, []);

  const categories = gameType === 'truth' ? TRUTH_CATS : DARE_CATS;

  const getRandomCard = () => {
    const data = gameType === 'truth' ? questions : dares;
    let available = data.filter((c: any) => !usedCards.includes(c.id) && (c.mode === gameMode || c.mode === 'pareja'));
    if (selectedCategory !== 'all') available = available.filter((c: any) => c.category === selectedCategory);
    if (available.length === 0) {
      setUsedCards([]);
      available = data.filter((c: any) => (c.mode === gameMode || c.mode === 'pareja'));
      if (selectedCategory !== 'all') available = available.filter((c: any) => c.category === selectedCategory);
    }
    return available[Math.floor(Math.random() * available.length)];
  };

  const flipCard = () => {
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    const card = getRandomCard();
    if (card) {
      setCurrentCard(card);
      setUsedCards(p => [...p, card.id]);
      setShowCard(true);
      setHistory(p => [{ ...card, type: gameType }, ...p]);
    }
  };

  const cardRotate = cardAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const intensityColor = (i: number) => i <= 2 ? T.success : i <= 3 ? T.warning : T.danger;
  const intensityLabel = (i: number) => i <= 2 ? 'Suave' : i <= 3 ? 'Medio' : 'Picante';
  const catInfo = (id: string) => [...TRUTH_CATS, ...DARE_CATS].find(c => c.id === id) || TRUTH_CATS[0];

  return (
    <View style={s.container}>
      <BackgroundGradient />
      <View style={s.header}>
        <Text style={s.title}>Juego</Text>
        <Text style={s.subtitle}>Verdad o Reto</Text>
      </View>

      {/* Mode */}
      <View style={s.modeRow}>
        {GAME_MODES.map(m => (
          <TouchableOpacity key={m.id} style={[s.modeBtn, gameMode === m.id && { backgroundColor: m.color + '20', borderColor: m.color }]} onPress={() => { setGameMode(m.id); setSelectedCategory('all'); setUsedCards([]); setShowCard(false); }}>
            <Text style={{ fontSize: 18 }}>{m.icon}</Text>
            <Text style={[s.modeText, gameMode === m.id && { color: m.color }]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Type */}
      <View style={s.typeRow}>
        <TouchableOpacity style={[s.typeBtn, gameType === 'truth' && s.typeBtnActive]} onPress={() => { setGameType('truth'); setSelectedCategory('all'); setUsedCards([]); setShowCard(false); }}>
          <Ionicons name="chatbubble" size={18} color={gameType === 'truth' ? '#fff' : T.textMuted} />
          <Text style={[s.typeBtnText, gameType === 'truth' && { color: '#fff' }]}>Verdad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.typeBtn, gameType === 'dare' && s.typeBtnActiveDare]} onPress={() => { setGameType('dare'); setSelectedCategory('all'); setUsedCards([]); setShowCard(false); }}>
          <Ionicons name="flame" size={18} color={gameType === 'dare' ? '#fff' : T.textMuted} />
          <Text style={[s.typeBtnText, gameType === 'dare' && { color: '#fff' }]}>Reto</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
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

      {/* Card */}
      <View style={s.cardArea}>
        {showCard && currentCard ? (
          <Animated.View style={[s.gameCard, { transform: [{ rotateY: cardRotate }] }, isDesktop && { maxWidth: 500 }]}>
            <View style={s.cardHeader}>
              <View style={[s.badge, { backgroundColor: gameType === 'truth' ? '#4cc9f025' : '#f7258525' }]}>
                <Text style={[s.badgeText, { color: gameType === 'truth' ? '#4cc9f0' : '#f72585' }]}>
                  {gameType === 'truth' ? '💬 Verdad' : '🔥 Reto'}
                </Text>
              </View>
              <View style={[s.badge, { backgroundColor: intensityColor(currentCard.intensity) + '25' }]}>
                <Text style={[s.badgeText, { color: intensityColor(currentCard.intensity) }]}>
                  {intensityLabel(currentCard.intensity)}
                </Text>
              </View>
            </View>
            <Text style={s.cardContent}>{currentCard.question || currentCard.dare}</Text>
            <Text style={s.cardCat}>{catInfo(currentCard.category).icon} {catInfo(currentCard.category).name}</Text>
          </Animated.View>
        ) : (
          <View style={s.placeholder}>
            <Ionicons name={gameType === 'truth' ? 'chatbubble-outline' : 'flame-outline'} size={64} color={T.textMuted} />
            <Text style={s.placeholderText}>{gameType === 'truth' ? 'Presiona para una verdad' : 'Presiona para un reto'}</Text>
          </View>
        )}
      </View>

      {/* Draw */}
      <TouchableOpacity style={[s.drawBtn, gameType === 'truth' ? { backgroundColor: '#4cc9f0' } : { backgroundColor: '#f72585' }]} onPress={flipCard}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={s.drawBtnText}>{showCard ? 'Otra carta' : 'Sacar carta'}</Text>
      </TouchableOpacity>

      {/* History */}
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
  title: { fontSize: FS['3xl'], fontFamily: F.display, color: T.text },
  subtitle: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, marginTop: 2 },

  modeRow: { flexDirection: 'row', paddingHorizontal: S.lg, gap: S.md, marginBottom: S.sm },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, ...GLASS.card, paddingVertical: S.md, ...SHADOW.sm },
  modeText: { fontSize: FS.base, fontFamily: F.semibold, color: T.textSecondary },

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

  drawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, marginHorizontal: S.lg, marginBottom: S.md, paddingVertical: S.lg, borderRadius: R.lg, ...SHADOW.md },
  drawBtnText: { color: '#fff', fontSize: FS.lg, fontFamily: F.bold },

  historySection: { paddingHorizontal: S.lg, paddingBottom: S.lg },
  historyTitle: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textSecondary, marginBottom: S.sm },
  historyChip: { flexDirection: 'row', alignItems: 'center', gap: S.sm, ...GLASS.chip, paddingHorizontal: S.md, paddingVertical: S.sm, marginRight: S.sm },
  historyText: { fontSize: FS.xs, fontFamily: F.regular, color: T.textSecondary, maxWidth: 100 },

  badge: { ...SHARED.badge },
  badgeText: { fontSize: FS.xs, fontFamily: F.bold },
});
