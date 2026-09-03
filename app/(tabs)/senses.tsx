import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, BP, SHARED, GLASS, SHADOW, useResponsive } from '../../src/tokens';
import BackgroundGradient from '../../src/components/BackgroundGradient';

const DIFF_COLOR: Record<string, string> = { easy: T.success, medium: T.warning, hard: T.danger };
const DIFF_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' };

export default function SensesScreen() {
  const { width } = useWindowDimensions();
  const R2 = useResponsive(width);
  const [senses, setSenses] = useState<any[]>([]);
  const [selectedSense, setSelectedSense] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [randomActivity, setRandomActivity] = useState<any>(null);

  useEffect(() => {
    fetch('/data/senses.json').then(r => r.json()).then(d => setSenses(d)).catch(() => setSenses(require('../../data/senses.json')));
  }, []);

  const getRandom = () => {
    if (!senses.length) return;
    const sense = senses[Math.floor(Math.random() * senses.length)];
    const act = sense.activities[Math.floor(Math.random() * sense.activities.length)];
    setRandomActivity({ ...act, senseName: sense.name, senseColor: sense.color, senseIcon: sense.icon });
  };

  const renderCard = (act: any, color: string) => (
    <TouchableOpacity key={act.id} style={s.activityCard} onPress={() => setSelectedActivity({ ...act, senseColor: color })}>
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
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <BackgroundGradient />
      <View style={s.header}>
        <Text style={s.title}>Sentidos</Text>
        <Text style={s.subtitle}>Explora los 5 sentidos del placer</Text>
      </View>

      <TouchableOpacity style={s.randomBtn} onPress={getRandom}>
        <Ionicons name="shuffle" size={20} color="#fff" />
        <Text style={s.randomBtnText}>Actividad aleatoria</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.sensesGrid, R2.isDesktop && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
          {senses.map(sense => (
            <TouchableOpacity key={sense.id} style={[s.senseCard, R2.isDesktop && { flex: 1, minWidth: 180 }]} onPress={() => setSelectedSense(sense)}>
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

      {/* Random Modal */}
      <Modal visible={!!randomActivity} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, R2.isDesktop && { maxWidth: 500, alignSelf: 'center' }]}>
            {randomActivity && (
              <>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>Actividad Aleatoria</Text>
                  <TouchableOpacity onPress={() => setRandomActivity(null)}><Ionicons name="close" size={24} color={T.text} /></TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[s.badge, { backgroundColor: randomActivity.senseColor + '20', alignSelf: 'flex-start', marginBottom: S.md }]}>
                    <Text style={[s.badgeText, { color: randomActivity.senseColor }]}>{randomActivity.senseIcon} {randomActivity.senseName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: S.sm, marginBottom: S.md }}>
                    <View style={[s.miniBadge, { backgroundColor: DIFF_COLOR[randomActivity.difficulty] + '25' }]}>
                      <Text style={[s.miniBadgeText, { color: DIFF_COLOR[randomActivity.difficulty] }]}>{DIFF_LABEL[randomActivity.difficulty]}</Text>
                    </View>
                    <View style={s.miniBadge}>
                      <Ionicons name="time-outline" size={14} color={T.textSecondary} />
                      <Text style={s.miniBadgeText}>{randomActivity.duration}</Text>
                    </View>
                  </View>
                  <Text style={s.modalDesc}>{randomActivity.description}</Text>
                  {randomActivity.materials && (
                    <View style={{ marginTop: S.md }}>
                      <Text style={s.materialsTitle}>Materiales</Text>
                      {randomActivity.materials.map((m: string, i: number) => (
                        <View key={i} style={s.materialItem}>
                          <Ionicons name="checkmark-circle" size={16} color={T.primary} />
                          <Text style={s.materialText}>{m}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {randomActivity.tip && (
                    <View style={s.tipBox}>
                      <Ionicons name="bulb-outline" size={18} color="#ffd166" />
                      <Text style={s.tipText}>{randomActivity.tip}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={[s.drawBtn, { backgroundColor: randomActivity.senseColor }]} onPress={getRandom}>
                    <Ionicons name="shuffle" size={18} color="#fff" />
                    <Text style={s.drawBtnText}>Otra actividad</Text>
                  </TouchableOpacity>
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

  randomBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, backgroundColor: '#7b2ff7', marginHorizontal: S.lg, paddingVertical: S.md, borderRadius: R.lg, marginBottom: S.lg, ...SHADOW.neonDual },
  randomBtnText: { color: '#fff', fontSize: FS.base, fontFamily: F.semibold },

  sensesGrid: { paddingHorizontal: S.lg, gap: S.md, marginBottom: S.xl },
  senseCard: { ...GLASS.card, padding: S.lg, alignItems: 'center', gap: S.xs, ...SHADOW.sm },
  senseName: { fontSize: FS.lg, fontFamily: F.bold },
  senseCount: { fontSize: FS.xs, fontFamily: F.regular, color: T.textMuted },

  section: { paddingHorizontal: S.lg, marginBottom: S.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.xs },
  sectionTitle: { fontSize: FS.xl, fontFamily: F.bold },
  sectionDesc: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, lineHeight: 20, marginBottom: S.md },

  activityCard: { ...GLASS.card, padding: S.md, marginBottom: S.sm, ...SHADOW.sm },
  actHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xs },
  actName: { fontSize: FS.base, fontFamily: F.semibold, color: T.text, flex: 1 },
  actDesc: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, lineHeight: 18, marginBottom: S.sm },
  actMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actMetaText: { fontSize: FS.xs, fontFamily: F.regular, color: T.textMuted },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: { ...GLASS.elevated, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, maxHeight: '90%', padding: S.lg, overflow: 'hidden', borderColor: 'rgba(0,229,199,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 6px rgba(0,229,199,0.08)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  modalTitle: { fontSize: FS['2xl'], fontFamily: F.display, color: T.text, flex: 1 },
  modalDesc: { fontSize: FS.base, fontFamily: F.regular, color: T.textSecondary, lineHeight: 22 },

  // Components
  badge: { ...SHARED.badge },
  badgeText: { fontSize: FS.xs, fontFamily: F.bold },
  miniBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, ...SHARED.badge, ...GLASS.chip },
  miniBadgeText: { fontSize: FS.xs, fontFamily: F.medium, color: T.textSecondary },

  materialsTitle: { fontSize: FS.sm, fontFamily: F.semibold, color: T.text, marginBottom: S.sm },
  materialItem: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.xs },
  materialText: { fontSize: FS.base, fontFamily: F.regular, color: T.textSecondary },

  tipBox: { flexDirection: 'row', gap: S.sm, backgroundColor: '#ffd16612', borderRadius: R.md, padding: S.md, borderWidth: 1, borderColor: '#ffd16625', marginTop: S.md },
  tipText: { flex: 1, fontSize: FS.sm, fontFamily: F.regular, color: '#ffd166', lineHeight: 20 },

  drawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingVertical: S.md, borderRadius: R.lg, marginTop: S.lg, ...SHADOW.md },
  drawBtnText: { color: '#fff', fontSize: FS.base, fontFamily: F.semibold },
});
