import { useEffect, useState } from 'react';
import { getJugadores, getJornadas, toggleVenta, getJugadorStats } from '../api/client.js';

const POSICION_NUM = {
  'Pilar Izq': 1, 'Hooker': 2, 'Pilar Der': 3,
  'Segunda Línea': 4, 'Ala': 6, 'Octavo': 8,
  'Medio Scrum': 9, 'Apertura': 10, 'Wing': 11, 'Centro': 12, 'Fullback': 15,
};

const POSICIONES_ORDEN = [
  'Pilar Izq', 'Hooker', 'Pilar Der', 'Segunda Línea',
  'Ala', 'Octavo', 'Medio Scrum', 'Apertura', 'Centro', 'Wing', 'Fullback',
];

const ATTRS = [
  { key: 'scrum', label: 'SCR' },
  { key: 'lineout', label: 'LIN' },
  { key: 'tackle', label: 'TAC' },
  { key: 'velocidad', label: 'VEL' },
  { key: 'pase', label: 'PAS' },
  { key: 'pie', label: 'PIE' },
  { key: 'vision', label: 'VIS' },
  { key: 'potencia', label: 'POT' },
  { key: 'motor', label: 'MOT' },
  { key: 'liderazgo', label: 'LID' },
];

function attrColor(v) {
  if (v >= 85) return 'text-green-400';
  if (v >= 70) return 'text-yellow-400';
  if (v >= 55) return 'text-orange-400';
  return 'text-red-400';
}

function barColor(v) {
  if (v >= 85) return 'bg-green-500';
  if (v >= 70) return 'bg-yellow-500';
  if (v >= 55) return 'bg-orange-500';
  return 'bg-red-500';
}

function overall(j) {
  const sum = ATTRS.reduce((s, a) => s + j[a.key], 0);
  return Math.round(sum / ATTRS.length);
}

function JugadorStats({ jugadorId }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    getJugadorStats(jugadorId).then(setStats).catch(() => {});
  }, [jugadorId]);
  if (!stats) return null;
  if (stats.tries === 0 && stats.penales === 0 && stats.apariciones === 0) return null;
  return (
    <div className="flex gap-4 pt-1.5">
      {stats.apariciones > 0 && (
        <span className="text-[10px] text-gray-600">
          Partidos: <span className="text-gray-400">{stats.apariciones}</span>
        </span>
      )}
      {stats.tries > 0 && (
        <span className="text-[10px] text-gray-600">
          Tries: <span style={{ color: '#4ADE80' }}>{stats.tries}</span>
        </span>
      )}
      {stats.penales > 0 && (
        <span className="text-[10px] text-gray-600">
          Pen: <span className="text-yellow-500">{stats.penales}</span>
        </span>
      )}
      {stats.puntos > 0 && (
        <span className="text-[10px] text-gray-600">
          Pts: <span className="text-white">{stats.puntos}</span>
        </span>
      )}
    </div>
  );
}

