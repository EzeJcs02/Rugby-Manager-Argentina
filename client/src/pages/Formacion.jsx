import { useEffect, useState } from 'react';
import { getJugadores, getFormacion, guardarFormacion, getJornadas } from '../api/client.js';

const POSICIONES_NUM = {
  1:  { label: 'Pilar Izq',   pos: 'Pilar Izq' },
  2:  { label: 'Hooker',      pos: 'Hooker' },
  3:  { label: 'Pilar Der',   pos: 'Pilar Der' },
  4:  { label: '2da Línea',   pos: 'Segunda Línea' },
  5:  { label: '2da Línea',   pos: 'Segunda Línea' },
  6:  { label: 'Ala',         pos: 'Ala' },
  7:  { label: 'Ala',         pos: 'Ala' },
  8:  { label: 'Octavo',      pos: 'Octavo' },
  9:  { label: 'M. Scrum',    pos: 'Medio Scrum' },
  10: { label: 'Apertura',    pos: 'Apertura' },
  11: { label: 'Wing Izq',    pos: 'Wing' },
  12: { label: 'Centro',      pos: 'Centro' },
  13: { label: 'Centro',      pos: 'Centro' },
  14: { label: 'Wing Der',    pos: 'Wing' },
  15: { label: 'Fullback',    pos: 'Fullback' },
};

const TACTICAS = [
  { value: 'ataque',  label: 'Ataque',  desc: '+10% ofensivo',  icon: '⚡', color: '#FB923C' },
  { value: 'neutro',  label: 'Neutro',  desc: 'Sin modif.',     icon: '⚖', color: '#9CA3AF' },
  { value: 'defensa', label: 'Defensa', desc: '+10% defensivo', icon: '🛡', color: '#60A5FA' },
];

const CAMPO_FILAS = [
  [1, 2, 3],
  [4, 5],
  [6, 8, 7],
  [9, 10],
  [12, 13],
  [11, 15, 14],
];

const ATTRS = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
const ovr = j => Math.round(ATTRS.reduce((s, a) => s + j[a], 0) / ATTRS.length);

function PositionSlot({ numero, jugador, onClick }) {
  const filled = !!jugador;
  return (
    <button
      onClick={() => onClick(numero)}
      className="flex flex-col items-center justify-center transition-all px-1.5 py-1.5 rounded-lg"
      style={{
        minWidth: 70, maxWidth: 88,
        background: filled ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)',
        border: filled ? '2px solid rgba(255,255,255,0.4)' : '2px dashed rgba(255,255,255,0.2)',
      }}
    >
      <span className="text-white/40 text-[9px] leading-none font-mono">{numero}</span>
      {filled ? (
        <>
          <span className="text-white font-bold text-[11px] leading-tight mt-0.5 text-center truncate w-full">
            {jugador.apellido}
          </span>
          <span className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {POSICIONES_NUM[numero]?.label}
          </span>
        </>
      ) : (
        <span className="text-white/25 text-[9px] mt-0.5 text-center">{POSICIONES_NUM[numero]?.label}</span>
      )}
    </button>
  );
}

