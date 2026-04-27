import { useEffect, useState } from 'react';
import { getClubs } from '../api/client.js';

export default function SeleccionClub({ onSelect }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClubs()
      .then(setClubs)
      .catch(() => setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🏉</div>
        <h1 className="text-4xl font-bold text-white">Rugby Manager</h1>
        <p className="text-rugby-green font-semibold text-lg mt-1 tracking-widest uppercase">Argentina</p>
        <p className="text-gray-400 mt-3">Seleccioná tu club para comenzar</p>
      </div>

      {loading && <p className="text-gray-500 animate-pulse">Cargando clubes...</p>}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm max-w-md text-center">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl w-full">
          {clubs.map(club => (
            <button
              key={club.id}
              onClick={() => onSelect(club.id)}
              className="group bg-gray-900 border border-gray-800 hover:border-rugby-green rounded-xl p-4 text-left transition-all hover:scale-105"
            >
              <div
                className="w-full h-2 rounded-full mb-3"
                style={{ background: `linear-gradient(90deg, ${club.color1}, ${club.color2})` }}
              />
              <p className="text-white font-bold text-sm group-hover:text-rugby-green transition-colors">
                {club.nombre}
              </p>
              <p className="text-gray-500 text-xs mt-1">{club.ciudad}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-rugby-gold text-xs">★</span>
                <span className="text-xs text-gray-400">{club.reputacion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-gray-700 text-xs mt-10">Super Rugby Americas 2025</p>
    </div>
  );
}
