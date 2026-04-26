import { useEffect, useState } from 'react';
import { getJornadas, getJornada, simularJornada, simularPartido } from '../api/client.js';

function PartidoCard({ partido, onSimular, loading }) {
  const local = partido.clubLocal;
  const visitante = partido.clubVisitante;

  return (
    <div className={`card transition-all ${partido.jugado ? 'opacity-90' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Local */}
        <div className="flex-1 text-right">
          <p className="font-bold text-white text-sm">{local.nombre}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: local.color1 }} />
          </div>
        </div>

        {/* Resultado */}
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

        {/* Visitante */}
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

  const cargarJornada = async (num) => {
    const ps = await getJornada(num);
    setPartidos(ps);
    setResultados([]);
  };

  useEffect(() => {
    getJornadas().then(js => {
      setJornadas(js);
      const activa = js.find(j => j.jugados < j.total) ?? js[js.length - 1];
      setJornadaActual(activa?.numero ?? 1);
      if (activa) cargarJornada(activa.numero);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (jornadaActual != null) cargarJornada(jornadaActual);
  }, [jornadaActual]);

  const handleSimularJornada = async () => {
    setSimulando(true);
    try {
      const res = await simularJornada(jornadaActual);
      setResultados(res);
      await cargarJornada(jornadaActual);
      const js = await getJornadas();
      setJornadas(js);
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
      setPartidos(prev => prev.map(p => p.id === id ? res : p));
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error al simular');
    } finally {
      setLoadingPartido(null);
    }
  };

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando...</div>;

  const jornadaInfo = jornadas.find(j => j.numero === jornadaActual);
  const todosJugados = jornadaInfo?.jugados === jornadaInfo?.total;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Jornadas</h1>
      </div>

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
          <button
            onClick={handleSimularJornada}
            disabled={simulando}
            className="btn-primary"
          >
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

      {/* Resumen de resultados */}
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
    </div>
  );
}