function PickerModal({ numero, jugadores, onSelect, onClose }) {
  const posRequerida = POSICIONES_NUM[numero]?.pos;
  const mismaPos   = jugadores.filter(j => j.posicion === posRequerida);
  const otrasPos   = jugadores.filter(j => j.posicion !== posRequerida);

  const renderRow = (j) => {
    const esNatural = j.posicion === posRequerida;
    return (
      <button
        key={j.id}
        onClick={() => !j._lesionado && onSelect(j.id)}
        disabled={j._lesionado}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'transparent' }}
        onMouseEnter={e => { if (!j._lesionado) e.currentTarget.style.background = '#1E1E32'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium">{j.nombre} {j.apellido}</p>
            {j._lesionado && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(232,23,44,0.15)', color: '#F87171' }}>
                No disp.
              </span>
            )}
          </div>
          <p className="text-gray-600 text-xs">{j.posicion} · {j.edad} años · moral {j.moral}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold" style={{ color: esNatural ? '#4ADE80' : '#FB923C' }}>
            {esNatural ? '✓ Natural' : '⚠ Fuera'}
          </p>
          <p className="text-xs text-gray-600">{ovr(j)}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl rounded-2xl"
        style={{ background: '#12121F', border: '1px solid #1E1E32' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1E1E32' }}>
          <h3 className="font-black text-white text-base">
            #{numero} — {POSICIONES_NUM[numero]?.label}
          </h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl transition-colors">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
          <p className="section-title px-3 py-1">Posición natural</p>
          {mismaPos.length
            ? mismaPos.map(renderRow)
            : <p className="text-gray-700 text-xs px-3 pb-1">Ninguno disponible</p>
          }
          {otrasPos.length > 0 && (
            <>
              <p className="section-title px-3 py-1 pt-2">Otras posiciones</p>
              {otrasPos.map(renderRow)}
            </>
          )}
        </div>

        <div className="px-5 py-3" style={{ borderTop: '1px solid #1E1E32' }}>
          <button
            onClick={() => onSelect(null)}
            className="w-full text-center text-xs py-1.5 rounded-lg font-medium transition-colors"
            style={{ color: '#F87171', background: 'rgba(232,23,44,0.06)' }}
          >
            Quitar jugador de esta posición
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Formacion({ clubId }) {
  const [jugadores, setJugadores]         = useState([]);
  const [asignaciones, setAsignaciones]   = useState({});
  const [tactica, setTactica]             = useState('neutro');
  const [editando, setEditando]           = useState(null);
  const [guardando, setGuardando]         = useState(false);
  const [guardado, setGuardado]           = useState(false);
  const [jornadaActual, setJornadaActual] = useState(1);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([getJugadores(clubId), getFormacion(clubId), getJornadas()]).then(([js, form, jornadas]) => {
      const activa = jornadas.find(j => j.jugados < j.total) ?? jornadas[jornadas.length - 1];
      const jNum = activa?.numero ?? 1;
      setJornadaActual(jNum);
      setJugadores(js.map(j => ({
        ...j,
        _lesionado: (j.lesionadoHasta != null && j.lesionadoHasta >= jNum) ||
                    (j.convocadoHasta  != null && j.convocadoHasta  >= jNum),
      })));
      if (form?.datos && typeof form.datos === 'object' && !Array.isArray(form.datos)) {
        const parsed = {};
        for (const [k, v] of Object.entries(form.datos)) {
          parsed[parseInt(k)] = v;
        }
        setAsignaciones(parsed);
      }
      if (form?.tactica) setTactica(form.tactica);
    }).finally(() => setLoading(false));
  }, [clubId]);

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
      setTimeout(() => setGuardado(false), 2500);
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

  if (loading) return (
    <div className="text-gray-600 animate-pulse py-20 text-center text-xs uppercase tracking-[0.25em]">Cargando...</div>
  );

  return (
    <div className="space-y-4">
      {/* Táctica */}
      <div className="card">
        <p className="section-title mb-3">Táctica</p>
        <div className="grid grid-cols-3 gap-2">
          {TACTICAS.map(t => (
            <button
              key={t.value}
              onClick={() => setTactica(t.value)}
              className="rounded-xl px-3 py-3 text-center transition-all"
              style={tactica === t.value
                ? { background: `${t.color}15`, border: `2px solid ${t.color}60` }
                : { background: '#0D0D14', border: '2px solid #1E1E32' }
              }
            >
              <span className="text-lg block mb-1">{t.icon}</span>
              <p className="font-bold text-sm" style={{ color: tactica === t.value ? t.color : '#9CA3AF' }}>{t.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Campo visual */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">Campo · {titularesCount}/15</p>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-4 py-1.5 rounded-lg font-bold text-xs text-white uppercase tracking-wider disabled:opacity-50 transition-all"
            style={{ background: guardado ? '#2D6A4F' : '#E8172C' }}
          >
            {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        <div
          className="relative rounded-xl overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #166534 0%, #15803d 50%, #166534 100%)' }}
        >
          {/* Líneas del campo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15" />
            <div className="absolute top-1/4 left-0 right-0 h-px bg-white/07" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-white/07" />
          </div>

          <div className="relative z-10 py-5 px-3 flex flex-col gap-2.5">
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
            <span className="text-white/15 text-[9px] uppercase tracking-[0.3em]">← Defensa · Ataque →</span>
          </div>
        </div>

        <p className="text-gray-700 text-[10px] text-center mt-2">
          Tocá una posición para asignar un jugador
        </p>
      </div>

      {editando !== null && (
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
