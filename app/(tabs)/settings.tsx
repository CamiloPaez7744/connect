import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform, useWindowDimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, S, R, F, FS, BP, SHARED, GLASS, SHADOW } from '../../src/tokens';

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BP.lg;
  const [explicitMode, setExplicitMode] = useState(true);
  const [gameMode, setGameMode] = useState<'pareja' | 'grupo'>('pareja');
  const [showAbout, setShowAbout] = useState(false);
  const [herName, setHerName] = useState('');
  const [hisName, setHisName] = useState('');

  useEffect(() => {
    try {
      const h = localStorage?.getItem('couple_herName');
      const s = localStorage?.getItem('couple_hisName');
      if (h) setHerName(h);
      if (s) setHisName(s);
    } catch {}
  }, []);

  useEffect(() => { try { localStorage?.setItem('couple_herName', herName); } catch {} }, [herName]);
  useEffect(() => { try { localStorage?.setItem('couple_hisName', hisName); } catch {} }, [hisName]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Más</Text>
        <Text style={s.subtitle}>Configuración y opciones</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.content, isDesktop && { maxWidth: 600, alignSelf: 'center' }]}>
        {/* Perfil de pareja */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Nuestra pareja</Text>
          <View style={s.profileCard}>
            <View style={s.profileRow}>
              <View style={s.profileAvatar}>
                <Ionicons name="female" size={24} color={T.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.profileLabel}>Ella</Text>
                <TextInput
                  style={s.profileInput}
                  placeholder="Nombre..."
                  placeholderTextColor={T.textMuted}
                  value={herName}
                  onChangeText={setHerName}
                />
              </View>
            </View>
            <View style={s.profileDivider} />
            <View style={s.profileRow}>
              <View style={s.profileAvatar}>
                <Ionicons name="male" size={24} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.profileLabel}>Él</Text>
                <TextInput
                  style={s.profileInput}
                  placeholder="Nombre..."
                  placeholderTextColor={T.textMuted}
                  value={hisName}
                  onChangeText={setHisName}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Mode */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Modo de juego</Text>
          <View style={s.modeRow}>
            <TouchableOpacity style={[s.modeCard, gameMode === 'pareja' && s.modeCardActive]} onPress={() => setGameMode('pareja')}>
              <Text style={s.modeIcon}>💑</Text>
              <Text style={[s.modeLabel, gameMode === 'pareja' && { color: T.accent }]}>Pareja</Text>
              <Text style={s.modeDesc}>Preguntas íntimas para dos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.modeCard, gameMode === 'grupo' && s.modeCardActiveGrupo]} onPress={() => setGameMode('grupo')}>
              <Text style={s.modeIcon}>👥</Text>
              <Text style={[s.modeLabel, gameMode === 'grupo' && { color: '#7b2ff7' }]}>Grupo</Text>
              <Text style={s.modeDesc}>Para fiestas y amigotes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Contenido</Text>
          <View style={s.settingRow}>
            <View style={s.settingInfo}>
              <Ionicons name="eye" size={20} color={T.accent} />
              <View>
                <Text style={s.settingLabel}>Contenido explícito</Text>
                <Text style={s.settingDesc}>Mostrar preguntas y retos más atrevidos</Text>
              </View>
            </View>
            <Switch value={explicitMode} onValueChange={setExplicitMode} trackColor={{ false: T.border, true: T.accent + '60' }} thumbColor={explicitMode ? T.accent : T.textMuted} />
          </View>
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Acerca de</Text>
          <TouchableOpacity style={s.aboutCard} onPress={() => setShowAbout(!showAbout)}>
            <View style={s.aboutHeader}>
              <Ionicons name="information-circle" size={20} color={T.primary} />
              <Text style={s.aboutLabel}>Connect</Text>
              <Ionicons name={showAbout ? 'chevron-up' : 'chevron-down'} size={18} color={T.textMuted} />
            </View>
            {showAbout && (
              <View style={{ marginTop: S.md }}>
                <Text style={s.aboutText}>Connect es una aplicación diseñada para parejas que quieren explorar y mejorar su intimidad.</Text>
                <Text style={s.aboutText}>Incluye 519 posiciones, juego de verdad o reto, exploración sensorial, y mucho más.</Text>
                <Text style={s.aboutVersion}>Versión 1.0.0</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Créditos</Text>
          <View style={s.creditRow}>
            <Ionicons name="heart" size={16} color={T.accent} />
            <Text style={s.creditText}>Diseñado con pasión</Text>
          </View>
          <View style={s.creditRow}>
            <Ionicons name="globe" size={16} color={T.primary} />
            <Text style={s.creditText}>519 posiciones de sexpositions.club</Text>
          </View>
          <View style={s.creditRow}>
            <Ionicons name="color-palette" size={16} color="#7b2ff7" />
            <Text style={s.creditText}>Tipografías: Outfit + Space Grotesk</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { paddingHorizontal: S.lg, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: S.sm },
  title: { fontSize: FS['3xl'], fontFamily: F.display, color: T.text },
  subtitle: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, marginTop: 2 },
  content: { padding: S.lg },

  section: { marginBottom: S.xl },
  sectionTitle: { fontSize: FS.xs, fontFamily: F.semibold, color: T.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: S.md },

  // Couple profile
  profileCard: { ...GLASS.card, padding: S.lg, ...SHADOW.sm },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileLabel: { fontSize: FS.xs, fontFamily: F.semibold, color: T.textMuted, marginBottom: 4 },
  profileInput: {
    ...GLASS.chip,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: S.md,
    paddingVertical: 8,
    color: T.text,
    fontSize: FS.base,
    fontFamily: F.regular,
  },
  profileDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: S.md },

  modeRow: { flexDirection: 'row', gap: S.md },
  modeCard: { flex: 1, ...GLASS.card, padding: S.lg, alignItems: 'center', gap: S.xs, ...SHADOW.sm },
  modeCardActive: { borderColor: T.accent, backgroundColor: T.accent + '10' },
  modeCardActiveGrupo: { borderColor: '#7b2ff7', backgroundColor: '#7b2ff710' },
  modeIcon: { fontSize: 32 },
  modeLabel: { fontSize: FS.lg, fontFamily: F.bold, color: T.text },
  modeDesc: { fontSize: FS.xs, fontFamily: F.regular, color: T.textMuted, textAlign: 'center' },

  settingRow: { ...GLASS.card, padding: S.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOW.sm },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: S.md, flex: 1 },
  settingLabel: { fontSize: FS.base, fontFamily: F.semibold, color: T.text },
  settingDesc: { fontSize: FS.xs, fontFamily: F.regular, color: T.textMuted, marginTop: 2 },

  aboutCard: { ...GLASS.card, padding: S.md, ...SHADOW.sm },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  aboutLabel: { flex: 1, fontSize: FS.base, fontFamily: F.semibold, color: T.text },
  aboutText: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary, lineHeight: 20, marginBottom: S.sm },
  aboutVersion: { fontSize: FS.xs, fontFamily: F.regular, color: T.textMuted, marginTop: S.sm },

  creditRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.sm },
  creditText: { fontSize: FS.sm, fontFamily: F.regular, color: T.textSecondary },
});
