import { useEffect, useState } from 'react';
import { getJugadores, getFormacion, guardarFormacion } from '../api/client.js';

const POSICIONES_NUM = {
  1:  { label: 'Pilar Izq',    pos: 'Pilar Izq' },
  2:  { label: 'Hooker',       pos: 'Hooker' },
  3:  { label: 'Pilar Der',    pos: 'Pilar Der' },
  4:  { label: '2da Línea',    pos: 'Segunda Línea' },
  5:  { label: '2da Línea',    pos: 'Segunda Línea' },
  6:  { label: 'Ala',          pos: 'Ala' },
  7:  { label: 'Ala',          pos: 'Ala' },
  8:  { label: 'Octavo',       pos: 'Octavo' },
  9:  { label: 'Medio Scrum',  pos: 'Medio Scrum' },
  10: { label: 'Apertura',     pos: 'Apertura' },
  11: { label: 'Wing Izq',     pos: 'Wing' },
  12: { label: 'Centro',       pos: 'Centro' },
  13: { label: 'Centro',       pos: 'Centro' },
  14: { label: 'Wing Der',     pos: 'Wing' },
  15: { label: 'Fullback',     pos: 'Fullback' },
};

const TACTICAS = [
  { value: 'ataque',  label: 'Ataque',  desc: '+10% ataque / -7% defensa', color: 'text-orange-400' },
  { value: 'neutro',  label: 'Neutro',  desc: 'Sin modificadores',         color: 'text-gray-300' },
  { value: 'defensa', label: 'Defensa', desc: '+10% defensa / -7% ataque', color: 'text-blue-400' },
];

// Field layout: rows of shirt numbers (top = front row near scrum)
const CAMPO_FILAS = [
  [1, 2, 3],
  [4, 5],
  [6, 8, 7],
  [9, 10],
  [12, 13],
  [11, 15, 14],
];

function PositionSlot({ numero, jugador, onClick }) {
  return (
    <button
      onClick={() => onClick(numero)}
      className={`flex flex-col items-center justify-center rounded-lg border-2 transition-all px-2 py-1.5 min-w-[72px] max-w-[88px]
        ${jugador
          ? 'border-white/30 bg-green-900/60 hover:bg-green-800/70'
          : 'border-white/20 border-dashed bg-green-950/50 hover:bg-green-900/40'
        }`}
    >
      <span className="text-white/50 text-[10px] leading-none">{numero}</span>
      {jugador ? (
        <>
          <span className="text-white font-bold text-[11px] leading-tight mt-0.5 text-center truncate w-full">
            {jugador.apellido}
          </span>
          <span className="text-green-300/70 text-[9px] leading-none">{POSICIONES_NUM[numero]?.label}</span>
        </>
      ) : (
        <span className="text-white/30 text-[10px] mt-0.5">{POSICIONES_NUM[numero]?.label}</span>
      )}
    </button>
  );
}

function PickerModal({ numero, jugadores, onSelect, onClose }) {
  const posRequerida = POSICIONES_NUM[numero]?.pos;
  const mismaPos = jugadores.filter(j => j.posicion === posRequerida);
  const otrasPos = jugadores.filter(j => j.posicion !== posRequerida);

  const renderRow = (j) => (
    <button
      key={j.id}
      onClick={() => onSelect(j.id)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-left"
    >
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{j.nombre} {j.apellido}</p>
        <p className="text-gray-400 text-xs">{j.posicion} · {j.edad} años · moral {j.moral}</p>
      </div>
      <div className="text-right">
        <p className="text-rugby-green text-xs font-bold">{j.posicion === posRequerida ? '✓ Natural' : '⚠ Fuera'}</p>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="font-bold text-white">#{numero} – {POSICIONES_NUM[numero]?.label}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
          <p className="text-xs text-gray-500 px-2 py-1">Posición natural</p>
          {mismaPos.length ? mismaPos.map(renderRow) : <p className="text-gray-600 text-xs px-3">Ninguno disponible</p>}
          {otrasPos.length > 0 && (
            <>
              <p className="text-xs text-gray-500 px-2 pt-2 pb-1">Otras posiciones</p>
              {otrasPos.map(renderRow)}
            </>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-700">
          <button
            onClick={() => onSelect(null)}
            className="w-full text-center text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Quitar jugador
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Formacion({ clubId }) {
  const [jugadores, setJugadores] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [tactica, setTactica] = useState('neutro');
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJugadores(clubId), getFormacion(clubId)]).then(([js, form]) => {
      setJugadores(js);
      if (form?.datos && typeof form.datos === 'object') {
        const parsed = {};
        for (const [k, v] of Object.entries(form.datos)) {
          parsed[parseInt(k)] = v;
        }
        setAsignaciones(parsed);
      }
      if (form?.tactica) setTactica(form.tactica);
    }).finally(() => setLoading(false));
  }, [clubId]);

  const jugadoresAsignados = new Set(Object.values(asignaciones).filter(Boolean));

  const handleSelectJugador = (jugadorId) => {
    setAsignaciones(prev => ({ ...prev, [editando]: jugadorId }));
    setEditando(null);
  };

  const jugadoresDisponibles = jugadores.filter(j => {
    if (editando === null) return true;
    const asignadoEn = Object.entries(asignaciones).find(([k, v]) => v === j.id && parseInt(k) !== editando);
    return !asignadoEn;
  });

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await guardarFormacion(clubId, { datos: asignaciones, tactica });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch {
      alert('Error al guardar formación');
    } finally {
      setGuardando(false);
    }
  };

  const getJugador = (num) => {
    const id = asignaciones[num];
    return id ? jugadores.find(j => j.id === id) : null;
  };

  const titularesCount = Object.values(asignaciones).filter(Boolean).length;

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Formación</h1>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className={`btn-primary ${guardado ? 'bg-green-600' : ''}`}
        >
          {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar formación'}
        </button>
      </div>

      {/* Táctica */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Táctica</h2>
        <div className="flex gap-3">
          {TACTICAS.map(t => (
            <button
              key={t.value}
              onClick={() => setTactica(t.value)}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-center transition-all
                ${tactica === t.value ? 'border-rugby-green bg-rugby-green/20' : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'}`}
            >
              <p className={`font-bold text-sm ${t.color}`}>{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Campo visual */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Campo</h2>
          <span className="text-xs text-gray-500">{titularesCount}/15 titulares</span>
        </div>

        <div
          className="relative rounded-xl overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #15803d 0%, #166534 50%, #15803d 100%)' }}
        >
          {/* Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
            <div className="absolute top-1/4 left-0 right-0 h-px bg-white/10" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-white/10" />
          </div>

          <div className="relative z-10 py-4 px-3 flex flex-col gap-3">
            {CAMPO_FILAS.map((fila, i) => (
              <div key={i} className="flex justify-center gap-2">
                {fila.map(num => (
                  <PositionSlot
                    key={num}
                    numero={num}
                    jugador={getJugador(num)}
                    onClick={setEditando}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="text-center pb-2">
            <span className="text-white/20 text-[10px] uppercase tracking-widest">← Defensa</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-2 text-center">Hacé click en una posición para asignar un jugador</p>
      </div>

      {editando && (
        <PickerModal
          numero={editando}
          jugadores={jugadoresDisponibles}
          onSelect={handleSelectJugador}
          onClose={() => setEditando(null)}
        />
      )}
    </div>
  );
}
