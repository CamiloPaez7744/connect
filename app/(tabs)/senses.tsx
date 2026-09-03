import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, BP, SHARED, GLASS, SHADOW, useResponsive } from '../../src/tokens';
import BackgroundGradient from '../../src/components/BackgroundGradient';
import RouletteWheel, { RouletteItem } from '../../src/components/RouletteWheel';

const DIFF_COLOR: Record<string, string> = { easy: T.success, medium: T.warning, hard: T.danger };
const DIFF_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' };
const INTENSITY_ICONS = ['🌱', '🌿', '🔥', '💫', '⚡'];
const PLAYER_COLORS = { ella: '#f72585', el: '#3b82f6' };

type Player = 'ella' | 'el' | 'both';

interface GameState {
  active: boolean;
  player: Player;
  currentSense: any;
  currentActivity: any;
  intensity: number;
  usedIds: string[];
  timerActive: boolean;
  timerSeconds: number;
}

export default function SensesScreen() {
  const { width } = useWindowDimensions();
  const R2 = useResponsive(width);
  const [senses, setSenses] = useState<any[]>([]);
  const [selectedSense, setSelectedSense] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [player, setPlayer] = useState<Player>('both');
  const [game, setGame] = useState<GameState>({
    active: false, player: 'both', currentSense: null, currentActivity: null,
    intensity: 1, usedIds: [], timerActive: false, timerSeconds: 0,
  });

  const [rouletteOpen, setRouletteOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/data/senses.json').then(r => r.json()).then(d => setSenses(d)).catch(() => setSenses(require('../../data/senses.json')));
  }, []);

  useEffect(() => {
    if (game.timerActive && game.timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setGame(g => ({ ...g, timerSeconds: g.timerSeconds - 1 }));
      }, 1000);
    } else if (game.timerActive && game.timerSeconds === 0) {
      setGame(g => ({ ...g, timerActive: false }));
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [game.timerActive, game.timerSeconds]);

  const senseItems: RouletteItem[] = senses.map(s => ({
    id: s.id,
    label: s.name,
    icon: s.icon,
    color: s.color,
  }));

  const handleRouletteSpin = (item: RouletteItem) => {
    const sense = senses.find(s => s.id === item.id);
    if (!sense) return;
    const activities = sense.activities.filter(a => !game.usedIds.includes(a.id));
    if (!activities.length) return;
    const act = activities[Math.floor(Math.random() * activities.length)];
    setGame(g => ({
      ...g, active: true, currentSense: sense, currentActivity: { ...act, senseName: sense.name, senseColor: sense.color, senseIcon: sense.icon },
      intensity: 1, usedIds: [...g.usedIds, act.id], timerActive: false, timerSeconds: 0,
    }));
    setRouletteOpen(false);
  };

  const nextActivity = () => {
    const sense = game.currentSense;
    if (!sense) return;
    const activities = sense.activities.filter(a => !game.usedIds.includes(a.id));
    if (!activities.length) {
      setGame(g => ({ ...g, active: false, currentSense: null, currentActivity: null }));
      return;
    }
    const act = activities[Math.floor(Math.random() * activities.length)];
    setGame(g => ({
      ...g, currentActivity: { ...act, senseName: sense.name, senseColor: sense.color, senseIcon: sense.icon },
      usedIds: [...g.usedIds, act.id], timerActive: false, timerSeconds: 0,
    }));
  };

  const changeIntensity = (delta: number) => {
    setGame(g => ({ ...g, intensity: Math.max(1, Math.min(5, g.intensity + delta)) }));
  };

  const startTimer = (seconds: number) => {
    setGame(g => ({ ...g, timerActive: true, timerSeconds: seconds }));
  };

  const stopTimer = () => {
    setGame(g => ({ ...g, timerActive: false, timerSeconds: 0 }));
  };

  const endGame = () => {
    setGame({ active: false, player: 'both', currentSense: null, currentActivity: null, intensity: 1, usedIds: [], timerActive: false, timerSeconds: 0 });
  };

  const renderIntensityDots = (level: number) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i <= level ? game.currentActivity?.senseColor || T.accent : 'rgba(255,255,255,0.1)' }} />
      ))}
    </View>
  );

  const renderCard = (act: any, color: string, onPress?: () => void) => (
    <TouchableOpacity key={act.id} style={[s.activityCard, { borderColor: color + '30', boxShadow: `0 2px 10px ${color}15, 0 0 6px ${color}10` }]} onPress={onPress || (() => setSelectedActivity({ ...act, senseColor: color }))}>
      <View style={s.actHeader}>
        <Text style={s.actName}>{act.name}</Text>
        <View style={[s.miniBadge, { backgroundColor: DIFF_COLOR[act.difficulty] + '25' }]}>
          <Text style={[s.miniBadgeText, { color: DIFF_COLOR[act.difficulty] }]}>{DIFF_LABEL[act.difficulty]}</Text>
        </View>
      </View>
      <Text style={s.actDesc} numberOfLines={2}>{act.description}</Text>
      <View style={s.actMeta}>
        <Ionicons name="time-outline" size={14} color={T.textMuted} />
        <Text style={s.actMetaText}>{act.duration}</Text>
        {act.intensity && (
          <>
            <View style={{ width: 8 }} />
            {renderIntensityDots(act.intensity)}
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={s.container}>
      <BackgroundGradient />
      <View style={s.header}>
        <Text style={s.title}>Sentidos</Text>
        <Text style={s.subtitle}>Explora los 5 sentidos del placer</Text>
      </View>

      {/* Player selector */}
      <View style={s.playerRow}>
        {(['ella', 'el', 'both'] as Player[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[s.playerBtn, player === p && {
              backgroundColor: p === 'both' ? T.primary : PLAYER_COLORS[p],
              borderColor: p === 'both' ? T.primary : PLAYER_COLORS[p],
            }]}
            onPress={() => setPlayer(p)}
          >
            <Text style={[s.playerBtnText, player === p && { color: '#fff' }]}>
              {p === 'both' ? 'Juntos' : p === 'ella' ? '👩 Ella' : '👨 Él'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Roulette button */}
      <TouchableOpacity style={s.rouletteBtn} onPress={() => setRouletteOpen(true)}>
        <Ionicons name="disc" size={22} color="#fff" />
        <Text style={s.rouletteBtnText}>Ruleta de sentidos</Text>
      </TouchableOpacity>

      {/* Roulette Modal */}
      <RouletteWheel
        items={senseItems}
        visible={rouletteOpen}
        centerLabel="GIRAR"
        onSpinEnd={handleRouletteSpin}
        onClose={() => setRouletteOpen(false)}
      />

      {game.active ? (
        /* GAME MODE */
        <View style={s.gameContainer}>
          <View style={[s.gameBanner, { backgroundColor: game.currentActivity?.senseColor + '20', borderColor: game.currentActivity?.senseColor + '40' }]}>
            <Text style={{ fontSize: 28 }}>{game.currentActivity?.senseIcon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.gameBannerTitle, { color: game.currentActivity?.senseColor }]}>{game.currentActivity?.senseName}</Text>
              <Text style={s.gameBannerSub}>{game.player === 'both' ? 'Juntos' : game.player === 'ella' ? '👩 Ella' : '👨 Él'}</Text>
            </View>
          </View>

          <View style={s.intensityRow}>
            <TouchableOpacity onPress={() => changeIntensity(-1)} style={s.intensityBtn}>
              <Ionicons name="remove" size={20} color={T.text} />
            </TouchableOpacity>
            <View style={s.intensityCenter}>
              <Text style={s.intensityLabel}>Intensidad</Text>
              <View style={{ flexDirection: 'row', gap: S.xs, marginTop: 4 }}>
                {INTENSITY_ICONS.map((icon, i) => (
                  <Text key={i} style={{ fontSize: 20, opacity: i < game.intensity ? 1 : 0.2 }}>{icon}</Text>
                ))}
              </View>
            </View>
            <TouchableOpacity onPress={() => changeIntensity(1)} style={s.intensityBtn}>
              <Ionicons name="add" size={20} color={T.text} />
            </TouchableOpacity>
          </View>

          {game.currentActivity && (
            <View style={[s.gameCard, { borderColor: game.currentActivity.senseColor + '30', boxShadow: `0 4px 20px ${game.currentActivity.senseColor}20, 0 0 8px ${game.currentActivity.senseColor}12` }]}>
              <Text style={s.gameCardTitle}>{game.currentActivity.name}</Text>
              <Text style={s.gameCardDesc}>{game.currentActivity.description}</Text>
              {game.currentActivity.tip && (
                <View style={s.tipBox}>
                  <Ionicons name="bulb-outline" size={16} color="#ffd166" />
                  <Text style={s.tipText}>{game.currentActivity.tip}</Text>
                </View>
              )}
            </View>
          )}

          <View style={s.timerRow}>
            {game.timerActive ? (
              <View style={s.timerActiveRow}>
                <Text style={[s.timerText, { color: game.timerSeconds <= 10 ? T.danger : T.primary }]}>
                  {formatTimer(game.timerSeconds)}
                </Text>
                <TouchableOpacity onPress={stopTimer} style={s.timerStopBtn}>
                  <Ionicons name="pause" size={16} color="#fff" />
                  <Text style={s.timerStopText}>Parar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.timerBtnsRow}>
                {[30, 60, 120, 300].map(sec => (
                  <TouchableOpacity key={sec} style={s.timerBtn} onPress={() => startTimer(sec)}>
                    <Text style={s.timerBtnText}>{sec >= 60 ? `${sec / 60}m` : `${sec}s`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={s.gameActions}>
            <TouchableOpacity style={[s.gameActionBtn, { backgroundColor: game.currentActivity?.senseColor || T.primary }]} onPress={nextActivity}>
              <Ionicons name="shuffle" size={18} color="#fff" />
              <Text style={s.gameActionText}>Siguiente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.gameActionBtn, { backgroundColor: T.danger }]} onPress={endGame}>
              <Ionicons name="stop" size={18} color="#fff" />
              <Text style={s.gameActionText}>Terminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* BROWSE MODE */
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[s.sensesGrid, R2.isDesktop && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
            {senses.map(sense => (
              <TouchableOpacity key={sense.id} style={[s.senseCard, { borderColor: sense.color + '25', boxShadow: `0 2px 12px ${sense.color}15, 0 0 8px ${sense.color}10` }, R2.isDesktop && { flex: 1, minWidth: 180 }]} onPress={() => setSelectedSense(sense)}>
                <Text style={{ fontSize: 28 }}>{sense.icon}</Text>
                <Text style={[s.senseName, { color: sense.color }]}>{sense.name}</Text>
                <Text style={s.senseCount}>{sense.activities.length} actividades</Text>
              </TouchableOpacity>
            ))}
          </View>

          {senses.map(sense => (
            <View key={sense.id} style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={{ fontSize: 22 }}>{sense.icon}</Text>
                <Text style={[s.sectionTitle, { color: sense.color }]}>{sense.name}</Text>
              </View>
              <Text style={s.sectionDesc}>{sense.description}</Text>
              {sense.activities.map((act: any) => renderCard(act, sense.color))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Sense Modal */}
      <Modal visible={!!selectedSense} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, R2.isDesktop && { maxWidth: 500, alignSelf: 'center' }]}>
            {selectedSense && (
              <>
                <View style={s.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, flex: 1 }}>
                    <Text style={{ fontSize: 24 }}>{selectedSense.icon}</Text>
                    <Text style={[s.modalTitle, { color: selectedSense.color }]}>{selectedSense.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedSense(null)}><Ionicons name="close" size={24} color={T.text} /></TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={s.modalDesc}>{selectedSense.description}</Text>
                  {selectedSense.activities.map((act: any) => renderCard(act, selectedSense.color))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Activity Modal */}
      <Modal visible={!!selectedActivity} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, R2.isDesktop && { maxWidth: 500, alignSelf: 'center' }]}>
            {selectedActivity && (
              <>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>{selectedActivity.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedActivity(null)}><Ionicons name="close" size={24} color={T.text} /></TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[s.badge, { backgroundColor: selectedActivity.senseColor + '20', alignSelf: 'flex-start', marginBottom: S.md }]}>
                    <Text style={[s.badgeText, { color: selectedActivity.senseColor }]}>{selectedActivity.senseName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: S.sm, marginBottom: S.md }}>
                    <View style={[s.miniBadge, { backgroundColor: DIFF_COLOR[selectedActivity.difficulty] + '25' }]}>
                      <Text style={[s.miniBadgeText, { color: DIFF_COLOR[selectedActivity.difficulty] }]}>{DIFF_LABEL[selectedActivity.difficulty]}</Text>
                    </View>
                    <View style={s.miniBadge}>
                      <Ionicons name="time-outline" size={14} color={T.textSecondary} />
                      <Text style={s.miniBadgeText}>{selectedActivity.duration}</Text>
                    </View>
                    {selectedActivity.intensity && (
                      <View style={s.miniBadge}>
                        {renderIntensityDots(selectedActivity.intensity)}
                      </View>
                    )}
                  </View>
                  <Text style={s.modalDesc}>{selectedActivity.description}</Text>
                  {selectedActivity.materials?.length > 0 && (
                    <View style={{ marginTop: S.md }}>
                      <Text style={s.materialsTitle}>Materiales</Text>
                      {selectedActivity.materials.map((m: string, i: number) => (
                        <View key={i} style={s.materialItem}>
                          <Ionicons name="checkmark-circle" size={16} color={T.primary} />
                          <Text style={s.materialText}>{m}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {selectedActivity.tip && (
                    <View style={s.tipBox}>
                      <Ionicons name="bulb-outline" size={18} color="#ffd166" />
                      <Text style={s.tipText}>{selectedActivity.tip}</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { paddingHorizontal: S.lg, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: S.sm },
  title: { fontSize: FS['3xl'], fontFamily: F.display, color: T.text },
  subtitle: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, marginTop: 2 },

  playerRow: { flexDirection: 'row', paddingHorizontal: S.lg, gap: S.sm, marginBottom: S.md },
  playerBtn: { flex: 1, paddingVertical: S.sm, borderRadius: R.full, borderWidth: 1.5, borderColor: T.border, alignItems: 'center', backgroundColor: 'rgba(26,31,53,0.7)' },
  playerBtnText: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textSecondary },

  rouletteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, backgroundColor: '#7b2ff7', marginHorizontal: S.lg, paddingVertical: S.md, borderRadius: R.lg, marginBottom: S.lg, boxShadow: '0 2px 12px rgba(123,47,247,0.25)' },
  rouletteBtnText: { color: '#fff', fontSize: FS.base, fontFamily: F.semibold },

  sensesGrid: { paddingHorizontal: S.lg, gap: S.md, marginBottom: S.xl },
  senseCard: { ...GLASS.card, padding: S.lg, alignItems: 'center', gap: S.xs },
  senseName: { fontSize: FS.lg, fontFamily: F.bold },
  senseCount: { fontSize: FS.xs, fontFamily: F.regular, color: T.textMuted },

  section: { paddingHorizontal: S.lg, marginBottom: S.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.xs },
  sectionTitle: { fontSize: FS.xl, fontFamily: F.bold },
  sectionDesc: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, lineHeight: 20, marginBottom: S.md },

  activityCard: { ...GLASS.card, padding: S.md, marginBottom: S.sm },
  actHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xs },
  actName: { fontSize: FS.base, fontFamily: F.semibold, color: T.text, flex: 1 },
  actDesc: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, lineHeight: 18, marginBottom: S.sm },
  actMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actMetaText: { fontSize: FS.xs, fontFamily: F.regular, color: T.textMuted },

  gameContainer: { flex: 1, paddingHorizontal: S.lg, paddingBottom: S.xl },
  gameBanner: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md, borderRadius: R.lg, borderWidth: 1, marginBottom: S.md },
  gameBannerTitle: { fontSize: FS.xl, fontFamily: F.bold },
  gameBannerSub: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary },

  intensityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.md, ...GLASS.card, padding: S.md },
  intensityBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  intensityCenter: { alignItems: 'center' },
  intensityLabel: { fontSize: FS.xs, fontFamily: F.medium, color: T.textSecondary },

  gameCard: { ...GLASS.card, padding: S.lg, marginBottom: S.md, borderWidth: 1 },
  gameCardTitle: { fontSize: FS.xl, fontFamily: F.bold, color: T.text, marginBottom: S.sm },
  gameCardDesc: { fontSize: FS.base, fontFamily: F.regular, color: T.textSecondary, lineHeight: 22 },

  timerRow: { marginBottom: S.md },
  timerActiveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...GLASS.card, padding: S.md },
  timerText: { fontSize: FS['2xl'], fontFamily: F.display },
  timerStopBtn: { flexDirection: 'row', alignItems: 'center', gap: S.xs, backgroundColor: T.danger, paddingHorizontal: S.md, paddingVertical: S.sm, borderRadius: R.md },
  timerStopText: { color: '#fff', fontSize: FS.sm, fontFamily: F.semibold },
  timerBtnsRow: { flexDirection: 'row', gap: S.sm },
  timerBtn: { flex: 1, paddingVertical: S.sm, borderRadius: R.md, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', borderWidth: 1, borderColor: T.border },
  timerBtnText: { fontSize: FS.sm, fontFamily: F.semibold, color: T.text },

  gameActions: { flexDirection: 'row', gap: S.md },
  gameActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingVertical: S.md, borderRadius: R.lg, ...SHADOW.md },
  gameActionText: { color: '#fff', fontSize: FS.base, fontFamily: F.semibold },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: { ...GLASS.elevated, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, maxHeight: '90%', padding: S.lg, overflow: 'hidden', borderColor: 'rgba(0,229,199,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 6px rgba(0,229,199,0.08)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  modalTitle: { fontSize: FS['2xl'], fontFamily: F.display, color: T.text, flex: 1 },
  modalDesc: { fontSize: FS.base, fontFamily: F.regular, color: T.textSecondary, lineHeight: 22 },

  badge: { ...SHARED.badge },
  badgeText: { fontSize: FS.xs, fontFamily: F.bold },
  miniBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, ...SHARED.badge, ...GLASS.chip },
  miniBadgeText: { fontSize: FS.xs, fontFamily: F.medium, color: T.textSecondary },

  materialsTitle: { fontSize: FS.sm, fontFamily: F.semibold, color: T.text, marginBottom: S.sm },
  materialItem: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.xs },
  materialText: { fontSize: FS.base, fontFamily: F.regular, color: T.textSecondary },

  tipBox: { flexDirection: 'row', gap: S.sm, backgroundColor: '#ffd16612', borderRadius: R.md, padding: S.md, borderWidth: 1, borderColor: '#ffd16625', marginTop: S.md },
  tipText: { flex: 1, fontSize: FS.sm, fontFamily: F.regular, color: '#ffd166', lineHeight: 20 },
});
