import { useEffect, useState } from 'react';
import { getJugadores } from '../api/client.js';

const POSICION_NUM = {
  'Pilar Izq': 1, 'Hooker': 2, 'Pilar Der': 3,
  'Segunda Línea': 4, 'Ala': 6, 'Octavo': 8,
  'Medio Scrum': 9, 'Apertura': 10, 'Wing': 11, 'Centro': 12, 'Fullback': 15,
};

const GRUPOS = ['Delantera', 'Trasera'];

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

function JugadorRow({ j, selected, onSelect }) {
  const ov = overall(j);
  return (
    <div>
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selected ? 'bg-rugby-green/20 border border-rugby-green/40' : 'hover:bg-gray-800'}`}
        onClick={() => onSelect(selected ? null : j.id)}
      >
        <span className="w-6 text-center text-xs text-gray-500 font-mono">{j.numero ?? '–'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{j.nombre} {j.apellido}</p>
          <p className="text-xs text-gray-500">{j.posicion} · {j.edad} años</p>
        </div>
        <span className={`text-sm font-bold ${attrColor(ov)}`}>{ov}</span>
        <span className="text-xs text-gray-600">▼</span>
      </div>

      {selected && (
        <div className="mx-3 mb-2 p-3 bg-gray-900 rounded-b-lg border border-t-0 border-gray-800">
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
          <div className="mt-2 pt-2 border-t border-gray-800 flex gap-4 text-xs text-gray-500">
            <span>Valor: <span className="text-white">${(j.valor / 1000).toFixed(0)}k</span></span>
            <span>Moral: <span className={attrColor(j.moral)}>{j.moral}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Plantel({ clubId }) {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    getJugadores(clubId).then(setJugadores).finally(() => setLoading(false));
  }, [clubId]);

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando plantel...</div>;

  const posiciones = ['Todos', ...POSICIONES_ORDEN];
  const filtrados = filtro === 'Todos' ? jugadores : jugadores.filter(j => j.posicion === filtro);
  const ordenados = [...filtrados].sort((a, b) => {
    const pa = POSICION_NUM[a.posicion] ?? 99;
    const pb = POSICION_NUM[b.posicion] ?? 99;
    return pa - pb || overall(b) - overall(a);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Plantel</h1>
        <span className="text-sm text-gray-400">{jugadores.length} jugadores</span>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {posiciones.map(p => (
          <button
            key={p}
            onClick={() => setFiltro(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filtro === p ? 'bg-rugby-green text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="card space-y-0.5 divide-y divide-gray-800/50">
        {/* Header */}
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
            selected={selected === j.id}
            onSelect={setSelected}
          />
        ))}
      </div>
    </div>
  );
}
