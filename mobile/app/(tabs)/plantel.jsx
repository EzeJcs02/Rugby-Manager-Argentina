import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useClub } from '../../context/ClubContext';
import { getJugadores } from '../../api/client';
import { C, attrColor, overall } from '../../constants/theme';

const POSICIONES = ['Todos','Pilar Izq','Hooker','Pilar Der','Segunda Línea','Ala','Octavo','Medio Scrum','Apertura','Centro','Wing','Fullback'];
const ATTRS = [
  { k: 'scrum', l: 'SCR' }, { k: 'lineout', l: 'LIN' }, { k: 'tackle', l: 'TAC' },
  { k: 'velocidad', l: 'VEL' }, { k: 'pase', l: 'PAS' }, { k: 'pie', l: 'PIE' },
  { k: 'vision', l: 'VIS' }, { k: 'potencia', l: 'POT' }, { k: 'motor', l: 'MOT' }, { k: 'liderazgo', l: 'LID' },
];

function AttrBar({ value }) {
  return (
    <View style={bar.bg}>
      <View style={[bar.fill, { width: `${value}%`, backgroundColor: attrColor(value) }]} />
    </View>
  );
}

function JugadorItem({ j, expanded, onPress }) {
  const ov = overall(j);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.item}>
      <View style={styles.itemMain}>
        <View style={[styles.numBadge, { backgroundColor: C.primary + '33' }]}>
          <Text style={styles.numText}>{j.numero ?? '–'}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{j.nombre} {j.apellido}</Text>
          <Text style={styles.itemSub}>{j.posicion} · {j.edad} años</Text>
        </View>
        <View style={[styles.ovrBadge, { backgroundColor: attrColor(ov) + '22' }]}>
          <Text style={[styles.ovrText, { color: attrColor(ov) }]}>{ov}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {expanded && (
        <View style={styles.detail}>
          {ATTRS.map(({ k, l }) => (
            <View key={k} style={styles.attrRow}>
              <Text style={styles.attrLabel}>{l}</Text>
              <AttrBar value={j[k]} />
              <Text style={[styles.attrVal, { color: attrColor(j[k]) }]}>{j[k]}</Text>
            </View>
          ))}
          <View style={styles.detailFooter}>
            <Text style={styles.footerItem}>Valor: <Text style={{ color: C.text }}>${(j.valor/1000).toFixed(0)}k</Text></Text>
            <Text style={styles.footerItem}>Moral: <Text style={{ color: attrColor(j.moral) }}>{j.moral}</Text></Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function Plantel() {
  const { clubId } = useClub();
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getJugadores(clubId).then(setJugadores).finally(() => setLoading(false));
  }, [clubId]);

  const filtrados = (filtro === 'Todos' ? jugadores : jugadores.filter(j => j.posicion === filtro))
    .sort((a, b) => overall(b) - overall(a));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plantel</Text>
        <Text style={styles.count}>{jugadores.length} jugadores</Text>
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtros} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {POSICIONES.map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setFiltro(p)}
            style={[styles.pill, filtro === p && styles.pillActive]}
          >
            <Text style={[styles.pillText, filtro === p && styles.pillTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}><Text style={{ color: C.sub }}>Cargando...</Text></View>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={j => String(j.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <JugadorItem
              j={item}
              expanded={expanded === item.id}
              onPress={() => setExpanded(expanded === item.id ? null : item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const bar = StyleSheet.create({
  bg:   { flex: 1, height: 4, backgroundColor: C.border, borderRadius: 2 },
  fill: { height: 4, borderRadius: 2 },
});

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg, paddingTop: 56 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  title:      { fontSize: 22, fontWeight: 'bold', color: C.text },
  count:      { fontSize: 13, color: C.sub },
  filtros:    { maxHeight: 44, marginBottom: 12 },
  pill:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText:   { fontSize: 12, color: C.sub, fontWeight: '500' },
  pillTextActive: { color: C.text },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item:       { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  itemMain:   { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  numBadge:   { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  numText:    { color: C.primaryLight, fontSize: 13, fontWeight: '700' },
  itemInfo:   { flex: 1 },
  itemName:   { fontSize: 14, fontWeight: '600', color: C.text },
  itemSub:    { fontSize: 11, color: C.sub, marginTop: 1 },
  ovrBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ovrText:    { fontSize: 15, fontWeight: 'bold' },
  chevron:    { color: C.muted, fontSize: 10 },
  detail:     { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4, borderTopWidth: 1, borderTopColor: C.border, gap: 6 },
  attrRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attrLabel:  { width: 28, fontSize: 10, fontWeight: '600', color: C.sub },
  attrVal:    { width: 24, fontSize: 11, fontWeight: 'bold', textAlign: 'right' },
  detailFooter: { flexDirection: 'row', gap: 20, marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  footerItem: { fontSize: 12, color: C.sub },
});
