import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useClub } from '../../context/ClubContext';
import { getClubs, getJugadoresClub, crearTransferencia, getJugadores } from '../../api/client';
import { C, attrColor, overall } from '../../constants/theme';

export default function Mercado() {
  const { clubId } = useClub();
  const [clubs, setClubs] = useState([]);
  const [clubSel, setClubSel] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [misJugadores, setMisJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comprando, setComprando] = useState(null);

  useEffect(() => {
    getClubs().then(cs => setClubs(cs.filter(c => c.id !== clubId)));
    getJugadores(clubId).then(setMisJugadores);
  }, [clubId]);

  const seleccionarClub = async (club) => {
    setClubSel(club); setLoading(true);
    const js = await getJugadoresClub(club.id);
    setJugadores(js.sort((a, b) => overall(b) - overall(a)));
    setLoading(false);
  };

  const comprar = (j) => {
    Alert.alert(
      'Fichar jugador',
      `¿Querés fichar a ${j.nombre} ${j.apellido} por $${(j.valor/1000).toFixed(0)}k?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fichar', onPress: async () => {
          setComprando(j.id);
          try {
            await crearTransferencia({ jugadorId: j.id, clubDestinoId: clubId, monto: j.valor });
            setJugadores(prev => prev.filter(x => x.id !== j.id));
            const mis = await getJugadores(clubId);
            setMisJugadores(mis);
            Alert.alert('¡Fichaje cerrado!', `${j.nombre} ${j.apellido} es tuyo.`);
          } catch {
            Alert.alert('Error', 'No se pudo completar el fichaje.');
          } finally {
            setComprando(null);
          }
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mercado</Text>
        <Text style={styles.sub}>{misJugadores.length} jugadores en plantilla</Text>
      </View>

      {!clubSel ? (
        <>
          <Text style={styles.sectionLabel}>Explorar planteles</Text>
          <FlatList
            data={clubs}
            keyExtractor={c => String(c.id)}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.clubRow} onPress={() => seleccionarClub(item)} activeOpacity={0.8}>
                <View style={[styles.clubDot, { backgroundColor: item.color1 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.clubName}>{item.nombre}</Text>
                  <Text style={styles.clubCity}>{item.ciudad} · ★ {item.reputacion}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => { setClubSel(null); setJugadores([]); }}>
            <Text style={styles.backText}>← {clubSel.nombre}</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={jugadores}
              keyExtractor={j => String(j.id)}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 24 }}
              renderItem={({ item: j }) => {
                const ov = overall(j);
                return (
                  <View style={styles.jugadorRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jugadorName}>{j.nombre} {j.apellido}</Text>
                      <Text style={styles.jugadorSub}>{j.posicion} · {j.edad} años</Text>
                    </View>
                    <Text style={[styles.jugadorOvr, { color: attrColor(ov) }]}>{ov}</Text>
                    <Text style={styles.jugadorValor}>${(j.valor/1000).toFixed(0)}k</Text>
                    <TouchableOpacity
                      style={[styles.fichBtn, comprando === j.id && { opacity: 0.5 }]}
                      onPress={() => comprar(j)}
                      disabled={comprando === j.id}
                    >
                      <Text style={styles.fichBtnText}>{comprando === j.id ? '...' : 'Fichar'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg, paddingTop: 56 },
  header:      { paddingHorizontal: 20, paddingBottom: 16 },
  title:       { fontSize: 22, fontWeight: 'bold', color: C.text },
  sub:         { fontSize: 12, color: C.sub, marginTop: 2 },
  sectionLabel:{ fontSize: 13, fontWeight: '600', color: C.sub, paddingHorizontal: 20, paddingBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  clubRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border, gap: 12 },
  clubDot:     { width: 12, height: 12, borderRadius: 6 },
  clubName:    { fontSize: 14, fontWeight: '600', color: C.text },
  clubCity:    { fontSize: 11, color: C.sub, marginTop: 1 },
  arrow:       { color: C.primary, fontSize: 16 },
  backBtn:     { paddingHorizontal: 20, paddingVertical: 12 },
  backText:    { color: C.primaryLight, fontSize: 14, fontWeight: '600' },
  jugadorRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border, gap: 8 },
  jugadorName: { fontSize: 13, fontWeight: '600', color: C.text },
  jugadorSub:  { fontSize: 11, color: C.sub, marginTop: 1 },
  jugadorOvr:  { fontSize: 16, fontWeight: 'bold', width: 32, textAlign: 'center' },
  jugadorValor:{ fontSize: 11, color: C.sub, width: 40, textAlign: 'center' },
  fichBtn:     { backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  fichBtnText: { color: C.text, fontSize: 12, fontWeight: '700' },
});
