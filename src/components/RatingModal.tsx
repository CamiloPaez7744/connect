import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, GLASS, SHADOW } from '../tokens';

const DIFFICULTY = [
  { id: 'easy', label: 'Fácil', icon: '🟢', color: T.success },
  { id: 'medium', label: 'Media', icon: '🟡', color: T.warning },
  { id: 'hard', label: 'Difícil', icon: '🔴', color: T.danger },
];

const ENDURANCE = [
  { id: 'low', label: 'Baja', icon: '⚡' },
  { id: 'medium', label: 'Media', icon: '⚡⚡' },
  { id: 'high', label: 'Alta', icon: '⚡⚡⚡' },
];

export interface Rating {
  difficulty: string;
  connection: number;
  wouldRepeat: boolean;
  endurance: string;
  toImprove: string;
  notes: string;
}

export interface DualRating {
  ella?: Rating;
  el?: Rating;
}

interface RatingModalProps {
  visible: boolean;
  position: any;
  herName: string;
  hisName: string;
  onClose: () => void;
  onSave: (positionId: number, perspective: 'ella' | 'el', rating: Rating) => void;
  existingRating?: DualRating;
}

export default function RatingModal({ visible, position, herName, hisName, onClose, onSave, existingRating }: RatingModalProps) {
  const [perspective, setPerspective] = useState<'ella' | 'el'>('ella');
  const [difficulty, setDifficulty] = useState('');
  const [connection, setConnection] = useState(3);
  const [wouldRepeat, setWouldRepeat] = useState<boolean | null>(null);
  const [endurance, setEndurance] = useState('');
  const [toImprove, setToImprove] = useState('');
  const [notes, setNotes] = useState('');

  const labelA = herName || 'Ella';
  const labelB = hisName || 'Él';

  useEffect(() => {
    if (visible && existingRating) {
      const r = perspective === 'ella' ? existingRating.ella : existingRating.el;
      if (r) {
        setDifficulty(r.difficulty);
        setConnection(r.connection);
        setWouldRepeat(r.wouldRepeat);
        setEndurance(r.endurance);
        setToImprove(r.toImprove);
        setNotes(r.notes);
        return;
      }
    }
    setDifficulty('');
    setConnection(3);
    setWouldRepeat(null);
    setEndurance('');
    setToImprove('');
    setNotes('');
  }, [perspective, visible]);

  const switchPerspective = (p: 'ella' | 'el') => {
    setPerspective(p);
  };

  const handleSave = () => {
    onSave(position.id, perspective, { difficulty, connection, wouldRepeat: wouldRepeat ?? false, endurance, toImprove, notes });
    onClose();
  };

  if (!position) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={st.overlay}>
        <View style={st.sheet}>
          <View style={st.header}>
            <Text style={st.title}>Evaluar posición</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={T.text} />
            </TouchableOpacity>
          </View>
          <Text style={st.positionName}>{position.nameEs}</Text>

          {/* Perspective tabs */}
          <View style={st.perspRow}>
            <TouchableOpacity
              style={[st.perspTab, perspective === 'ella' && st.perspTabActive]}
              onPress={() => switchPerspective('ella')}
            >
              <Ionicons name="female" size={16} color={perspective === 'ella' ? '#fff' : T.textMuted} />
              <Text style={[st.perspText, perspective === 'ella' && st.perspTextActive]}>{labelA}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[st.perspTab, perspective === 'el' && st.perspTabActiveEl]}
              onPress={() => switchPerspective('el')}
            >
              <Ionicons name="male" size={16} color={perspective === 'el' ? '#fff' : T.textMuted} />
              <Text style={[st.perspText, perspective === 'el' && st.perspTextActive]}>{labelB}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={st.scroll}>
            <Text style={st.label}>¿Fue difícil ejecutarla?</Text>
            <View style={st.optionRow}>
              {DIFFICULTY.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[st.optionBtn, difficulty === d.id && { backgroundColor: d.color + '20', borderColor: d.color }]}
                  onPress={() => setDifficulty(d.id)}
                >
                  <Text style={st.optionIcon}>{d.icon}</Text>
                  <Text style={[st.optionText, difficulty === d.id && { color: d.color }]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={st.label}>¿Sintieron conexión?</Text>
            <View style={st.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setConnection(n)}>
                  <Ionicons
                    name={n <= connection ? 'star' : 'star-outline'}
                    size={32}
                    color={n <= connection ? '#ffd166' : T.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={st.label}>¿Lo volverían a hacer?</Text>
            <View style={st.optionRow}>
              <TouchableOpacity
                style={[st.yesNoBtn, wouldRepeat === true && st.yesBtnActive]}
                onPress={() => setWouldRepeat(true)}
              >
                <Ionicons name="thumbs-up" size={20} color={wouldRepeat === true ? T.success : T.textMuted} />
                <Text style={[st.yesNoText, wouldRepeat === true && { color: T.success }]}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.yesNoBtn, wouldRepeat === false && st.noBtnActive]}
                onPress={() => setWouldRepeat(false)}
              >
                <Ionicons name="thumbs-down" size={20} color={wouldRepeat === false ? T.danger : T.textMuted} />
                <Text style={[st.yesNoText, wouldRepeat === false && { color: T.danger }]}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={st.label}>¿Requiere resistencia?</Text>
            <View style={st.optionRow}>
              {ENDURANCE.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={[st.optionBtn, endurance === e.id && { backgroundColor: T.primary + '20', borderColor: T.primary }]}
                  onPress={() => setEndurance(e.id)}
                >
                  <Text style={st.optionIcon}>{e.icon}</Text>
                  <Text style={[st.optionText, endurance === e.id && { color: T.primary }]}>{e.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={st.label}>¿Algo por mejorar?</Text>
            <TextInput
              style={st.textArea}
              placeholder="Escribe aquí..."
              placeholderTextColor={T.textMuted}
              value={toImprove}
              onChangeText={setToImprove}
              multiline
              numberOfLines={3}
            />

            <Text style={st.label}>Notas / Tips</Text>
            <TextInput
              style={st.textArea}
              placeholder="Algún tip o recuerdo..."
              placeholderTextColor={T.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <TouchableOpacity style={st.saveBtn} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={st.saveBtnText}>Guardar evaluación</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    ...GLASS.elevated,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    maxHeight: '90%',
    padding: S.lg,
    ...SHADOW.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xs },
  title: { fontSize: FS.xl, fontFamily: F.bold, color: T.text },
  positionName: { fontSize: FS.sm, fontFamily: F.medium, color: T.primary, marginBottom: S.md },

  perspRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  perspTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(26,31,53,0.5)',
  },
  perspTabActive: {
    backgroundColor: T.accent + '25',
    borderColor: T.accent,
  },
  perspTabActiveEl: {
    backgroundColor: '#3b82f6' + '25',
    borderColor: '#3b82f6',
  },
  perspText: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textMuted },
  perspTextActive: { color: '#fff' },

  scroll: { maxHeight: 500 },

  label: { fontSize: FS.sm, fontFamily: F.semibold, color: T.textSecondary, marginTop: S.md, marginBottom: S.sm },

  optionRow: { flexDirection: 'row', gap: S.sm },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...GLASS.chip,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  optionIcon: { fontSize: 16 },
  optionText: { fontSize: FS.sm, fontFamily: F.medium, color: T.textSecondary },

  starsRow: { flexDirection: 'row', gap: S.sm, justifyContent: 'center' },

  yesNoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    ...GLASS.chip,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  yesBtnActive: { backgroundColor: T.success + '15', borderColor: T.success },
  noBtnActive: { backgroundColor: T.danger + '15', borderColor: T.danger },
  yesNoText: { fontSize: FS.base, fontFamily: F.semibold, color: T.textMuted },

  textArea: {
    ...GLASS.chip,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: S.md,
    paddingVertical: S.md,
    color: T.text,
    fontSize: FS.sm,
    fontFamily: F.regular,
    textAlignVertical: 'top' as const,
    minHeight: 60,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    backgroundColor: T.primary,
    paddingVertical: 14,
    borderRadius: R.md,
    marginTop: S.md,
    ...SHADOW.neonCyan,
  },
  saveBtnText: { color: '#fff', fontSize: FS.base, fontFamily: F.bold },
});
