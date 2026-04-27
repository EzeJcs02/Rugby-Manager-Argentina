import { useEffect, useState } from 'react';
import { getJugadores, getClub, entrenar } from '../api/client.js';

const FOCOS = {
  scrum:   { label: 'Scrum',    desc: 'Mejora scrum y potencia',              icon: '🏋️', attrs: ['scrum', 'potencia'] },
  lineout: { label: 'Lineout',  desc: 'Mejora lineout y potencia',            icon: '🙌', attrs: ['lineout', 'potencia'] },
  defensa: { label: 'Defensa',  desc: 'Mejora tackle y motor',                icon: '🛡️', attrs: ['tackle', 'motor'] },
  backs:   { label: 'Backs',    desc: 'Mejora pase, visión y velocidad',      icon: '⚡', attrs: ['pase', 'vision', 'velocidad'] },
  fisico:  { label: 'Físico',   desc: 'Mejora potencia, motor y velocidad',   icon: '💪', attrs: ['potencia', 'motor', 'velocidad'] },
  pie:     { label: 'Pie',      desc: 'Mejora pie y visión',                  icon: '🦶', attrs: ['pie', 'vision'] },
};

const COSTO_POR_JUGADOR = 30000;

const formatPesos = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

function JugadorRow({ jugador, seleccionado, onToggle, foco }) {
  const attrs = foco ? FOCOS[foco]?.attrs : [];
  return (
    <button
      onClick={() => onToggle(jugador.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all text-left
        ${seleccionado ? 'border-rugby-green bg-rugby-green/15' : 'border-gray-800 bg-gray-800/40 hover:border-gray-600'}`}
    >
      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center
        ${seleccionado ? 'border-rugby-green bg-rugby-green' : 'border-gray-600'}`}>
        {seleccionado && <span className="text-white text-[10px] font-bold">✓</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{jugador.nombre} {jugador.apellido}</p>
        <p className="text-gray-500 text-xs">{jugador.posicion} · {jugador.edad} años · moral {jugador.moral}</p>
      </div>
      {attrs.length > 0 && (
        <div className="flex gap-1.5 flex-shrink-0">
          {attrs.map(attr => (
            <div key={attr} className="text-center">
              <p className="text-[10px] text-gray-500">{attr}</p>
              <p className="text-xs font-bold text-white">{jugador[attr]}</p>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

function ResultadoMejoras({ mejoras, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-700">
          <h3 className="font-bold text-white text-lg">Resultados del entrenamiento</h3>
          <p className="text-gray-400 text-sm mt-0.5">{mejoras.length} jugador(es) entrenado(s)</p>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {mejoras.map(m => (
            <div key={m.jugadorId} className="bg-gray-800/50 rounded-lg px-4 py-3">
              <p className="text-white font-medium text-sm mb-2">{m.nombre}</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(m.mejoras)
                  .filter(([k]) => k !== 'moral')
                  .map(([attr, val]) => (
                    <div key={attr} className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs capitalize">{attr}</span>
                      <span className="text-rugby-green font-bold text-xs">{val}</span>
                    </div>
                  ))}
                {m.mejoras.moral && (
                  <div className="flex items-center justify-between col-span-2 border-t border-gray-700 mt-1 pt-1">
                    <span className="text-gray-400 text-xs">moral</span>
                    <span className="text-yellow-400 font-bold text-xs">{m.mejoras.moral}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-gray-700">
          <button onClick={onClose} className="btn-primary w-full">Aceptar</button>
        </div>
      </div>
    </div>
  );
}

export default function Entrenamiento({ clubId }) {
  const [jugadores, setJugadores] = useState([]);
  const [club, setClub] = useState(null);
  const [foco, setFoco] = useState(null);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [entrenando, setEntrenando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    Promise.all([getJugadores(clubId), getClub(clubId)])
      .then(([js, c]) => { setJugadores(js); setClub(c); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [clubId]);

  const toggleJugador = (id) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const costo = seleccionados.size * COSTO_POR_JUGADOR;
  const puedePagar = club && club.presupuesto >= costo;

  const handleEntrenar = async () => {
    if (!foco) return alert('Seleccioná un foco de entrenamiento');
    if (seleccionados.size === 0) return alert('Seleccioná al menos un jugador');
    if (!puedePagar) return alert('Presupuesto insuficiente');

    setEntrenando(true);
    try {
      const res = await entrenar({ clubId, foco, jugadorIds: [...seleccionados] });
      setResultado(res.mejoras);
      setSeleccionados(new Set());
      cargar();
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error al entrenar');
    } finally {
      setEntrenando(false);
    }
  };

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Entrenamiento</h1>
        {club && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Presupuesto</p>
            <p className={`text-sm font-bold ${puedePagar ? 'text-white' : 'text-red-400'}`}>
              {formatPesos(club.presupuesto)}
            </p>
          </div>
        )}
      </div>

      {/* Focos */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Foco de entrenamiento</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(FOCOS).map(([key, f]) => (
            <button
              key={key}
              onClick={() => setFoco(key)}
              className={`rounded-lg border-2 px-3 py-3 text-left transition-all
                ${foco === key ? 'border-rugby-green bg-rugby-green/20' : 'border-gray-700 bg-gray-800/40 hover:border-gray-500'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{f.icon}</span>
                <span className="font-bold text-white text-sm">{f.label}</span>
              </div>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Jugadores */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Jugadores
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSeleccionados(new Set(jugadores.map(j => j.id)))}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Todos
            </button>
            <span className="text-gray-700">|</span>
            <button
              onClick={() => setSeleccionados(new Set())}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Ninguno
            </button>
          </div>
        </div>
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {jugadores.map(j => (
            <JugadorRow
              key={j.id}
              jugador={j}
              seleccionado={seleccionados.has(j.id)}
              onToggle={toggleJugador}
              foco={foco}
            />
          ))}
        </div>
      </div>

      {/* Resumen y botón */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">
              {seleccionados.size} jugador(es) · {foco ? FOCOS[foco].label : 'sin foco'}
            </p>
            <p className={`text-lg font-bold ${puedePagar ? 'text-white' : 'text-red-400'}`}>
              Costo: {formatPesos(costo)}
            </p>
            {!puedePagar && costo > 0 && (
              <p className="text-red-400 text-xs mt-0.5">Presupuesto insuficiente</p>
            )}
          </div>
          <button
            onClick={handleEntrenar}
            disabled={entrenando || seleccionados.size === 0 || !foco || !puedePagar}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {entrenando ? 'Entrenando...' : 'Entrenar'}
          </button>
        </div>

        {foco && (
          <div className="border-t border-gray-800 pt-3">
            <p className="text-xs text-gray-600">
              Atributos que mejoran: <span className="text-gray-400">{FOCOS[foco].attrs.join(', ')}</span>
              {' '}· moral +5 · costo ${COSTO_POR_JUGADOR.toLocaleString('es-AR')} por jugador
            </p>
          </div>
        )}
      </div>

      {resultado && (
        <ResultadoMejoras mejoras={resultado} onClose={() => setResultado(null)} />
      )}
    </div>
  );
}
