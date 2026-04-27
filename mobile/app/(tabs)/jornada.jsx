import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Animated } from 'react-native';
import { useClub } from '../../context/ClubContext';
import { getJornadas, getJornada, simularJornada } from '../../api/client';
import { C } from '../../constants/theme';

const TIPO_ICON = { try: '🏉', penal: '🎯', drop: '💨' };
const TIPO_LABEL = { try: 'TRY', penal: 'Penal', drop: 'Drop Goal' };

function EventoBubble({ evento, clubLocal, clubVisitante }) {
  const esLocal = evento.equipo === 'local';
  const club = esLocal ? clubLocal : clubVisitante;
  return (
    <View style={[evStyles.row, esLocal ? evStyles.rowLeft : evStyles.rowRight]}>
      {!esLocal && <View style={{ flex: 1 }} />}
      <View style={[evStyles.bubble, { borderColor: (club?.color1 ?? C.primary) + '88' }]}>
        <Text style={evStyles.icon}>{TIPO_ICON[evento.tipo]}</Text>
        <View>
          <Text style={evStyles.tipo}>{TIPO_LABEL[evento.tipo]}</Text>
          <Text style={evStyles.club}>{club?.nombre}</Text>
        </View>
        <Text style={evStyles.min}>{evento.minuto}'</Text>
      </View>
      {esLocal && <View style={{ flex: 1 }} />}
    </View>
  );
}

