import { useEffect, useState, useRef } from 'react';
import { getJornadas, getJornada, simularJornada, simularPartido, finalizarTemporada, getCopa, iniciarCopa, crearFinal, getJugadores, getTabla } from '../api/client.js';
import { ClubShield } from '../components/Layout.jsx';

const TIPO_ICON  = { try: '🏉', penal: '🎯', drop: '🦵' };
const TIPO_LABEL = { try: 'Try', penal: 'Penal', drop: 'Drop' };

// ─── Animación de partido ──────────────────────────────────────────────────────
function MatchAnimation({ resultado, partido, onClose }) {
  const [eventosVisibles, setEventosVisibles] = useState([]);
  const [indice, setIndice]   = useState(0);
  const [terminado, setTerminado] = useState(false);
  const intervalRef = useRef(null);

  const local     = partido.clubLocal;
  const visitante = partido.clubVisitante;
  const eventos   = resultado.eventos ?? [];

  const ptsLocal = () => eventosVisibles.filter(e => e.equipo === 'local').reduce((s, e) => s + e.puntos, 0);
  const ptsVis   = () => eventosVisibles.filter(e => e.equipo === 'visitante').reduce((s, e) => s + e.puntos, 0);

  useEffect(() => {
    if (eventos.length === 0) { setTerminado(true); return; }
    intervalRef.current = setInterval(() => {
      setIndice(prev => {
        if (prev >= eventos.length) { clearInterval(intervalRef.current); setTerminado(true); return prev; }
        setEventosVisibles(ev => [...ev, eventos[prev]]);
        return prev + 1;
      });
    }, 550);
    return () => clearInterval(intervalRef.current);
  }, []);

  const scoreLocal = terminado ? resultado.puntosLocal : ptsLocal();
  const scoreVis   = terminado ? resultado.puntosVisitante : ptsVis();
  const ganadorLocal = scoreLocal > scoreVis;
  const ganadorVis   = scoreVis > scoreLocal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85" onClick={terminado ? onClose : undefined}>
      <div
        className="w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden rounded-2xl"
        style={{ background: '#0D0D14', border: '1px solid #1E1E32' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="px-5 py-5 flex-shrink-0"
          style={{
            background: `linear-gradient(105deg, ${local.color1}22 0%, #0D0D14 40%, ${visitante.color1}22 100%)`,
            borderBottom: '1px solid #1E1E32',
          }}
        >
          {resultado.esCopa && (
            <p className="text-center text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: '#E8C000' }}>
              🏆 {resultado.tipo === 'final' ? 'Final Super Rugby Americas' : 'Semifinal Super Rugby Americas'}
            </p>
          )}

          <div className="flex items-center justify-center gap-4">
            {/* Local */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <ClubShield club={local} size={56} />
              <p className="text-white font-bold text-xs uppercase tracking-tight text-center leading-tight">{local.nombre}</p>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span
                  className="text-5xl font-black tabular-nums"
                  style={{ color: ganadorLocal ? '#E8172C' : '#FFFFFF' }}
                >{scoreLocal}</span>
                <span className="text-2xl font-black" style={{ color: '#2A2A3E' }}>–</span>
                <span
                  className="text-5xl font-black tabular-nums"
                  style={{ color: ganadorVis ? '#E8172C' : '#FFFFFF' }}
                >{scoreVis}</span>
              </div>
              {!terminado ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#E8172C' }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#E8172C' }}>En Vivo</p>
                </div>
              ) : (
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Final</p>
              )}
            </div>

            {/* Visitante */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <ClubShield club={visitante} size={56} />
              <p className="text-white font-bold text-xs uppercase tracking-tight text-center leading-tight">{visitante.nombre}</p>
            </div>
          </div>
        </div>

        {/* ── Eventos ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {eventosVisibles.length === 0 && !terminado && (
            <div className="text-center py-10 text-gray-600 text-xs uppercase tracking-[0.2em] animate-pulse">
              Iniciando partido...
            </div>
          )}
          {[...eventosVisibles].reverse().map((ev, i) => {
            const esLocal = ev.equipo === 'local';
            const club    = esLocal ? local : visitante;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${esLocal ? '' : 'flex-row-reverse'}`}
                style={{ background: `${club.color1}12`, border: `1px solid ${club.color1}25` }}
              >
                <span className="text-base flex-shrink-0">{TIPO_ICON[ev.tipo]}</span>
                <div className={`flex-1 ${!esLocal ? 'text-right' : ''}`}>
                  <p className="text-white font-bold text-xs">
                    {TIPO_LABEL[ev.tipo]}{ev.jugadorNombre ? ` — ${ev.jugadorNombre}` : ''}
                  </p>
                  <p className="text-gray-600 text-[10px]">Min {ev.minuto}' · +{ev.puntos} pts</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: club.color1 }} />
              </div>
            );
          })}
          {terminado && eventos.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-xs">Sin anotaciones registradas</div>
          )}
        </div>

        {/* ── Campeón ── */}
        {resultado.campeon && (
          <div
            className="px-6 py-4 text-center flex-shrink-0"
            style={{ background: 'rgba(232,192,0,0.1)', borderTop: '1px solid rgba(232,192,0,0.3)' }}
          >
            <p className="text-2xl mb-1">🏆</p>
            <p className="font-black text-lg" style={{ color: '#E8C000' }}>{resultado.campeon.nombre}</p>
            <p className="text-gray-400 text-xs mt-0.5">Campeón del Super Rugby Americas · Premio $500k</p>
          </div>
        )}

        {/* ── Acciones ── */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #1E1E32' }}>
          {terminado ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white uppercase tracking-wider transition-all hover:opacity-90"
              style={{ background: '#E8172C' }}
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={() => { clearInterval(intervalRef.current); setEventosVisibles(eventos); setTerminado(true); }}
              className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-300 text-sm transition-colors"
              style={{ background: '#12121F' }}
            >
              Saltar animación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal confirmar finalizar ─────────────────────────────────────────────────
function FinalizarModal({ onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl"
        style={{ background: '#12121F', border: '1px solid #1E1E32' }}
      >
        <div className="text-center mb-5">
          <p className="text-3xl mb-3">🏁</p>
          <h3 className="text-white font-black text-xl uppercase tracking-tight">Finalizar Temporada</h3>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Los jugadores envejecerán, los retirados (38+) dejarán sus clubes, surgirán juveniles y se generará el fixture de la próxima temporada.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors"
            style={{ background: '#1E1E32' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-opacity"
            style={{ background: '#E8172C' }}
          >
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pantalla de nueva temporada ───────────────────────────────────────────────
const ATTRS_OVR = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
const ovrJ = j => Math.round(ATTRS_OVR.reduce((s, a) => s + (j[a] ?? 0), 0) / ATTRS_OVR.length);

function NuevaTemporadaScreen({ data, onClose }) {
  const juveniles      = data.misJuveniles ?? [];
  const proximaJornada = data.proximaJornada ?? [];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div
        className="rounded-2xl p-6 text-center space-y-3"
        style={{ background: 'linear-gradient(135deg, #0D1F18 0%, #12121F 100%)', border: '1px solid #2D6A4F' }}
      >
        <p className="text-4xl">🎉</p>
        <div>
          <p className="text-white font-black text-2xl uppercase tracking-tight">{data.temporada?.nombre ?? 'Nueva Temporada'}</p>
          <p className="text-gray-400 text-sm mt-1">¡Comienza una nueva temporada!</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl py-3 px-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E1E32' }}>
            <p className="text-white font-black text-2xl">{data.retirados ?? 0}</p>
            <p className="text-gray-500 text-xs mt-0.5 uppercase tracking-wide">Retirados</p>
          </div>
          <div className="rounded-xl py-3 px-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E1E32' }}>
            <p className="text-white font-black text-2xl">{data.juvenilesCreados ?? 0}</p>
            <p className="text-gray-500 text-xs mt-0.5 uppercase tracking-wide">Juveniles en liga</p>
          </div>
        </div>
      </div>

      {/* Mis juveniles */}
      {juveniles.length > 0 && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
          <p className="section-title">🌱 Juveniles incorporados a tu plantel</p>
          <div className="grid grid-cols-2 gap-2">
            {juveniles.map(j => (
              <div
                key={j.id}
                className="rounded-xl px-3 py-2.5 flex items-center gap-2"
                style={{ background: '#0D0D14', border: '1px solid #1E1E32' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate">{j.nombre} {j.apellido}</p>
                  <p className="text-gray-600 text-[10px]">{j.posicion} · {j.edad} años</p>
                </div>
                <span
                  className="text-xs font-black flex-shrink-0 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}
                >
                  {ovrJ(j)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próxima jornada */}
      {proximaJornada.length > 0 && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
          <p className="section-title">📅 Jornada 1 — Próximos partidos</p>
          <div className="space-y-1.5">
            {proximaJornada.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg"
                style={{ background: '#0D0D14' }}
              >
                <span className="flex-1 text-right truncate text-gray-300">{p.clubLocal?.nombre}</span>
                <span className="flex-shrink-0 text-gray-700 font-bold w-8 text-center">vs</span>
                <span className="flex-1 truncate text-gray-300">{p.clubVisitante?.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-xl font-bold text-sm text-white uppercase tracking-wider transition-opacity hover:opacity-90"
        style={{ background: '#2D6A4F' }}
      >
        Ir a la nueva temporada →
      </button>
    </div>
  );
}

// ─── Resumen post-jornada ─────────────────────────────────────────────────────
function ResumenJornada({ resultados, numero, clubId, onClose }) {
  const miResultado = resultados.find(r =>
    r.clubLocalId === clubId || r.clubVisitanteId === clubId
  );

  const getMiResultado = (r) => {
    if (!r) return null;
    const soyLocal = r.clubLocalId === clubId;
    const misPts   = soyLocal ? r.puntosLocal : r.puntosVisitante;
    const riPts    = soyLocal ? r.puntosVisitante : r.puntosLocal;
    if (misPts > riPts)  return { label: 'V', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' };
    if (misPts === riPts) return { label: 'E', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' };
    return { label: 'D', color: '#F87171', bg: 'rgba(248,113,113,0.1)' };
  };

  const totalLesionados = resultados.flatMap(r => r.lesionados ?? []);
  const resultadoMio = getMiResultado(miResultado);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: '#0D0D14', border: '1px solid #1E1E32' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #1E1E32' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-600">Fin de jornada</p>
              <h3 className="text-white font-black text-xl">Jornada {numero}</h3>
            </div>
            {resultadoMio && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: resultadoMio.bg, border: `1px solid ${resultadoMio.color}40` }}
              >
                <span className="font-black text-xl" style={{ color: resultadoMio.color }}>{resultadoMio.label}</span>
                <div className="text-[10px] leading-tight text-right">
                  {(() => {
                    const r = miResultado;
                    const soyLocal = r.clubLocalId === clubId;
                    return (
                      <>
                        <p className="text-white font-bold">{soyLocal ? r.puntosLocal : r.puntosVisitante} – {soyLocal ? r.puntosVisitante : r.puntosLocal}</p>
                        <p className="text-gray-600">Mi equipo</p>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="section-title mb-2">Todos los resultados</p>
          {resultados.map(r => {
            const esMio = r.clubLocalId === clubId || r.clubVisitanteId === clubId;
            const ganadorLocal = r.puntosLocal > r.puntosVisitante;
            const ganadorVis   = r.puntosVisitante > r.puntosLocal;
            return (
              <div
                key={r.id}
                className="rounded-xl px-3 py-3"
                style={{
                  background: esMio ? 'rgba(232,23,44,0.06)' : '#12121F',
                  border: `1px solid ${esMio ? 'rgba(232,23,44,0.25)' : '#1E1E32'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex-1 text-xs font-bold text-right truncate"
                    style={{ color: ganadorLocal ? '#fff' : '#6B7280' }}
                  >{r.clubLocal.nombre}</span>
                  <div className="flex-shrink-0 flex items-center gap-1 font-black text-sm tabular-nums">
                    <span style={{ color: ganadorLocal ? '#E8172C' : '#fff' }}>{r.puntosLocal}</span>
                    <span className="text-gray-700">–</span>
                    <span style={{ color: ganadorVis ? '#E8172C' : '#fff' }}>{r.puntosVisitante}</span>
                  </div>
                  <span
                    className="flex-1 text-xs font-bold truncate"
                    style={{ color: ganadorVis ? '#fff' : '#6B7280' }}
                  >{r.clubVisitante.nombre}</span>
                </div>
                {r.lesionados?.length > 0 && (
                  <p className="text-[10px] mt-1.5 pl-1" style={{ color: '#F87171' }}>
                    🩹 {r.lesionados.map(l => l.jugadorNombre).join(', ')}
                  </p>
                )}
              </div>
            );
          })}

          {totalLesionados.length > 0 && (
            <div
              className="rounded-xl px-4 py-3 mt-2"
              style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)' }}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] mb-1.5" style={{ color: '#F87171' }}>
                🩹 Lesiones en la jornada ({totalLesionados.length})
              </p>
              <p className="text-xs text-gray-500">{totalLesionados.map(l => l.jugadorNombre).join(' · ')}</p>
            </div>
          )}
        </div>

        {/* Acción */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #1E1E32' }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white uppercase tracking-wider transition-opacity hover:opacity-90"
            style={{ background: '#E8172C' }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pre-match modal ──────────────────────────────────────────────────────────
const ATTRS = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
const calcOvr = jugadores => jugadores.length
  ? Math.round(jugadores.reduce((s, j) => s + ATTRS.reduce((a, k) => a + j[k], 0) / ATTRS.length, 0) / jugadores.length)
  : 0;

function PreMatchModal({ partido, clubId, onSimular, onClose, simLoading }) {
  const [localJug, setLocalJug]   = useState([]);
  const [visitJug, setVisitJug]   = useState([]);
  const [cargando, setCargando]   = useState(true);

  const local     = partido.clubLocal;
  const visitante = partido.clubVisitante;
  const esLocal   = partido.clubLocalId === clubId;

  useEffect(() => {
    Promise.all([getJugadores(local.id), getJugadores(visitante.id)])
      .then(([lj, vj]) => { setLocalJug(lj); setVisitJug(vj); })
      .finally(() => setCargando(false));
  }, []);

  const ovrL = calcOvr(localJug);
  const ovrV = calcOvr(visitJug);
  const total = ovrL + ovrV || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: '#0D0D14', border: '1px solid #1E1E32' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-5"
          style={{
            background: `linear-gradient(105deg, ${local.color1}20 0%, #0D0D14 45%, ${visitante.color1}20 100%)`,
            borderBottom: '1px solid #1E1E32',
          }}
        >
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-gray-700 mb-4">Pre-partido</p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              <ClubShield club={local} size={56} />
              <p className="text-white font-bold text-xs uppercase text-center leading-tight">{local.nombre}</p>
              {esLocal && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black" style={{ background: '#E8172C', color: '#fff' }}>
                  Tu equipo
                </span>
              )}
            </div>
            <span className="font-black text-2xl flex-shrink-0" style={{ color: '#E8172C' }}>VS</span>
            <div className="flex flex-col items-center gap-2 flex-1">
              <ClubShield club={visitante} size={56} />
              <p className="text-white font-bold text-xs uppercase text-center leading-tight">{visitante.nombre}</p>
              {!esLocal && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black" style={{ background: '#E8172C', color: '#fff' }}>
                  Tu equipo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-5 space-y-4">
          {cargando ? (
            <p className="text-gray-700 text-xs text-center animate-pulse uppercase tracking-[0.2em]">Analizando equipos...</p>
          ) : (
            <>
              <div>
                <p className="section-title mb-2">Promedio OVR del plantel</p>
                <div className="flex items-center gap-3">
                  <span className="font-black text-2xl w-10 text-center" style={{ color: local.color1 }}>{ovrL}</span>
                  <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: '#1E1E32' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.round((ovrL / total) * 100)}%`, background: local.color1 }}
                    />
                  </div>
                  <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: '#1E1E32', transform: 'scaleX(-1)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.round((ovrV / total) * 100)}%`, background: visitante.color1 }}
                    />
                  </div>
                  <span className="font-black text-2xl w-10 text-center" style={{ color: visitante.color1 }}>{ovrV}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl py-2.5" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-white font-black">{localJug.length}</p>
                  <p className="text-gray-600 text-[10px]">jugadores</p>
                </div>
                <div className="rounded-xl py-2.5" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-white font-black">{visitJug.length}</p>
                  <p className="text-gray-600 text-[10px]">jugadores</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-gray-500 text-sm font-medium transition-colors hover:text-white"
            style={{ background: '#12121F' }}
          >
            Volver
          </button>
          <button
            onClick={() => { onSimular(partido.id); onClose(); }}
            disabled={simLoading}
            className="py-2.5 rounded-xl font-bold text-sm text-white uppercase tracking-wider disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#E8172C', flex: 2 }}
          >
            {simLoading ? 'Simulando...' : '▶ Simular'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Partido card ──────────────────────────────────────────────────────────────
function PartidoCard({ partido, onSimular, loading, clubId, onPreview }) {
  const local     = partido.clubLocal;
  const visitante = partido.clubVisitante;
  const esNuestro = partido.clubLocalId === clubId || partido.clubVisitanteId === clubId;

  return (
    <div
      className="rounded-xl p-4 transition-all cursor-pointer"
      style={{
        background: esNuestro ? `${local.color1}0A` : '#12121F',
        border: `1px solid ${esNuestro ? local.color1 + '30' : '#1E1E32'}`,
      }}
      onClick={() => !partido.jugado && onPreview && onPreview(partido)}
    >
      <div className="flex items-center gap-3">
        {/* Local */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <ClubShield club={local} size={40} />
          <p className="text-white font-bold text-xs text-center leading-tight truncate w-full">{local.nombre}</p>
        </div>

        {/* Score / vs */}
        <div className="flex-shrink-0 text-center px-2">
          {partido.jugado ? (
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-black tabular-nums"
                style={{ color: partido.puntosLocal > partido.puntosVisitante ? '#E8172C' : '#FFFFFF' }}
              >{partido.puntosLocal}</span>
              <span className="text-gray-700">–</span>
              <span
                className="text-2xl font-black tabular-nums"
                style={{ color: partido.puntosVisitante > partido.puntosLocal ? '#E8172C' : '#FFFFFF' }}
              >{partido.puntosVisitante}</span>
            </div>
          ) : (
            <span className="text-gray-600 font-bold text-xs">Toque para ver</span>
          )}
          {partido.jugado && (
            <p className="text-[10px] text-gray-600 mt-0.5">{partido.triesLocal}T – {partido.triesVisitante}T</p>
          )}
        </div>

        {/* Visitante */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <ClubShield club={visitante} size={40} />
          <p className="text-white font-bold text-xs text-center leading-tight truncate w-full">{visitante.nombre}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Liga ──────────────────────────────────────────────────────────────────
function TabLiga({ clubId }) {
  const [jornadas, setJornadas]     = useState([]);
  const [jornadaActual, setJornadaActual] = useState(null);
  const [partidos, setPartidos]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [simulando, setSimulando]   = useState(false);
  const [loadingPartido, setLoadingPartido] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [resumenOpen, setResumenOpen] = useState(false);
  const [animacion, setAnimacion]   = useState(null);
  const [preMatch, setPreMatch]     = useState(null);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [finalizando, setFinalizando]     = useState(false);
  const [temporadaFinalizada, setTemporadaFinalizada] = useState(null);
  const [copaDisponible, setCopaDisponible] = useState(false);

  const cargarJornada  = async (num) => { setPartidos(await getJornada(num)); setResultados([]); };
  const cargarJornadas = async () => {
    const js = await getJornadas();
    setJornadas(js);
    setCopaDisponible(js.length > 0 && js.every(j => j.jugados === j.total));
    return js;
  };

  useEffect(() => {
    cargarJornadas().then(js => {
      const activa = js.find(j => j.jugados < j.total) ?? js[js.length - 1];
      setJornadaActual(activa?.numero ?? 1);
      if (activa) cargarJornada(activa.numero);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (jornadaActual != null) cargarJornada(jornadaActual); }, [jornadaActual]);

  const handleSimularJornada = async () => {
    setSimulando(true);
    try {
      const res = await simularJornada(jornadaActual);
      setResultados(res);
      setResumenOpen(true);
      await cargarJornada(jornadaActual);
      await cargarJornadas();
    } catch (e) { alert(e.response?.data?.error ?? 'Error'); } finally { setSimulando(false); }
  };

  const handleSimularPartido = async (id) => {
    setLoadingPartido(id);
    try {
      const res = await simularPartido(id);
      const p   = partidos.find(p => p.id === id);
      setAnimacion({ resultado: res, partido: { ...p, ...res } });
      setPartidos(prev => prev.map(p => p.id === id ? { ...p, ...res, jugado: true } : p));
    } catch (e) { alert(e.response?.data?.error ?? 'Error'); } finally { setLoadingPartido(null); }
  };

  const handleFinalizar = async () => {
    setFinalizando(true);
    try {
      const res = await finalizarTemporada();
      setShowFinalizar(false);

      // Cargamos juveniles propios y próxima jornada para la pantalla de pretemporada
      const [jugadoresMios, js] = await Promise.all([getJugadores(clubId), cargarJornadas()]);
      const misJuveniles = jugadoresMios.filter(j => j.edad <= 20).slice(0, 4);
      const primera = js[0];
      let proximaJornada = [];
      if (primera) {
        proximaJornada = await getJornada(primera.numero);
        setJornadaActual(primera.numero);
        setPartidos(proximaJornada);
        setResultados([]);
      }

      setTemporadaFinalizada({ ...res, misJuveniles, proximaJornada });
    } catch (e) { alert(e.response?.data?.error ?? 'Error'); } finally { setFinalizando(false); }
  };

  if (loading) return <div className="text-gray-600 animate-pulse text-center py-16 text-xs uppercase tracking-[0.25em]">Cargando...</div>;

  const jornadaInfo   = jornadas.find(j => j.numero === jornadaActual);
  const todosJugados  = jornadaInfo?.jugados === jornadaInfo?.total;
  const temporadaCompleta = jornadas.length > 0 && jornadas.every(j => j.jugados === j.total);

  return (
    <div className="space-y-4">

      {/* ── Nueva temporada iniciada ── */}
      {temporadaFinalizada && (
        <NuevaTemporadaScreen data={temporadaFinalizada} onClose={() => setTemporadaFinalizada(null)} />
      )}

      {/* ── Copa disponible ── */}
      {copaDisponible && !temporadaCompleta && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(232,192,0,0.07)', border: '1px solid rgba(232,192,0,0.25)' }}
        >
          <span className="text-xl">🏆</span>
          <p className="flex-1 text-xs font-bold text-yellow-300">Liga terminada. ¡Jugá los Playoffs en la pestaña Copa!</p>
        </div>
      )}

      {/* ── Selector de jornadas ── */}
      <div className="flex gap-1.5 flex-wrap">
        {jornadas.map(j => {
          const completa = j.jugados === j.total;
          const activa   = jornadaActual === j.numero;
          return (
            <button
              key={j.numero}
              onClick={() => setJornadaActual(j.numero)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activa ? '#E8172C' : completa ? '#0D1F18' : '#12121F',
                color: activa ? '#fff' : completa ? '#2D6A4F' : '#9CA3AF',
                border: `1px solid ${activa ? '#E8172C' : completa ? '#2D6A4F40' : '#1E1E32'}`,
              }}
            >
              J{j.numero}{completa && !activa && ' ✓'}
            </button>
          );
        })}
      </div>

      {/* ── Header jornada ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-xl">Jornada {jornadaActual}</h2>
          {jornadaInfo && (
            <p className="text-gray-600 text-xs mt-0.5">{jornadaInfo.jugados}/{jornadaInfo.total} partidos jugados</p>
          )}
        </div>
        {!todosJugados ? (
          <button
            onClick={handleSimularJornada}
            disabled={simulando}
            className="px-5 py-2 rounded-xl font-bold text-sm text-white uppercase tracking-wider disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#E8172C' }}
          >
            {simulando ? '⏳ Simulando...' : '▶ Simular Jornada'}
          </button>
        ) : (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg"
            style={{ background: '#0D1F18', color: '#2D6A4F', border: '1px solid #2D6A4F40' }}
          >
            Completada ✓
          </span>
        )}
      </div>

      {/* ── Partidos ── */}
      <div className="space-y-3">
        {partidos.map(p => (
          <PartidoCard
            key={p.id}
            partido={p}
            clubId={clubId}
            onSimular={handleSimularPartido}
            loading={loadingPartido === p.id}
            onPreview={setPreMatch}
          />
        ))}
      </div>

      {/* ── Indicador de jornada simulada ── */}
      {resultados.length > 0 && !resumenOpen && (
        <button
          onClick={() => setResumenOpen(true)}
          className="w-full rounded-xl px-4 py-3 text-left flex items-center gap-3 transition-opacity hover:opacity-80"
          style={{ background: '#12121F', border: '1px solid #2D6A4F40' }}
        >
          <span className="text-sm">📋</span>
          <span className="text-xs font-bold" style={{ color: '#2D6A4F' }}>Ver resumen de la jornada</span>
          <span className="ml-auto text-gray-600 text-xs">→</span>
        </button>
      )}

      {/* ── Finalizar temporada ── */}
      {temporadaCompleta && !temporadaFinalizada && (
        <div
          className="rounded-xl p-4 text-center space-y-3"
          style={{ background: 'rgba(232,23,44,0.06)', border: '1px solid rgba(232,23,44,0.2)' }}
        >
          <p className="text-white font-bold text-sm">Temporada completa (liga + copa)</p>
          <p className="text-gray-500 text-xs">Podés iniciar la siguiente temporada cuando estés listo.</p>
          <button
            onClick={() => setShowFinalizar(true)}
            className="px-8 py-2.5 rounded-xl font-bold text-sm text-white uppercase tracking-wider transition-opacity hover:opacity-90"
            style={{ background: '#E8172C' }}
          >
            Finalizar Temporada
          </button>
        </div>
      )}

      {preMatch && (
        <PreMatchModal
          partido={preMatch}
          clubId={clubId}
          onSimular={handleSimularPartido}
          onClose={() => setPreMatch(null)}
          simLoading={loadingPartido === preMatch.id}
        />
      )}
      {animacion && (
        <MatchAnimation
          resultado={animacion.resultado}
          partido={animacion.partido}
          onClose={async () => { setAnimacion(null); await cargarJornadas(); }}
        />
      )}
      {showFinalizar && (
        <FinalizarModal onConfirm={handleFinalizar} onClose={() => setShowFinalizar(false)} loading={finalizando} />
      )}
      {resumenOpen && resultados.length > 0 && (
        <ResumenJornada
          resultados={resultados}
          numero={jornadaActual}
          clubId={clubId}
          onClose={() => setResumenOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Tab Copa ──────────────────────────────────────────────────────────────────
function TabCopa({ clubId }) {
  const [copa, setCopa]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [accion, setAccion]         = useState(null);
  const [animacion, setAnimacion]   = useState(null);
  const [preMatch, setPreMatch]     = useState(null);
  const [loadingPartido, setLoadingPartido] = useState(null);

  const cargar = async () => { const data = await getCopa(); setCopa(data); };

  useEffect(() => { cargar().finally(() => setLoading(false)); }, []);

  const jornadas      = copa?.partidos ?? [];
  const semis         = jornadas.filter(p => p.tipo === 'semifinal');
  const final         = jornadas.find(p => p.tipo === 'final');
  const ambasSemis    = semis.length === 2 && semis.every(s => s.jugado);
  const copaIniciada  = semis.length > 0;

  const handleIniciar     = async () => {
    setAccion('iniciando');
    try { await iniciarCopa(); await cargar(); }
    catch (e) { alert(e.response?.data?.error ?? 'Error'); }
    finally { setAccion(null); }
  };

  const handleCrearFinal  = async () => {
    setAccion('final');
    try { await crearFinal(); await cargar(); }
    catch (e) { alert(e.response?.data?.error ?? 'Error'); }
    finally { setAccion(null); }
  };

  const handleSimular = async (id) => {
    setLoadingPartido(id);
    try {
      const res = await simularPartido(id);
      const p   = jornadas.find(j => j.id === id);
      setAnimacion({ resultado: { ...res, esCopa: true, tipo: p?.tipo }, partido: { ...p, ...res } });
      await cargar();
    } catch (e) { alert(e.response?.data?.error ?? 'Error'); }
    finally { setLoadingPartido(null); }
  };

  if (loading) return <div className="text-gray-600 animate-pulse text-center py-16 text-xs uppercase tracking-[0.25em]">Cargando...</div>;

  const campeon = copa?.temporada?.campeonNombre;

  return (
    <div className="space-y-4">
      {/* Campeón */}
      {campeon && (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(232,192,0,0.08)', border: '1px solid rgba(232,192,0,0.3)' }}
        >
          <p className="text-5xl mb-3">🏆</p>
          <p className="font-black text-2xl" style={{ color: '#E8C000' }}>{campeon}</p>
          <p className="text-gray-400 text-sm mt-1">Campeón del Super Rugby Americas {copa.temporada.anio}</p>
        </div>
      )}

      {/* Iniciar playoffs */}
      {!copaIniciada && !campeon && (
        <div className="rounded-xl p-6 text-center space-y-4" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
          <p className="text-5xl">🏆</p>
          <div>
            <p className="text-white font-black text-lg uppercase tracking-tight">Playoffs Super Rugby Americas</p>
            <p className="text-gray-500 text-sm mt-1">Los 4 mejores de la tabla juegan semifinales y final</p>
          </div>
          <button
            onClick={handleIniciar}
            disabled={accion === 'iniciando'}
            className="px-8 py-2.5 rounded-xl font-bold text-sm text-white uppercase tracking-wider disabled:opacity-50"
            style={{ background: '#E8172C' }}
          >
            {accion === 'iniciando' ? 'Iniciando...' : 'Iniciar Playoffs'}
          </button>
        </div>
      )}

      {/* Semifinales */}
      {semis.length > 0 && (
        <div className="space-y-3">
          <p className="section-title">Semifinales</p>
          {semis.map(p => (
            <PartidoCard key={p.id} partido={p} clubId={clubId} onSimular={handleSimular} loading={loadingPartido === p.id} onPreview={setPreMatch} />
          ))}
        </div>
      )}

      {/* Crear final */}
      {ambasSemis && !final && (
        <button
          onClick={handleCrearFinal}
          disabled={accion === 'final'}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-white uppercase tracking-wider disabled:opacity-50"
          style={{ background: '#E8C000', color: '#000' }}
        >
          {accion === 'final' ? '...' : '🏆 Crear Final'}
        </button>
      )}

      {/* Final */}
      {final && (
        <div className="space-y-3">
          <p className="section-title" style={{ color: '#E8C000' }}>🏆 Gran Final</p>
          <PartidoCard partido={final} clubId={clubId} onSimular={handleSimular} loading={loadingPartido === final.id} onPreview={setPreMatch} />
        </div>
      )}

      {preMatch && (
        <PreMatchModal
          partido={preMatch}
          clubId={clubId}
          onSimular={handleSimular}
          onClose={() => setPreMatch(null)}
          simLoading={loadingPartido === preMatch.id}
        />
      )}
      {animacion && (
        <MatchAnimation resultado={animacion.resultado} partido={animacion.partido} onClose={async () => { setAnimacion(null); await cargar(); }} />
      )}
    </div>
  );
}

// ─── Tab Fixture ───────────────────────────────────────────────────────────────
function TabFixture({ clubId }) {
  const [jornadas, setJornadas]   = useState([]);
  const [detalles, setDetalles]   = useState({});
  const [expandida, setExpandida] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getJornadas().then(js => {
      setJornadas(js);
      const activa = js.find(j => j.jugados < j.total) ?? js[js.length - 1];
      if (activa) setExpandida(activa.numero);
    }).finally(() => setLoading(false));
  }, []);

  const cargarDetalle = async (num) => {
    if (detalles[num]) return;
    const ps = await getJornada(num);
    setDetalles(prev => ({ ...prev, [num]: ps }));
  };

  const toggle = (num) => {
    if (expandida === num) { setExpandida(null); return; }
    setExpandida(num);
    cargarDetalle(num);
  };

  if (loading) return <div className="text-gray-600 animate-pulse text-center py-16 text-xs uppercase tracking-[0.25em]">Cargando...</div>;

  return (
    <div className="space-y-2">
      {jornadas.map(j => {
        const completa = j.jugados === j.total;
        const abierta  = expandida === j.numero;
        return (
          <div key={j.numero} className="rounded-xl overflow-hidden" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
            <button onClick={() => toggle(j.numero)} className="w-full flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white text-sm">Jornada {j.numero}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: completa ? '#0D1F18' : '#1E1A00',
                    color: completa ? '#2D6A4F' : '#A0800A',
                  }}
                >
                  {j.jugados}/{j.total}
                </span>
              </div>
              <span className="text-gray-600 text-xs">{abierta ? '▲' : '▼'}</span>
            </button>

            {abierta && (
              <div className="px-4 pb-3 pt-1 space-y-1.5" style={{ borderTop: '1px solid #1E1E32' }}>
                {detalles[j.numero] ? detalles[j.numero].map(p => {
                  const esNuestro = p.clubLocalId === clubId || p.clubVisitanteId === clubId;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg"
                      style={{ background: esNuestro ? 'rgba(232,23,44,0.06)' : 'transparent' }}
                    >
                      <div className="flex-1 text-right truncate" style={{ color: esNuestro ? '#fff' : '#9CA3AF' }}>
                        {p.clubLocal.nombre}
                      </div>
                      <div className="text-center flex-shrink-0 w-20">
                        {p.jugado
                          ? <span className="font-black text-white">{p.puntosLocal} – {p.puntosVisitante}</span>
                          : <span className="text-gray-700">vs</span>}
                      </div>
                      <div className="flex-1 truncate" style={{ color: esNuestro ? '#fff' : '#9CA3AF' }}>
                        {p.clubVisitante.nombre}
                      </div>
                    </div>
                  );
                }) : <p className="text-gray-600 text-xs text-center py-3">Cargando...</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Jornada({ clubId }) {
  const [tab, setTab] = useState('liga');

  const tabs = [
    { id: 'liga',    label: 'Liga' },
    { id: 'copa',    label: 'Copa' },
    { id: 'fixture', label: 'Fixture' },
  ];

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1" style={{ borderBottom: '1px solid #1E1E32', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-5 py-2.5 text-sm font-bold transition-colors"
            style={{ color: tab === t.id ? '#FFFFFF' : '#4B5563' }}
          >
            {t.label}
            {tab === t.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                style={{ background: '#E8172C' }}
              />
            )}
          </button>
        ))}
      </div>

      {tab === 'liga'    && <TabLiga clubId={clubId} />}
      {tab === 'copa'    && <TabCopa clubId={clubId} />}
      {tab === 'fixture' && <TabFixture clubId={clubId} />}
    </div>
  );
}
