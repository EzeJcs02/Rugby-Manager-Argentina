import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useClub } from '../../context/ClubContext';
import { getTabla } from '../../api/client';
import { C } from '../../constants/theme';

export default function Tabla() {
  const { clubId } = useClub();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = () => getTabla().then(setData).finally(() => { setLoading(false); setRefreshing(false); });
  useEffect(() => { cargar(); }, []);

  if (loading) return <View style={styles.center}><Text style={{ color: C.sub }}>Cargando...</Text></View>;
  if (!data) return null;

  const { temporada, tabla } = data;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={C.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tabla de Posiciones</Text>
        <Text style={styles.sub}>{temporada.nombre}</Text>
      </View>

      <View style={styles.card}>
        {/* Header */}
        <View style={styles.row}>
          <Text style={[styles.cell, styles.pos]}>#</Text>
          <Text style={[styles.cell, styles.nombre]}>Club</Text>
          <Text style={[styles.cell, styles.num]}>PJ</Text>
          <Text style={[styles.cell, styles.num]}>PG</Text>
          <Text style={[styles.cell, styles.num]}>PP</Text>
          <Text style={[styles.cell, styles.num]}>PF</Text>
          <Text style={[styles.cell, styles.num]}>PC</Text>
          <Text style={[styles.cell, styles.num]}>BT</Text>
          <Text style={[styles.cell, styles.pts]}>PTS</Text>
        </View>
        <View style={styles.divider} />

        {tabla.map((row, i) => {
          const isMe = row.club.id === clubId;
          return (
            <View key={row.club.id} style={[styles.row, isMe && styles.rowMe, i % 2 === 0 && styles.rowAlt]}>
              <Text style={[styles.cell, styles.pos, i === 0 && { color: C.gold }]}>{i + 1}</Text>
              <View style={[styles.nombre, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <View style={[styles.dot, { backgroundColor: row.club.color1 }]} />
                <Text style={[styles.cell, { flex: 1, color: isMe ? C.primaryLight : C.text }]} numberOfLines={1}>{row.club.nombre}</Text>
              </View>
              <Text style={[styles.cell, styles.num, { color: C.sub }]}>{row.pj}</Text>
              <Text style={[styles.cell, styles.num, { color: C.success }]}>{row.pg}</Text>
              <Text style={[styles.cell, styles.num, { color: C.error }]}>{row.pp}</Text>
              <Text style={[styles.cell, styles.num]}>{row.pf}</Text>
              <Text style={[styles.cell, styles.num, { color: C.sub }]}>{row.pc}</Text>
              <Text style={[styles.cell, styles.num, { color: C.sub }]}>{row.bonusTry}</Text>
              <Text style={[styles.cell, styles.pts]}>{row.puntos}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.leyenda}>
        <Text style={styles.leyendaText}>BT = Bonus try (4+ tries) · Victoria=4pts · Derrota≤7=+1pt</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingTop: 56 },
  center:    { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  header:    { paddingHorizontal: 20, paddingBottom: 16 },
  title:     { fontSize: 22, fontWeight: 'bold', color: C.text },
  sub:       { fontSize: 12, color: C.sub, marginTop: 2 },
  card:      { marginHorizontal: 16, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  divider:   { height: 1, backgroundColor: C.border },
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10 },
  rowMe:     { backgroundColor: C.primary + '18' },
  rowAlt:    { backgroundColor: 'rgba(255,255,255,0.02)' },
  cell:      { fontSize: 12, color: C.text, fontWeight: '500' },
  pos:       { width: 20, color: C.sub },
  nombre:    { flex: 1 },
  num:       { width: 26, textAlign: 'center' },
  pts:       { width: 32, textAlign: 'right', fontWeight: 'bold', color: C.primaryLight, fontSize: 14 },
  dot:       { width: 7, height: 7, borderRadius: 3.5 },
  leyenda:   { padding: 16, alignItems: 'center' },
  leyendaText: { fontSize: 10, color: C.muted, textAlign: 'center', lineHeight: 16 },
});