function MatchModal({ visible, partido, onClose }) {
  const [eventos, setEventos] = useState([]);
  const [score, setScore] = useState({ local: 0, vis: 0 });
  const [fase, setFase] = useState('inicio'); // inicio | jugando | final
  const [progreso, setProgreso] = useState(0);
  const animProg = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!visible || !partido) return;
    setEventos([]); setScore({ local: 0, vis: 0 }); setFase('inicio'); setProgreso(0);
    animProg.setValue(0);

    const timer = setTimeout(() => {
      setFase('jugando');
      Animated.timing(animProg, { toValue: 1, duration: 5000, useNativeDriver: false }).start();
      const allEventos = partido.eventos ?? [];
      let pL = 0, pV = 0;
      allEventos.forEach((ev, i) => {
        setTimeout(() => {
          if (ev.equipo === 'local') pL += ev.puntos;
          else pV += ev.puntos;
          setEventos(prev => [...prev, ev]);
          setScore({ local: pL, vis: pV });
          scrollRef.current?.scrollToEnd({ animated: true });
          if (i === allEventos.length - 1) {
            setTimeout(() => setFase('final'), 800);
          }
        }, 400 + i * 700);
      });
      if (allEventos.length === 0) {
        setTimeout(() => { setScore({ local: partido.puntosLocal, vis: partido.puntosVisitante }); setFase('final'); }, 5200);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [visible, partido]);

  if (!partido) return null;
  const local = partido.clubLocal;
  const vis = partido.clubVisitante;
  const ganadorLocal = partido.puntosLocal > partido.puntosVisitante;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={modal.container}>
        {/* Marcador */}
        <View style={modal.scoreboard}>
          <View style={[modal.teamSide, { borderColor: local?.color1 ?? C.primary }]}>
            <Text style={modal.teamName} numberOfLines={2}>{local?.nombre}</Text>
            <Text style={[modal.score, fase === 'final' && ganadorLocal && { color: C.primaryLight }]}>{score.local}</Text>
          </View>
          <View style={modal.center}>
            {fase === 'inicio' && <Text style={modal.vsText}>VS</Text>}
            {fase === 'jugando' && (
              <View style={modal.timerBox}>
                <Animated.View style={[modal.timerFill, { width: animProg.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                <Text style={modal.timerText}>⏱</Text>
              </View>
            )}
            {fase === 'final' && <Text style={modal.finalText}>FINAL</Text>}
          </View>
          <View style={[modal.teamSide, { borderColor: vis?.color1 ?? C.primary }]}>
            <Text style={modal.teamName} numberOfLines={2}>{vis?.nombre}</Text>
            <Text style={[modal.score, fase === 'final' && !ganadorLocal && partido.puntosVisitante !== partido.puntosLocal && { color: C.primaryLight }]}>{score.vis}</Text>
          </View>
        </View>

        {/* Eventos */}
        <ScrollView ref={scrollRef} style={modal.eventos} contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 32 }}>
          {eventos.length === 0 && fase === 'jugando' && (
            <Text style={{ color: C.sub, textAlign: 'center', marginTop: 20 }}>Calentando motores...</Text>
          )}
          {eventos.map((ev, i) => (
            <EventoBubble key={i} evento={ev} clubLocal={local} clubVisitante={vis} />
          ))}
          {fase === 'final' && (
            <View style={modal.finalCard}>
              <Text style={modal.finalCardTitle}>Partido Finalizado</Text>
              <Text style={modal.finalCardScore}>{local?.nombre} {partido.puntosLocal} – {partido.puntosVisitante} {vis?.nombre}</Text>
              <Text style={modal.finalCardTries}>Tries: {partido.triesLocal ?? 0} – {partido.triesVisitante ?? 0}</Text>
            </View>
          )}
        </ScrollView>

        {fase === 'final' && (
          <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
            <Text style={modal.closeBtnText}>Volver</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

function PartidoCard({ partido, miClubId, onSimular }) {
  const local = partido.clubLocal;
  const vis = partido.clubVisitante;
  const involucra = local.id === miClubId || vis.id === miClubId;

  return (
    <View style={[styles.pCard, involucra && styles.pCardMe]}>
      <View style={styles.pTeams}>
        <View style={styles.pTeam}>
          <View style={[styles.pDot, { backgroundColor: local.color1 }]} />
          <Text style={[styles.pName, partido.jugado && partido.puntosLocal > partido.puntosVisitante && styles.pWinner]} numberOfLines={1}>{local.nombre}</Text>
        </View>
        <View style={styles.pScore}>
          {partido.jugado ? (
            <Text style={styles.pScoreText}>{partido.puntosLocal} – {partido.puntosVisitante}</Text>
          ) : (
            <Text style={styles.pVs}>vs</Text>
          )}
        </View>
        <View style={[styles.pTeam, styles.pTeamRight]}>
          <Text style={[styles.pName, partido.jugado && partido.puntosVisitante > partido.puntosLocal && styles.pWinner]} numberOfLines={1}>{vis.nombre}</Text>
          <View style={[styles.pDot, { backgroundColor: vis.color1 }]} />
        </View>
      </View>
      {partido.jugado && (
        <Text style={styles.pTries}>Tries: {partido.triesLocal} – {partido.triesVisitante}</Text>
      )}
      {!partido.jugado && (
        <TouchableOpacity style={styles.simBtn} onPress={() => onSimular(partido)} activeOpacity={0.8}>
          <Text style={styles.simBtnText}>▶ Simular</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function Jornada() {
  const { clubId } = useClub();
  const [jornadas, setJornadas] = useState([]);
  const [jornadaNum, setJornadaNum] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulando, setSimulando] = useState(false);
  const [modalData, setModalData] = useState(null);

  const cargarJornada = async (num) => {
    const ps = await getJornada(num);
    setPartidos(ps);
  };

  const cargar = async () => {
    const js = await getJornadas();
    setJornadas(js);
    const activa = js.find(j => j.jugados < j.total) ?? js[js.length - 1];
    if (activa) { setJornadaNum(activa.numero); await cargarJornada(activa.numero); }
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (jornadaNum != null) cargarJornada(jornadaNum);
  }, [jornadaNum]);

  const handleSimularTodo = async () => {
    setSimulando(true);
    try {
      const resultados = await simularJornada(jornadaNum);
      const [js, ps] = await Promise.all([getJornadas(), getJornada(jornadaNum)]);
      setJornadas(js); setPartidos(ps);
      if (resultados.length > 0) setModalData(resultados[0]);
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error al simular');
    } finally {
      setSimulando(false);
    }
  };

  const handleSimularUno = async (partido) => {
    try {
      const { simularPartido } = await import('../../api/client');
      const resultado = await simularPartido(partido.id);
      setModalData(resultado);
      const [js, ps] = await Promise.all([getJornadas(), getJornada(jornadaNum)]);
      setJornadas(js); setPartidos(ps);
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error al simular');
    }
  };

  const jornadaInfo = jornadas.find(j => j.numero === jornadaNum);
  const todosJugados = jornadaInfo?.jugados === jornadaInfo?.total;

  if (loading) return <View style={styles.center}><Text style={{ color: C.sub }}>Cargando...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jornadas</Text>
      </View>

      {/* Selector de jornada */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {jornadas.map(j => (
          <TouchableOpacity
            key={j.numero}
            onPress={() => setJornadaNum(j.numero)}
            style={[styles.jPill, jornadaNum === j.numero && styles.jPillActive, j.jugados === j.total && styles.jPillDone]}
          >
            <Text style={[styles.jPillText, jornadaNum === j.numero && styles.jPillTextActive]}>J{j.numero}</Text>
            {j.jugados === j.total && <Text style={styles.jCheck}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Header jornada */}
      <View style={styles.jornadaHeader}>
        <View>
          <Text style={styles.jornadaTitle}>Jornada {jornadaNum}</Text>
          <Text style={styles.jornadaSub}>{jornadaInfo?.jugados}/{jornadaInfo?.total} jugados</Text>
        </View>
        {!todosJugados && (
          <TouchableOpacity style={[styles.simTodoBtn, simulando && { opacity: 0.5 }]} onPress={handleSimularTodo} disabled={simulando}>
            <Text style={styles.simTodoBtnText}>{simulando ? 'Simulando...' : '▶ Jugar Jornada'}</Text>
          </TouchableOpacity>
        )}
        {todosJugados && (
          <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>Completada ✓</Text></View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={C.primary} />}
      >
        {partidos.map(p => (
          <PartidoCard key={p.id} partido={p} miClubId={clubId} onSimular={handleSimularUno} />
        ))}
      </ScrollView>

      <MatchModal
        visible={!!modalData}
        partido={modalData}
        onClose={() => setModalData(null)}
      />
    </View>
  );
}

const evStyles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center' },
  rowLeft: {},
  rowRight:{ flexDirection: 'row-reverse' },
  bubble:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, padding: 10, maxWidth: '70%' },
  icon:    { fontSize: 20 },
  tipo:    { fontSize: 12, fontWeight: '700', color: C.text },
  club:    { fontSize: 10, color: C.sub, marginTop: 1 },
  min:     { fontSize: 11, color: C.primary, fontWeight: '600', marginLeft: 4 },
});

const modal = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#060f09' },
  scoreboard:     { flexDirection: 'row', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 24, backgroundColor: '#0a1a10', borderBottomWidth: 1, borderBottomColor: C.border, gap: 8, alignItems: 'center' },
  teamSide:       { flex: 1, alignItems: 'center', gap: 8, borderTopWidth: 2, paddingTop: 8 },
  teamName:       { fontSize: 13, fontWeight: '600', color: C.text, textAlign: 'center' },
  score:          { fontSize: 42, fontWeight: 'black', color: C.text },
  center:         { width: 60, alignItems: 'center' },
  vsText:         { color: C.sub, fontSize: 16, fontWeight: '700' },
  finalText:      { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  timerBox:       { width: 48, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  timerFill:      { height: '100%', backgroundColor: C.primary },
  timerText:      { color: C.sub, fontSize: 16, marginTop: 4 },
  eventos:        { flex: 1 },
  finalCard:      { backgroundColor: C.card, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.primary + '44', marginTop: 8 },
  finalCardTitle: { color: C.gold, fontWeight: '700', fontSize: 14, marginBottom: 8 },
  finalCardScore: { color: C.text, fontWeight: '600', fontSize: 13, textAlign: 'center' },
  finalCardTries: { color: C.sub, fontSize: 12, marginTop: 4 },
  closeBtn:       { margin: 16, backgroundColor: C.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  closeBtnText:   { color: C.text, fontWeight: '700', fontSize: 16 },
});

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.bg, paddingTop: 56 },
  center:         { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  header:         { paddingHorizontal: 20, paddingBottom: 8 },
  title:          { fontSize: 22, fontWeight: 'bold', color: C.text },
  selector:       { maxHeight: 48, marginBottom: 4 },
  jPill:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 4 },
  jPillActive:    { backgroundColor: C.primary, borderColor: C.primary },
  jPillDone:      { borderColor: C.success + '44' },
  jPillText:      { fontSize: 12, fontWeight: '600', color: C.sub },
  jPillTextActive:{ color: C.text },
  jCheck:         { fontSize: 10, color: C.success },
  jornadaHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  jornadaTitle:   { fontSize: 17, fontWeight: '700', color: C.text },
  jornadaSub:     { fontSize: 12, color: C.sub },
  simTodoBtn:     { backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  simTodoBtnText: { color: C.text, fontWeight: '700', fontSize: 13 },
  doneBadge:      { backgroundColor: C.success + '22', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  doneBadgeText:  { color: C.success, fontSize: 12, fontWeight: '600' },
  pCard:          { backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  pCardMe:        { borderColor: C.primary + '55' },
  pTeams:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pTeam:          { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pTeamRight:     { justifyContent: 'flex-end' },
  pDot:           { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  pName:          { flex: 1, fontSize: 13, fontWeight: '600', color: C.sub },
  pWinner:        { color: C.text, fontWeight: '700' },
  pScore:         { paddingHorizontal: 10, alignItems: 'center' },
  pScoreText:     { fontSize: 18, fontWeight: 'black', color: C.text },
  pVs:            { fontSize: 12, color: C.muted },
  pTries:         { fontSize: 11, color: C.sub, textAlign: 'center', marginTop: 6 },
  simBtn:         { marginTop: 12, backgroundColor: C.primary + '22', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: C.primary + '44' },
  simBtnText:     { color: C.primaryLight, fontWeight: '700', fontSize: 13 },
});
