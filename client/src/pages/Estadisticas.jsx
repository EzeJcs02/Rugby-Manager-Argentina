import { useEffect, useState } from 'react';
import { getGoleadores, getHistorial } from '../api/client.js';

function ResultBadge({ resultado }) {
  const styles = {
    V: { background: '#0D1F18', color: '#4ADE80', border: '1px solid #2D6A4F40' },
    E: { background: '#1A1A2E', color: '#9CA3AF', border: '1px solid #2A2A3E' },
    D: { background: '#1F0D0D', color: '#F87171', border: '1px solid rgba(232,23,44,0.3)' },
  };
  return (
    <span className="text-[11px] font-black px-2 py-0.5 rounded-md" style={styles[resultado]}>
      {resultado}
    </span>
  );
}

function MedalIcon({ pos }) {
  if (pos === 0) return <span style={{ color: '#E8C000', fontSize: 18 }}>🥇</span>;
  if (pos === 1) return <span style={{ color: '#9CA3AF', fontSize: 18 }}>🥈</span>;
  if (pos === 2) return <span style={{ color: '#CD7F32', fontSize: 18 }}>🥉</span>;
  return <span className="text-gray-600 font-black text-sm w-6 text-center">{pos + 1}</span>;
}

export default function Estadisticas({ clubId }) {
  const [goleadores, setGoleadores] = useState([]);
  const [historial, setHistorial]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('goleadores');

  useEffect(() => {
    Promise.all([getGoleadores(), getHistorial(clubId)])
      .then(([g, h]) => { setGoleadores(g); setHistorial(h); })
      .finally(() => setLoading(false));
  }, [clubId]);

  if (loading) return (
    <div className="text-gray-600 animate-pulse py-20 text-center text-xs uppercase tracking-[0.25em]">Cargando...</div>
  );

  // ── Stats calculadas ──
  const stats = historial.reduce(
    (acc, p) => ({
      pj: acc.pj + 1,
      pg: acc.pg + (p.resultado === 'V' ? 1 : 0),
      pe: acc.pe + (p.resultado === 'E' ? 1 : 0),
      pp: acc.pp + (p.resultado === 'D' ? 1 : 0),
      pf: acc.pf + p.propios,
      pc: acc.pc + p.contrarios,
      tries: acc.tries + p.triesPropios,
    }),
    { pj: 0, pg: 0, pe: 0, pp: 0, pf: 0, pc: 0, tries: 0 }
  );

  const avgPts = stats.pj > 0 ? (stats.pf / stats.pj).toFixed(1) : '—';
  const winPct = stats.pj > 0 ? Math.round((stats.pg / stats.pj) * 100) : 0;

  const mejorVictoria = historial
    .filter(p => p.resultado === 'V')
    .sort((a, b) => (b.propios - b.contrarios) - (a.propios - a.contrarios))[0];

  const peorDerrota = historial
    .filter(p => p.resultado === 'D')
    .sort((a, b) => (a.propios - a.contrarios) - (b.propios - b.contrarios))[0];

  // Form: últimos 5 resultados
  const forma = historial.slice(-5);

  const tabs = [
    { id: 'goleadores', label: 'Goleadores' },
    { id: 'historial',  label: 'Mis partidos' },
  ];

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-0" style={{ borderBottom: '1px solid #1E1E32' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-5 py-2.5 text-sm font-bold transition-colors"
            style={{ color: tab === t.id ? '#FFFFFF' : '#4B5563' }}
          >
            {t.label}
            {tab === t.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full" style={{ background: '#E8172C' }} />
            )}
          </button>
        ))}
      </div>

      {/* ─── Goleadores ─── */}
      {tab === 'goleadores' && (
        <div className="space-y-4">
          {goleadores.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
              <p className="text-gray-500 text-sm">No hay datos. Jugá al menos un partido.</p>
            </div>
          ) : (
            <>
              {/* Podio top 3 */}
              {goleadores.length >= 3 && (
                <div className="grid grid-cols-3 gap-3">
                  {goleadores.slice(0, 3).map((g, i) => (
                    <div
                      key={g.jugadorId}
                      className="rounded-xl p-3 text-center"
                      style={{
                        background: i === 0 ? 'rgba(232,192,0,0.07)' : '#12121F',
                        border: i === 0 ? '1px solid rgba(232,192,0,0.25)' : '1px solid #1E1E32',
                      }}
                    >
                      <MedalIcon pos={i} />
                      <p className="text-white font-bold text-xs mt-1.5 leading-tight">{g.nombre}</p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.clubColor }} />
                        <p className="text-gray-600 text-[10px] truncate">{g.clubNombre}</p>
                      </div>
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid #1E1E32' }}>
                        <p className="font-black text-xl" style={{ color: i === 0 ? '#E8C000' : '#FFFFFF' }}>{g.puntos}</p>
                        <p className="text-gray-600 text-[10px]">puntos · {g.tries}T</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista completa */}
              <div className="rounded-xl overflow-hidden" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                <div className="grid grid-cols-12 text-[10px] text-gray-600 uppercase tracking-wider px-4 py-2.5" style={{ borderBottom: '1px solid #1E1E32' }}>
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-5">Jugador</span>
                  <span className="col-span-2 text-center">Tries</span>
                  <span className="col-span-2 text-center">Pen.</span>
                  <span className="col-span-2 text-center">Pts</span>
                </div>
                <div className="divide-y divide-gray-800/30">
                  {goleadores.map((g, i) => (
                    <div
                      key={g.jugadorId}
                      className="grid grid-cols-12 items-center py-2.5 px-4 transition-colors"
                      style={{ background: g.clubId === clubId ? 'rgba(232,23,44,0.04)' : 'transparent' }}
                    >
                      <span className="col-span-1 text-center">
                        <MedalIcon pos={i} />
                      </span>
                      <div className="col-span-5">
                        <p className="text-sm font-medium text-white">{g.nombre}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.clubColor }} />
                          <p className="text-[10px] text-gray-600">{g.clubNombre}</p>
                        </div>
                      </div>
                      <span className="col-span-2 text-center font-bold text-sm" style={{ color: '#4ADE80' }}>{g.tries}</span>
                      <span className="col-span-2 text-center text-xs text-gray-500">{g.penales}</span>
                      <span className="col-span-2 text-center font-black text-white">{g.puntos}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Mis partidos ─── */}
      {tab === 'historial' && (
        <div className="space-y-4">
          {historial.length > 0 && (
            <>
              {/* Stats rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl p-4 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-2xl font-black" style={{ color: '#4ADE80' }}>{stats.pg}</p>
                  <p className="text-gray-600 text-xs mt-0.5 uppercase tracking-wide">Victorias</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-2xl font-black text-white">{stats.pe}</p>
                  <p className="text-gray-600 text-xs mt-0.5 uppercase tracking-wide">Empates</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-2xl font-black" style={{ color: '#F87171' }}>{stats.pp}</p>
                  <p className="text-gray-600 text-xs mt-0.5 uppercase tracking-wide">Derrotas</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-2xl font-black text-white">{winPct}%</p>
                  <p className="text-gray-600 text-xs mt-0.5 uppercase tracking-wide">Efectividad</p>
                </div>
              </div>

              {/* Stats de puntuación */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-4 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-xl font-black text-white">{avgPts}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5 uppercase tracking-wide">Pts/partido</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-xl font-black text-white">{stats.tries}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5 uppercase tracking-wide">Tries</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="text-xl font-black" style={{ color: stats.pf - stats.pc >= 0 ? '#4ADE80' : '#F87171' }}>
                    {stats.pf - stats.pc > 0 ? '+' : ''}{stats.pf - stats.pc}
                  </p>
                  <p className="text-gray-600 text-[10px] mt-0.5 uppercase tracking-wide">Diferencia</p>
                </div>
              </div>

              {/* Forma reciente */}
              {forma.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                  <p className="section-title mb-3">Forma reciente</p>
                  <div className="flex gap-2">
                    {forma.map((p, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <ResultBadge resultado={p.resultado} />
                        <p className="text-[10px] text-gray-600 text-center truncate w-full">{p.rival.nombre}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mejor/Peor resultado */}
              {(mejorVictoria || peorDerrota) && (
                <div className="grid grid-cols-2 gap-3">
                  {mejorVictoria && (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)' }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#4ADE80' }}>Mejor victoria</p>
                      <p className="text-white font-black text-lg">{mejorVictoria.propios} – {mejorVictoria.contrarios}</p>
                      <p className="text-gray-500 text-xs">vs {mejorVictoria.rival.nombre}</p>
                    </div>
                  )}
                  {peorDerrota && (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#F87171' }}>Peor derrota</p>
                      <p className="text-white font-black text-lg">{peorDerrota.propios} – {peorDerrota.contrarios}</p>
                      <p className="text-gray-500 text-xs">vs {peorDerrota.rival.nombre}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Lista de partidos */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
            {historial.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No hay partidos jugados todavía.</p>
            ) : (
              <div className="divide-y divide-gray-800/30">
                {historial.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-[10px] text-gray-700 font-mono w-6 flex-shrink-0">J{p.jornada}</span>
                    <ResultBadge resultado={p.resultado} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-600">{p.esLocal ? 'vs' : 'en'}</span>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.rival.color1 }} />
                        <p className="text-sm font-medium text-white truncate">{p.rival.nombre}</p>
                      </div>
                      <p className="text-[10px] text-gray-600">{p.triesPropios}T · {p.triesContrarios}T recibidos</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-black text-sm"
                        style={{ color: p.resultado === 'V' ? '#4ADE80' : p.resultado === 'E' ? '#9CA3AF' : '#F87171' }}
                      >
                        {p.propios} – {p.contrarios}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
