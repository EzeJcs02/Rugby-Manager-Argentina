import { useEffect, useState, useRef } from 'react';
import { getJornadas, getJornada, simularJornada, simularPartido, finalizarTemporada } from '../api/client.js';

const TIPO_ICON = { try: '🏉', penal: '🎯', drop: '🦵' };
const TIPO_LABEL = { try: 'Try', penal: 'Penal', drop: 'Drop Goal' };

function MatchAnimation({ resultado, partido, onClose }) {
  const [eventosVisibles, setEventosVisibles] = useState([]);
  const [indice, setIndice] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const intervalRef = useRef(null);

  const local = partido.clubLocal;
  const visitante = partido.clubVisitante;
  const eventos = resultado.eventos ?? [];

  const ptsLocal = () => eventosVisibles.filter(e => e.equipo === 'local').reduce((s, e) => s + e.puntos, 0);
  const ptsVis = () => eventosVisibles.filter(e => e.equipo === 'visitante').reduce((s, e) => s + e.puntos, 0);

  useEffect(() => {
    if (eventos.length === 0) { setTerminado(true); return; }
    intervalRef.current = setInterval(() => {
      setIndice(prev => {
        if (prev >= eventos.length) {
          clearInterval(intervalRef.current);
          setTerminado(true);
          return prev;
        }
        setEventosVisibles(ev => [...ev, eventos[prev]]);
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(intervalRef.current);
  }, []);

  const scoreLocal = terminado ? resultado.puntosLocal : ptsLocal();
  const scoreVis = terminado ? resultado.puntosVisitante : ptsVis();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={terminado ? onClose : undefined}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}>
        {/* Header scoreboard */}
        <div className="px-6 py-5 border-b border-gray-700 text-center"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
          <div className="flex items-center justify-center gap-6">
            <div className="flex-1 text-right">
              <p className="text-white font-bold text-sm">{local.nombre}</p>
              <div className="w-3 h-3 rounded-full ml-auto mt-1" style={{ background: local.color1 }} />
            </div>
            <div className="text-center px-4">
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-black ${scoreLocal > scoreVis ? 'text-rugby-green' : 'text-white'}`}>
                  {scoreLocal}
                </span>
                <span className="text-gray-600">–</span>
                <span className={`text-4xl font-black ${scoreVis > scoreLocal ? 'text-rugby-green' : 'text-white'}`}>
                  {scoreVis}
                </span>
              </div>
              {!terminado && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-red-400 text-xs font-bold">EN VIVO</p>
                </div>
              )}
              {terminado && (
                <p className="text-gray-500 text-xs mt-1">Final</p>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">{visitante.nombre}</p>
              <div className="w-3 h-3 rounded-full mt-1" style={{ background: visitante.color1 }} />
            </div>
          </div>
        </div>

        {/* Eventos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {eventosVisibles.length === 0 && !terminado && (
            <div className="text-center py-8 text-gray-500 text-sm animate-pulse">Iniciando partido...</div>
          )}
          {[...eventosVisibles].reverse().map((ev, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg
              ${ev.equipo === 'local' ? 'bg-blue-950/50 flex-row' : 'bg-orange-950/50 flex-row-reverse'}`}>
              <span className="text-lg">{TIPO_ICON[ev.tipo]}</span>
              <div className={`flex-1 ${ev.equipo === 'visitante' ? 'text-right' : ''}`}>
                <p className="text-white font-bold text-sm">{TIPO_LABEL[ev.tipo]}</p>
                <p className="text-gray-400 text-xs">Min {ev.minuto}' · +{ev.puntos} pts</p>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: ev.equipo === 'local' ? local.color1 : visitante.color1 }} />
            </div>
          ))}
          {terminado && eventos.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">Sin anotaciones</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700">
          {terminado ? (
            <button onClick={onClose} className="btn-primary w-full">
              Ver resultados
            </button>
          ) : (
            <button
              onClick={() => { clearInterval(intervalRef.current); setEventosVisibles(eventos); setTerminado(true); }}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm transition-colors"
            >
              Saltar animación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FinalizarTemporadaModal({ onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-sm p-6 shadow-2xl">
        <h3 className="text-white font-bold text-xl mb-2">Finalizar Temporada</h3>
        <p className="text-gray-400 text-sm mb-5">
          Se cerrarán los libros de esta temporada. Los jugadores envejecerán, los mayores de 38 se retirarán,
          surgirán juveniles y se generará el fixture de la próxima temporada.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 btn-primary">
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PartidoCard({ partido, onSimular, loading }) {
  const local = partido.clubLocal;
  const visitante = partido.clubVisitante;

  return (
    <div className={`card transition-all ${partido.jugado ? 'opacity-90' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <p className="font-bold text-white text-sm">{local.nombre}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: local.color1 }} />
          </div>
        </div>
        <div className="flex-shrink-0 text-center">
          {partido.jugado ? (
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black ${partido.puntosLocal > partido.puntosVisitante ? 'text-rugby-green' : 'text-white'}`}>
                {partido.puntosLocal}
              </span>
              <span className="text-gray-600 text-sm">–</span>
              <span className={`text-xl font-black ${partido.puntosVisitante > partido.puntosLocal ? 'text-rugby-green' : 'text-white'}`}>
                {partido.puntosVisitante}
              </span>
            </div>
          ) : (
            <span className="text-gray-600 text-sm font-medium">vs</span>
          )}
          {partido.jugado && (
            <p className="text-xs text-gray-600 mt-0.5">
              {partido.triesLocal}T – {partido.triesVisitante}T
            </p>
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-white text-sm">{visitante.nombre}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: visitante.color1 }} />
          </div>
        </div>
      </div>
      {!partido.jugado && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => onSimular(partido.id)}
            disabled={loading}
            className="btn-primary text-xs py-1.5 px-4"
          >
            {loading ? 'Simulando...' : 'Simular este partido'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Jornada({ clubId }) {
  const [jornadas, setJornadas] = useState([]);
  const [jornadaActual, setJornadaActual] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulando, setSimulando] = useState(false);
  const [loadingPartido, setLoadingPartido] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [animacion, setAnimacion] = useState(null);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [temporadaFinalizada, setTemporadaFinalizada] = useState(null);

  const cargarJornada = async (num) => {
    const ps = await getJornada(num);
    setPartidos(ps);
    setResultados([]);
  };

  const cargarJornadas = async () => {
    const js = await getJornadas();
    setJornadas(js);
    return js;
  };

  useEffect(() => {
    cargarJornadas().then(js => {
      const activa = js.find(j => j.jugados < j.total) ?? js[js.length - 1];
      setJornadaActual(activa?.numero ?? 1);
      if (activa) cargarJornada(activa.numero);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (jornadaActual != null) cargarJornada(jornadaActual);
  }, [jornadaActual]);

  const todasLasJornadasCompletas = jornadas.length > 0 && jornadas.every(j => j.jugados === j.total);

  const handleSimularJornada = async () => {
    setSimulando(true);
    try {
      const res = await simularJornada(jornadaActual);
      setResultados(res);
      await cargarJornada(jornadaActual);
      await cargarJornadas();
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error al simular');
    } finally {
      setSimulando(false);
    }
  };

  const handleSimularPartido = async (id) => {
    setLoadingPartido(id);
    try {
      const res = await simularPartido(id);
      const partidoData = partidos.find(p => p.id === id);
      setAnimacion({ resultado: res, partido: { ...partidoData, ...res } });
      setPartidos(prev => prev.map(p => p.id === id ? { ...p, ...res, jugado: true } : p));
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error al simular');
    } finally {
      setLoadingPartido(null);
    }
  };

  const handleAnimacionClose = async () => {
    setAnimacion(null);
    await cargarJornadas();
  };

  const handleFinalizar = async () => {
    setFinalizando(true);
    try {
      const res = await finalizarTemporada();
      setTemporadaFinalizada(res);
      setShowFinalizar(false);
      await cargarJornadas().then(js => {
        const primera = js[0];
        setJornadaActual(primera?.numero ?? 1);
        if (primera) cargarJornada(primera.numero);
      });
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error al finalizar temporada');
    } finally {
      setFinalizando(false);
    }
  };

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando...</div>;

  const jornadaInfo = jornadas.find(j => j.numero === jornadaActual);
  const todosJugados = jornadaInfo?.jugados === jornadaInfo?.total;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Jornadas</h1>
        {todasLasJornadasCompletas && (
          <button
            onClick={() => setShowFinalizar(true)}
            className="bg-rugby-gold text-gray-900 font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            🏆 Finalizar Temporada
          </button>
        )}
      </div>

      {temporadaFinalizada && (
        <div className="card border-rugby-gold/50 bg-rugby-gold/10">
          <p className="font-bold text-rugby-gold">¡Temporada finalizada!</p>
          <p className="text-gray-300 text-sm mt-1">{temporadaFinalizada.mensaje}</p>
          <button onClick={() => setTemporadaFinalizada(null)} className="text-xs text-gray-500 mt-2 hover:text-white transition-colors">×  Cerrar</button>
        </div>
      )}

      {/* Selector de jornada */}
      <div className="flex gap-2 flex-wrap">
        {jornadas.map(j => (
          <button
            key={j.numero}
            onClick={() => setJornadaActual(j.numero)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              jornadaActual === j.numero
                ? 'bg-rugby-green text-white'
                : j.jugados === j.total
                  ? 'bg-gray-800 text-gray-500'
                  : 'bg-gray-800 text-yellow-400'
            }`}
          >
            J{j.numero}
            {j.jugados === j.total && <span className="ml-1 text-green-600">✓</span>}
          </button>
        ))}
      </div>

      {/* Header jornada */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Jornada {jornadaActual}</h2>
          {jornadaInfo && (
            <p className="text-xs text-gray-500">
              {jornadaInfo.jugados}/{jornadaInfo.total} partidos jugados
            </p>
          )}
        </div>
        {!todosJugados && (
          <button onClick={handleSimularJornada} disabled={simulando} className="btn-primary">
            {simulando ? '⏳ Simulando...' : '▶ Simular jornada'}
          </button>
        )}
        {todosJugados && (
          <span className="badge bg-green-900 text-green-300">Jornada completada</span>
        )}
      </div>

      {/* Partidos */}
      <div className="space-y-3">
        {partidos.map(p => (
          <PartidoCard
            key={p.id}
            partido={p}
            onSimular={handleSimularPartido}
            loading={loadingPartido === p.id}
          />
        ))}
      </div>

      {/* Resumen de resultados de jornada completa */}
      {resultados.length > 0 && (
        <div className="card border-rugby-green/40">
          <h3 className="font-bold text-white mb-3">Resultados de la jornada</h3>
          <div className="space-y-2">
            {resultados.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className={r.puntosLocal >= r.puntosVisitante ? 'text-rugby-green font-bold' : 'text-gray-400'}>
                  {r.clubLocal.nombre}
                </span>
                <span className="text-white font-bold mx-3">{r.puntosLocal} – {r.puntosVisitante}</span>
                <span className={r.puntosVisitante >= r.puntosLocal ? 'text-rugby-green font-bold' : 'text-gray-400'}>
                  {r.clubVisitante.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Animated match modal */}
      {animacion && (
        <MatchAnimation
          resultado={animacion.resultado}
          partido={animacion.partido}
          onClose={handleAnimacionClose}
        />
      )}

      {/* Finalizar temporada modal */}
      {showFinalizar && (
        <FinalizarTemporadaModal
          onConfirm={handleFinalizar}
          onClose={() => setShowFinalizar(false)}
          loading={finalizando}
        />
      )}
    </div>
  );
}