function JugadorRow({ j, jornadaActual, selected, onSelect, onToggleVenta }) {
  const ov = overall(j);
  const lesionado   = j.lesionadoHasta  != null && j.lesionadoHasta  >= jornadaActual;
  const convocado   = j.convocadoHasta  != null && j.convocadoHasta  >= jornadaActual;
  const jornadasResta = lesionado ? j.lesionadoHasta - jornadaActual + 1 : 0;
  const jornadasConv  = convocado ? j.convocadoHasta  - jornadaActual + 1 : 0;

  return (
    <div>
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
        style={selected
          ? { background: 'rgba(232,23,44,0.08)', border: '1px solid rgba(232,23,44,0.25)' }
          : { background: 'transparent', border: '1px solid transparent' }
        }
        onClick={() => onSelect(selected ? null : j.id)}
      >
        <span className="w-6 text-center text-xs text-gray-500 font-mono">{j.numero ?? '–'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">{j.nombre} {j.apellido}</p>
            {lesionado && (
              <span className="text-[10px] bg-red-900/60 text-red-300 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                🩹 {jornadasResta}J
              </span>
            )}
            {convocado && (
              <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                🌐 {jornadasConv}J
              </span>
            )}
            {j.enVenta && (
              <span className="text-[10px] bg-yellow-900/60 text-yellow-300 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                EN VENTA
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{j.posicion} · {j.edad} años</p>
        </div>
        <span className={`text-sm font-bold ${attrColor(ov)}`}>{ov}</span>
        <span className="text-xs text-gray-600">▼</span>
      </div>

      {selected && (
        <div className="mx-3 mb-2 p-3 rounded-b-lg" style={{ background: '#0D0D14', border: '1px solid #1E1E32', borderTop: 'none' }}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {ATTRS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-8">{label}</span>
                <div className="flex-1 stat-bar-bg">
                  <div className={`stat-bar ${barColor(j[key])}`} style={{ width: `${j[key]}%` }} />
                </div>
                <span className={`text-xs font-bold w-6 text-right ${attrColor(j[key])}`}>{j[key]}</span>
              </div>
            ))}
          </div>
          <JugadorStats jugadorId={j.id} />
          <div className="mt-2 pt-2 border-t border-gray-800/50 flex items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex gap-4 flex-wrap">
              <span>Valor: <span className="text-white">${(j.valor / 1000).toFixed(0)}k</span></span>
              <span>Salario: <span className="text-yellow-400">${Math.round(j.valor / 200).toLocaleString('es-AR')}/j</span></span>
              <span>Moral: <span className={attrColor(j.moral)}>{j.moral}</span></span>
              {lesionado  && <span>Lesionado: <span className="text-red-400">{jornadasResta} jornada(s)</span></span>}
              {convocado  && <span>Selección: <span className="text-blue-400">{jornadasConv} jornada(s)</span></span>}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVenta(j.id); }}
              className="text-xs px-2 py-1 rounded-lg transition-colors font-medium"
              style={j.enVenta
                ? { background: 'rgba(234,179,8,0.12)', color: '#FCD34D', border: '1px solid rgba(234,179,8,0.3)' }
                : { background: '#1E1E32', color: '#6B7280', border: '1px solid transparent' }
              }
            >
              {j.enVenta ? 'Quitar del mercado' : 'Poner en venta'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparadorModal({ j1, j2, onClose }) {
  const attrs = ATTRS;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="w-full max-w-xl shadow-2xl p-5 rounded-2xl"
        style={{ background: '#12121F', border: '1px solid #1E1E32' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Comparar jugadores</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div>
            <p className="font-bold text-white text-sm">{j1.nombre} {j1.apellido}</p>
            <p className="text-xs text-gray-500">{j1.posicion} · {j1.edad}a · OVR {overall(j1)}</p>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-gray-600 font-bold">vs</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">{j2.nombre} {j2.apellido}</p>
            <p className="text-xs text-gray-500">{j2.posicion} · {j2.edad}a · OVR {overall(j2)}</p>
          </div>
        </div>
        <div className="space-y-2">
          {attrs.map(({ key, label }) => {
            const v1 = j1[key], v2 = j2[key];
            const max = Math.max(v1, v2, 1);
            return (
              <div key={key} className="grid grid-cols-3 items-center gap-2">
                <div className="flex items-center gap-2 justify-end">
                  <span className={`text-xs font-bold w-6 text-right ${attrColor(v1)}`}>{v1}</span>
                  <div className="flex-1 stat-bar-bg" style={{ maxWidth: 80 }}>
                    <div className={`stat-bar ${v1 >= v2 ? '' : 'bg-gray-700'}`} style={{ width: `${(v1 / 99) * 100}%`, background: v1 >= v2 ? '#E8172C' : undefined }} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">{label}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 stat-bar-bg" style={{ maxWidth: 80 }}>
                    <div className={`stat-bar ${v2 >= v1 ? '' : 'bg-gray-700'}`} style={{ width: `${(v2 / 99) * 100}%`, background: v2 >= v1 ? '#E8172C' : undefined }} />
                  </div>
                  <span className={`text-xs font-bold w-6 ${attrColor(v2)}`}>{v2}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Plantel({ clubId }) {
  const [jugadores, setJugadores] = useState([]);
  const [jornadaActual, setJornadaActual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [comparando, setComparando] = useState(null);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    Promise.all([getJugadores(clubId), getJornadas()]).then(([js, jornadas]) => {
      setJugadores(js);
      const activa = jornadas.find(j => j.jugados < j.total) ?? jornadas[jornadas.length - 1];
      setJornadaActual(activa?.numero ?? 1);
    }).finally(() => setLoading(false));
  }, [clubId]);

  const handleToggleVenta = async (jugadorId) => {
    const actualizado = await toggleVenta(jugadorId);
    setJugadores(prev => prev.map(j => j.id === jugadorId ? { ...j, enVenta: actualizado.enVenta } : j));
  };

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando plantel...</div>;

  const posiciones = ['Todos', ...POSICIONES_ORDEN];
  const filtrados = filtro === 'Todos' ? jugadores : jugadores.filter(j => j.posicion === filtro);
  const ordenados = [...filtrados].sort((a, b) => {
    const pa = POSICION_NUM[a.posicion] ?? 99;
    const pb = POSICION_NUM[b.posicion] ?? 99;
    return pa - pb || overall(b) - overall(a);
  });

  const lesionadosCount = jugadores.filter(j => j.lesionadoHasta != null && j.lesionadoHasta >= jornadaActual).length;
  const convocadosCount = jugadores.filter(j => j.convocadoHasta  != null && j.convocadoHasta  >= jornadaActual).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Plantel</h1>
        <div className="flex items-center gap-3">
          {lesionadosCount > 0 && (
            <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
              🩹 {lesionadosCount} lesionado(s)
            </span>
          )}
          {convocadosCount > 0 && (
            <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
              🌐 {convocadosCount} en selección
            </span>
          )}
          {selected && (
            <button
              onClick={() => { setComparando(selected); setSelected(null); }}
              className="text-xs bg-gray-800 text-gray-300 hover:text-white px-3 py-1 rounded-lg transition-colors"
            >
              ⚖ Comparar otro
            </button>
          )}
          <span className="text-sm text-gray-400">{jugadores.length} jugadores</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {posiciones.map(p => (
          <button
            key={p}
            onClick={() => setFiltro(p)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={filtro === p
              ? { background: '#E8172C', color: '#fff' }
              : { background: '#12121F', color: '#6B7280', border: '1px solid #1E1E32' }
            }
          >
            {p}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="card space-y-0.5 divide-y divide-gray-800/50">
        <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-600 uppercase tracking-wider">
          <span className="w-6 text-center">#</span>
          <span className="flex-1">Jugador</span>
          <span>OVR</span>
          <span className="w-4" />
        </div>
        {ordenados.map(j => (
          <JugadorRow
            key={j.id}
            j={j}
            jornadaActual={jornadaActual}
            selected={selected === j.id}
            onSelect={(id) => {
              if (comparando && id && id !== comparando) { setSelected(id); }
              else { setSelected(selected === id ? null : id); }
            }}
            onToggleVenta={handleToggleVenta}
          />
        ))}
      </div>

      {comparando && !selected && (
        <div className="card" style={{ borderColor: '#2A2A3E' }}>
          <p className="text-sm text-gray-400 mb-2">
            Seleccioná un jugador para comparar con <span className="text-white font-bold">{jugadores.find(j => j.id === comparando)?.apellido}</span>
          </p>
          <button onClick={() => setComparando(null)} className="text-xs text-gray-500 hover:text-white transition-colors">Cancelar</button>
        </div>
      )}

      {comparando && selected && comparando !== selected && (() => {
        const j1 = jugadores.find(j => j.id === comparando);
        const j2 = jugadores.find(j => j.id === selected);
        return j1 && j2 ? (
          <ComparadorModal j1={j1} j2={j2} onClose={() => { setComparando(null); setSelected(null); }} />
        ) : null;
      })()}
    </div>
  );
}
