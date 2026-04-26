import { useEffect, useState } from 'react';
import { getTabla } from '../api/client.js';

export default function Tabla({ clubId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTabla().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 animate-pulse py-20 text-center">Cargando tabla...</div>;
  if (!data) return null;

  const { temporada, tabla } = data;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Tabla de Posiciones</h1>
        <p className="text-gray-400 text-sm mt-1">{temporada.nombre}</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
              <th className="pb-3 text-left w-8">#</th>
              <th className="pb-3 text-left">Club</th>
              <th className="pb-3 text-center">PJ</th>
              <th className="pb-3 text-center">PG</th>
              <th className="pb-3 text-center">PE</th>
              <th className="pb-3 text-center">PP</th>
              <th className="pb-3 text-center">PF</th>
              <th className="pb-3 text-center">PC</th>
              <th className="pb-3 text-center">DIF</th>
              <th className="pb-3 text-center">BT</th>
              <th className="pb-3 text-center">BD</th>
              <th className="pb-3 text-center font-bold text-white">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {tabla.map((row, i) => {
              const esMiClub = row.club.id === clubId;
              return (
                <tr
                  key={row.club.id}
                  className={`transition-colors ${esMiClub ? 'bg-rugby-green/10' : 'hover:bg-gray-800/40'}`}
                >
                  <td className="py-3 pl-2">
                    <span className={`font-bold ${i === 0 ? 'text-rugby-gold' : i <= 3 ? 'text-gray-300' : 'text-gray-600'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: row.club.color1 }} />
                      <span className={`font-medium ${esMiClub ? 'text-rugby-green' : 'text-white'}`}>
                        {row.club.nombre}
                      </span>
                      {esMiClub && <span className="text-xs badge bg-rugby-green/20 text-rugby-green">Mi club</span>}
                    </div>
                  </td>
                  <td className="py-3 text-center text-gray-400">{row.pj}</td>
                  <td className="py-3 text-center text-green-400 font-medium">{row.pg}</td>
                  <td className="py-3 text-center text-yellow-400 font-medium">{row.pe}</td>
                  <td className="py-3 text-center text-red-400 font-medium">{row.pp}</td>
                  <td className="py-3 text-center text-gray-300">{row.pf}</td>
                  <td className="py-3 text-center text-gray-500">{row.pc}</td>
                  <td className={`py-3 text-center font-medium ${row.dif > 0 ? 'text-green-400' : row.dif < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {row.dif > 0 ? `+${row.dif}` : row.dif}
                  </td>
                  <td className="py-3 text-center text-gray-500">{row.bonusTry}</td>
                  <td className="py-3 text-center text-gray-500">{row.bonusDerrota}</td>
                  <td className="py-3 text-center font-black text-lg text-rugby-green">{row.puntos}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="flex gap-6 text-xs text-gray-600">
        <span><strong className="text-gray-500">BT</strong> Bonus por 4+ tries</span>
        <span><strong className="text-gray-500">BD</strong> Bonus por derrota ≤7 pts</span>
        <span><strong className="text-gray-500">PTS</strong> Victoria=4, Empate=2, Derrota=0</span>
      </div>
    </div>
  );
}
