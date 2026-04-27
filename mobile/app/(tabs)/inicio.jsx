import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useClub } from '../../context/ClubContext';
import { getClub, getTabla, getJornadas } from '../../api/client';
import { C, S, overall } from '../../constants/theme';

function StatCard({ label, value, sub, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function TablaRow({ row, pos, miClub }) {
  const isMe = row.club.id === miClub;
  return (
    <View style={[styles.tablaRow, isMe && styles.tablaRowMe]}>
      <Text style={[styles.tablaPos, pos === 1 && { color: C.gold }]}>{pos}</Text>
      <View style={[styles.tablaDot, { backgroundColor: row.club.color1 }]} />
      <Text style={[styles.tablaNombre, isMe && { color: C.primaryLight }]} numberOfLines={1}>{row.club.nombre}</Text>
      <Text style={styles.tablaPJ}>{row.pj}PJ</Text>
      <Text style={styles.tablaPts}>{row.puntos}</Text>
    </View>
  );
}

export default function Inicio() {
  const { clubId, clearClub } = useClub();
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [tablaData, setTablaData] = useState(null);
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = async () => {
    try {
      const [c, t, j] = await Promise.all([getClub(clubId), getTabla(), getJornadas()]);
      setClub(c); setTablaData(t); setJornadas(j);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { cargar(); }, [clubId]);

  if (loading || !club) return (
    <View style={styles.center}>
      <Text style={{ color: C.sub }}>Cargando...</Text>
    </View>
  );

  const miPos = tablaData?.tabla.findIndex(r => r.club.id === clubId) ?? -1;
  const miStats = tablaData?.tabla[miPos];
  const jornadaActual = jornadas.find(j => j.jugados < j.total) ?? jornadas[jornadas.length - 1];
  const presupuesto = (club.presupuesto / 1000000).toFixed(1);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={C.primary} />}
    >
      {/* Header del club */}
      <LinearGradient colors={[club.color1 + 'CC', '#0A0A0A']} style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroNombre}>{club.nombre}</Text>
            <Text style={styles.heroCity}>{club.estadio} · {club.ciudad}</Text>
          </View>
          <TouchableOpacity onPress={clearClub} style={styles.changeBtn}>
            <Ionicons name="swap-horizontal" size={16} color={C.sub} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>#{miPos + 1} en la tabla</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats */}
        {miStats && (
          <View style={styles.statsRow}>
            <StatCard label="Puntos" value={miStats.puntos} color={C.primaryLight} />
            <StatCard label="Record" value={`${miStats.pg}G ${miStats.pe}E ${miStats.pp}P`} />
            <StatCard label="Dif." value={miStats.dif > 0 ? `+${miStats.dif}` : miStats.dif} color={miStats.dif >= 0 ? C.success : C.error} />
            <StatCard label="Presupuesto" value={`$${presupuesto}M`} />
          </View>
        )}

        {/* Próxima jornada */}
        {jornadaActual && (
          <TouchableOpacity style={styles.jornadaCard} onPress={() => router.push('/(tabs)/jornada')} activeOpacity={0.85}>
            <View style={styles.jornadaHeader}>
              <Text style={styles.jornadaTitle}>Jornada {jornadaActual.numero}</Text>
              <View style={[styles.badge, jornadaActual.jugados === jornadaActual.total ? styles.badgeDone : styles.badgePending]}>
                <Text style={styles.badgeText}>{jornadaActual.jugados}/{jornadaActual.total} jugados</Text>
              </View>
            </View>
            <View style={styles.jornadaAction}>
              <Text style={styles.jornadaActionText}>
                {jornadaActual.jugados < jornadaActual.total ? 'Ir a simular →' : 'Jornada completada ✓'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Tabla top 5 */}
        {tablaData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tabla de Posiciones</Text>
            <View style={styles.tablaCard}>
              {tablaData.tabla.slice(0, 5).map((row, i) => (
                <TablaRow key={row.club.id} row={row} pos={i + 1} miClub={clubId} />
              ))}
              {tablaData.tabla.length > 5 && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/tabla')} style={styles.verMas}>
                  <Text style={styles.verMasText}>Ver tabla completa →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  center:       { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  hero:         { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  heroTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroNombre:   { fontSize: 22, fontWeight: 'bold', color: C.text },
  heroCity:     { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  changeBtn:    { padding: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8 },
  heroBadge:    { marginTop: 12, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  heroBadgeText:{ color: C.text, fontSize: 12, fontWeight: '600' },
  content:      { padding: 16, gap: 16 },
  statsRow:     { flexDirection: 'row', gap: 8 },
  statCard:     { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statValue:    { fontSize: 16, fontWeight: 'bold', color: C.text },
  statLabel:    { fontSize: 10, color: C.sub, marginTop: 2, textAlign: 'center' },
  statSub:      { fontSize: 9, color: C.muted, marginTop: 1 },
  jornadaCard:  { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.primary + '44' },
  jornadaHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jornadaTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgePending: { backgroundColor: C.warning + '33' },
  badgeDone:    { backgroundColor: C.success + '33' },
  badgeText:    { fontSize: 11, fontWeight: '600', color: C.text },
  jornadaAction:{ marginTop: 8 },
  jornadaActionText: { color: C.primaryLight, fontSize: 13, fontWeight: '600' },
  section:      { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  tablaCard:    { backgroundColor: C.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  tablaRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border + '80', gap: 8 },
  tablaRowMe:   { backgroundColor: C.primary + '15' },
  tablaPos:     { width: 20, fontSize: 13, fontWeight: 'bold', color: C.sub },
  tablaDot:     { width: 8, height: 8, borderRadius: 4 },
  tablaNombre:  { flex: 1, fontSize: 13, fontWeight: '500', color: C.text },
  tablaPJ:      { fontSize: 11, color: C.sub },
  tablaPts:     { width: 36, fontSize: 15, fontWeight: 'bold', color: C.primaryLight, textAlign: 'right' },
  verMas:       { padding: 12, alignItems: 'center' },
  verMasText:   { color: C.primary, fontSize: 13, fontWeight: '600' },
});
