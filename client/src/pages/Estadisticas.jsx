import { useEffect, useState } from 'react';
import { getGoleadores, getHistorial } from '../api/client.js';

function ResultBadge({ resultado }) {
  const map = { V: 'bg-green-900 text-green-300', E: 'bg-gray-700 text-gray-300', D: 'bg-red-900 text-red-300' };
  return <span className={`badge font-bold ${map[resultado]}`}>{resultado}</span>;
}

export default function Estadisticas({ clubId }) {
  const [goleadores, setGoleadores] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('goleadores');

  useEffect(() => {
    Promise.all([getGoleadores(), getHistorial(clubId)])
      .then(([g, h]) => { setGoleadores(g); setHistorial(h); })
      .finally(() => setLoading(false));
  }, [clubId]);

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando...</div>;

  const stats = historial.reduce(
    (acc, p) => ({
      pj: acc.pj + 1,
      pg: acc.pg + (p.resultado === 'V' ? 1 : 0),
      pe: acc.pe + (p.resultado === 'E' ? 1 : 0),
      pp: acc.pp + (p.resultado === 'D' ? 1 : 0),
      pf: acc.pf + p.propios,
      pc: acc.pc + p.contrarios,
    }),
    { pj: 0, pg: 0, pe: 0, pp: 0, pf: 0, pc: 0 }
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Estadísticas</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ id: 'goleadores', label: '🏆 Goleadores' }, { id: 'historial', label: '📅 Mis partidos' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.id ? 'bg-rugby-green text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Goleadores ─── */}
      {tab === 'goleadores' && (
        <div className="card">
          {goleadores.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No hay datos. Jugá al menos un partido.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-12 text-xs text-gray-600 uppercase px-2 pb-2 border-b border-gray-800">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-5">Jugador</span>
                <span className="col-span-2 text-center">Tries</span>
                <span className="col-span-2 text-center">Penales</span>
                <span className="col-span-2 text-center">Puntos</span>
              </div>
              <div className="divide-y divide-gray-800/50">
                {goleadores.map((g, i) => (
                  <div
                    key={g.jugadorId}
                    className={`grid grid-cols-12 items-center py-2.5 px-2 ${g.clubId === clubId ? 'bg-rugby-green/10' : ''}`}
                  >
                    <span className={`col-span-1 text-center font-bold text-sm
                      ${i === 0 ? 'text-rugby-gold' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <div className="col-span-5">
                      <p className="text-sm font-medium text-white">{g.nombre}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.clubColor }} />
                        <p className="text-xs text-gray-500">{g.clubNombre}</p>
                      </div>
                    </div>
                    <span className="col-span-2 text-center font-bold text-rugby-green">{g.tries}</span>
                    <span className="col-span-2 text-center text-gray-400">{g.penales}</span>
                    <span className="col-span-2 text-center font-bold text-white">{g.puntos}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Historial propio ─── */}
      {tab === 'historial' && (
        <div className="space-y-4">
          {/* Resumen global */}
          {historial.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-bold text-white">{stats.pg}</p>
                <p className="text-xs text-green-400 mt-1">Victorias</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-white">{stats.pe}</p>
                <p className="text-xs text-gray-400 mt-1">Empates</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-white">{stats.pp}</p>
                <p className="text-xs text-red-400 mt-1">Derrotas</p>
              </div>
              <div className="card text-center col-span-3">
                <p className="text-lg font-bold text-white">{stats.pf} – {stats.pc}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Diferencia <span className={stats.pf - stats.pc >= 0 ? 'text-rugby-green' : 'text-red-400'}>
                    {stats.pf - stats.pc > 0 ? '+' : ''}{stats.pf - stats.pc}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="card">
            {historial.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No hay partidos jugados todavía.
              </p>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {historial.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-3 px-2">
                    <span className="text-xs text-gray-600 font-mono w-5">J{p.jornada}</span>
                    <ResultBadge resultado={p.resultado} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{p.esLocal ? 'vs' : 'en'}</span>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.rival.color1 }} />
                        <p className="text-sm font-medium text-white truncate">{p.rival.nombre}</p>
                      </div>
                      <p className="text-xs text-gray-600">{p.triesPropios}T anotados · {p.triesContrarios}T recibidos</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${p.resultado === 'V' ? 'text-rugby-green' : p.resultado === 'E' ? 'text-gray-300' : 'text-red-400'}`}>
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
