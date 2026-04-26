import { useEffect, useState } from 'react';
import { getClub, getTabla, getJornadas } from '../api/client.js';

function StatItem({ label, value, sub }) {
  return (
    <div className="card text-center">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ clubId }) {
  const [club, setClub] = useState(null);
  const [tablaData, setTablaData] = useState(null);
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClub(clubId), getTabla(), getJornadas()])
      .then(([c, t, j]) => { setClub(c); setTablaData(t); setJornadas(j); })
      .finally(() => setLoading(false));
  }, [clubId]);

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando...</div>;
  if (!club) return null;

  const miPosicion = tablaData?.tabla.findIndex(r => r.club.id === clubId) ?? -1;
  const miStats = tablaData?.tabla[miPosicion];
  const jornadaActual = jornadas.find(j => j.jugados < j.total) ?? jornadas[jornadas.length - 1];

  const formatPesos = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{club.nombre}</h1>
          <p className="text-gray-400 text-sm">{club.estadio} · {club.ciudad}</p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-sm font-bold text-white"
          style={{ background: club.color1 }}
        >
          #{miPosicion + 1} en la tabla
        </div>
      </div>

      {/* Stats */}
      {miStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatItem label="Puntos" value={miStats.puntos} />
          <StatItem label="Partidos" value={`${miStats.pg}G ${miStats.pe}E ${miStats.pp}P`} sub={`${miStats.pj} jugados`} />
          <StatItem label="Diferencia" value={miStats.dif > 0 ? `+${miStats.dif}` : miStats.dif} sub={`${miStats.pf} a favor`} />
          <StatItem label="Presupuesto" value={formatPesos(club.presupuesto)} sub={`Reputación ${club.reputacion}`} />
        </div>
      )}

      {/* Jornada actual */}
      {jornadaActual && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Jornada {jornadaActual.numero}</h2>
            <span className={`badge ${jornadaActual.jugados === jornadaActual.total ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
              {jornadaActual.jugados}/{jornadaActual.total} jugados
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            {jornadaActual.jugados < jornadaActual.total
              ? `Quedan ${jornadaActual.total - jornadaActual.jugados} partido(s) por jugar.`
              : 'Jornada completada.'}
          </p>
        </div>
      )}

      {/* Top 4 tabla */}
      {tablaData && (
        <div className="card">
          <h2 className="font-bold text-white mb-3">Tabla de Posiciones</h2>
          <div className="space-y-2">
            {tablaData.tabla.slice(0, 4).map((row, i) => (
              <div
                key={row.club.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${row.club.id === clubId ? 'bg-rugby-green/20 border border-rugby-green/40' : 'bg-gray-800/50'}`}
              >
                <span className={`w-6 text-center font-bold text-sm ${i === 0 ? 'text-rugby-gold' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.club.color1 }} />
                <span className="flex-1 text-sm font-medium text-white truncate">{row.club.nombre}</span>
                <span className="text-sm font-bold text-rugby-green">{row.puntos} pts</span>
              </div>
            ))}
            {tablaData.tabla.length > 4 && (
              <p className="text-xs text-gray-600 text-center pt-1">
                Ver tabla completa →
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
