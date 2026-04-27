import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useClub } from '../context/ClubContext';
import { getClubs } from '../api/client';
import { C, S } from '../constants/theme';

function ClubCard({ club, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(club.id)} activeOpacity={0.8}>
      <View style={[styles.cardBar, { backgroundColor: club.color1 }]} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{club.nombre}</Text>
        <Text style={styles.cardCity}>{club.ciudad}</Text>
        <View style={styles.cardRating}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingNum}>{club.reputacion}</Text>
        </View>
      </View>
      <View style={[styles.cardAccent, { backgroundColor: club.color1 + '22' }]} />
    </TouchableOpacity>
  );
}

export default function SeleccionClub() {
  const { clubId, selectClub, loaded } = useClub();
  const router = useRouter();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loaded && clubId) {
      router.replace('/(tabs)/inicio');
    }
  }, [loaded, clubId]);

  useEffect(() => {
    getClubs()
      .then(setClubs)
      .catch(() => setError('No se pudo conectar con el servidor.\nVerificá tu conexión a internet.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (id) => {
    await selectClub(id);
    router.replace('/(tabs)/inicio');
  };

  if (!loaded) return null;

  return (
    <LinearGradient colors={['#0A0A0A', '#0d1f17']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.ball}>🏉</Text>
        <Text style={styles.title}>Rugby Manager</Text>
        <Text style={styles.subtitle}>ARGENTINA</Text>
        <Text style={styles.prompt}>Seleccioná tu club para comenzar</Text>
      </View>

      {loading && <ActivityIndicator color={C.primary} size="large" style={{ marginTop: 40 }} />}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={clubs}
          keyExtractor={c => String(c.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <ClubCard club={item} onPress={handleSelect} />}
        />
      )}

      <Text style={styles.footer}>Torneo de la URBA 2025</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, paddingTop: 60 },
  header:      { alignItems: 'center', paddingBottom: 32 },
  ball:        { fontSize: 52, marginBottom: 8 },
  title:       { fontSize: 30, fontWeight: 'bold', color: C.text },
  subtitle:    { fontSize: 13, fontWeight: '700', color: C.primary, letterSpacing: 6, marginTop: 2 },
  prompt:      { fontSize: 14, color: C.sub, marginTop: 12 },
  grid:        { paddingHorizontal: 16, paddingBottom: 24 },
  row:         { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    flex: 0.48,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    padding: 14,
  },
  cardBar:     { height: 3, borderRadius: 2, marginBottom: 12 },
  cardBody:    { gap: 2 },
  cardName:    { fontSize: 14, fontWeight: '700', color: C.text },
  cardCity:    { fontSize: 12, color: C.sub },
  cardRating:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 8 },
  star:        { color: C.gold, fontSize: 12 },
  ratingNum:   { color: C.gold, fontSize: 12, fontWeight: '600' },
  cardAccent:  { position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, borderTopRightRadius: 14, borderBottomRightRadius: 14 },
  errorBox:    { margin: 24, padding: 16, backgroundColor: '#2a0a0a', borderRadius: 12, borderWidth: 1, borderColor: C.error + '66' },
  errorText:   { color: C.error, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  footer:      { textAlign: 'center', color: C.muted, fontSize: 11, paddingBottom: 24 },
});
