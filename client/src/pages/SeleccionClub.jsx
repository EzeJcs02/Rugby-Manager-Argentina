import { useEffect, useState } from 'react';
import { getClubs } from '../api/client.js';

const FLAGS = {
  'Argentina': '🇦🇷',
  'Uruguay':   '🇺🇾',
  'Chile':     '🇨🇱',
  'Paraguay':  '🇵🇾',
  'Brasil':    '🇧🇷',
};

function isLight(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return (r*299+g*587+b*114)/1000 > 128;
  } catch { return false; }
}

function getAbbr(nombre) {
  const clean = nombre.replace(' XV','').replace(' Rugby','').trim();
  const words = clean.split(' ');
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.slice(0,3).toUpperCase();
}

function Shield({ club, size = 72 }) {
  const abbr = getAbbr(club.nombre);
  const textColor = isLight(club.color1) ? '#111' : '#fff';
  const border = club.color2 === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : club.color2;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(145deg, ${club.color1} 40%, ${club.color2 === '#FFFFFF' ? club.color1+'AA' : club.color2})`,
      border: `3px solid ${border}`,
      boxShadow: `0 8px 32px ${club.color1}60`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.27, fontWeight: 900, color: textColor,
      letterSpacing: '-0.03em', userSelect: 'none', flexShrink: 0,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}>
      {abbr}
    </div>
  );
}

export default function SeleccionClub({ onSelect }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    getClubs()
      .then(setClubs)
      .catch(() => setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #1A0A0E 0%, #0D0D14 50%, #080810 100%)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-12 select-none">
        <p
          className="text-[11px] font-black uppercase tracking-[0.35em] mb-3"
          style={{ color: '#E8172C' }}
        >
          ● Super Rugby Americas ●
        </p>
        <h1 className="text-5xl sm:text-6xl font-black text-white uppercase leading-none tracking-tight">
          Rugby
        </h1>
        <h1 className="text-5xl sm:text-6xl font-black uppercase leading-none tracking-tight" style={{ color: '#E8172C' }}>
          Manager
        </h1>
        <p className="text-gray-500 mt-5 text-xs tracking-[0.2em] uppercase">
          Elegí tu franquicia · Temporada 2026
        </p>
      </div>

      {loading && (
        <p className="text-gray-600 text-xs tracking-[0.3em] uppercase animate-pulse">
          Cargando franquicias...
        </p>
      )}

      {error && (
        <div className="rounded-xl p-4 text-red-400 text-sm max-w-md text-center"
          style={{ background: 'rgba(232,23,44,0.1)', border: '1px solid rgba(232,23,44,0.3)' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl w-full">
            {clubs.map(club => {
              const flag = FLAGS[club.provincia] ?? '🌎';
              const isH = hovered === club.id;
              const stars = Math.round(club.reputacion / 20);
              return (
                <button
                  key={club.id}
                  onClick={() => onSelect(club.id)}
                  onMouseEnter={() => setHovered(club.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative flex flex-col items-center text-center rounded-2xl overflow-hidden transition-all duration-200 outline-none focus:outline-none"
                  style={{
                    background: isH
                      ? `linear-gradient(180deg, ${club.color1}18 0%, #12121F 100%)`
                      : '#12121F',
                    border: isH
                      ? `1px solid ${club.color1}60`
                      : '1px solid #1E1E32',
                    transform: isH ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: isH ? `0 16px 48px ${club.color1}28` : 'none',
                  }}
                >
                  {/* Color bar top */}
                  <div
                    className="w-full h-1"
                    style={{ background: `linear-gradient(90deg, ${club.color1}, ${club.color2})` }}
                  />

                  <div className="p-5 flex flex-col items-center gap-3 w-full">
                    {/* Shield */}
                    <div style={{ transform: isH ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.2s' }}>
                      <Shield club={club} size={68} />
                    </div>

                    {/* Name & location */}
                    <div className="w-full">
                      <p className="text-white font-bold text-sm leading-tight">{club.nombre}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {flag} {club.ciudad}
                      </p>
                    </div>

                    {/* Stars (reputation) */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="text-xs"
                          style={{ color: i < stars ? '#E8172C' : '#2A2A3E' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-gray-700 text-[10px] mt-10 tracking-[0.25em] uppercase">
            Super Rugby Americas 2026
          </p>
        </>
      )}
    </div>
  );
}
