import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClub } from '../api/client.js';
import { TEAM_LOGOS, SRA_LOGO } from '../constants/logos.js';

const NAV = [
  { to: '/',               label: 'Inicio',    icon: '⚡' },
  { to: '/plantel',        label: 'Plantel',   icon: '👥' },
  { to: '/formacion',      label: 'Formación', icon: '🔰' },
  { to: '/entrenamiento',  label: 'Entrena.',  icon: '💪' },
  { to: '/jornada',        label: 'Partidos',  icon: '🏉' },
  { to: '/tabla',          label: 'Tabla',     icon: '📊' },
  { to: '/transferencias', label: 'Mercado',   icon: '🔄' },
  { to: '/estadisticas',   label: 'Stats',     icon: '📈' },
];

function isLight(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return (r*299+g*587+b*114)/1000 > 128;
  } catch { return false; }
}

function formatBudget(n) {
  if (n >= 1000000) return `$ ${(n/1000000).toFixed(2)}M`;
  return `$ ${(n/1000).toFixed(0)}k`;
}

export function ClubShield({ club, size = 40 }) {
  const [imgError, setImgError] = useState(false);
  if (!club) return <div style={{ width: size, height: size, borderRadius: '50%', background: '#1E1E32' }} />;

  const logoUrl = TEAM_LOGOS[club.nombre];
  const border = club.color2 === '#FFFFFF' ? 'rgba(255,255,255,0.25)' : club.color2;

  if (logoUrl && !imgError) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `2px solid ${border}`,
        boxShadow: `0 0 20px ${club.color1}40`,
        overflow: 'hidden', flexShrink: 0,
        background: '#12121F',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={logoUrl}
          alt={club.nombre}
          onError={() => setImgError(true)}
          style={{ width: '85%', height: '85%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  const words = club.nombre.replace(' XV','').replace(' Rugby','').split(' ');
  const abbr = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : club.nombre.slice(0,3).toUpperCase();
  const textColor = isLight(club.color1) ? '#111' : '#fff';

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(145deg, ${club.color1} 40%, ${club.color2 === '#FFFFFF' ? club.color1+'BB' : club.color2})`,
      border: `2px solid ${border}`,
      boxShadow: `0 0 20px ${club.color1}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.28, fontWeight: 900, color: textColor,
      flexShrink: 0, letterSpacing: '-0.03em', userSelect: 'none',
    }}>
      {abbr}
    </div>
  );
}

export default function Layout({ clubId, onLogout, children }) {
  const [club, setClub] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getClub(clubId).then(setClub).catch(() => {});
  }, [clubId]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0D0D14' }}>

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <header style={{ background: '#08080F', borderBottom: '1px solid #1A1A2E' }} className="flex-shrink-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src={SRA_LOGO}
              alt="Super Rugby Americas"
              style={{ height: 32, width: 'auto', objectFit: 'contain' }}
            />
            <div className="leading-none hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: '#E8172C' }}>Manager</p>
            </div>
          </div>

          <div style={{ width: 1, height: 28, background: '#1E1E32' }} className="hidden sm:block flex-shrink-0" />

          {/* Club */}
          {club ? (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <ClubShield club={club} size={36} />
              <div className="leading-none min-w-0">
                <p className="text-white font-bold text-sm truncate">{club.nombre}</p>
                <p className="text-gray-500 text-xs truncate">{club.ciudad} · {club.provincia}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Presupuesto */}
          {club && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 flex-shrink-0"
              style={{ background: '#0D1F18', border: '1px solid #1B4332' }}
            >
              <span className="text-xs">💰</span>
              <span className="text-white font-bold text-sm tabular-nums">{formatBudget(club.presupuesto)}</span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Cambiar club"
            className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors text-sm p-1.5 rounded-lg hover:bg-white/5"
          >
            ↩
          </button>
        </div>
      </header>

      {/* ── NAV TABS ─────────────────────────────────────────────────────── */}
      <nav
        style={{ background: '#08080F', borderBottom: '1px solid #1A1A2E' }}
        className="flex-shrink-0 z-10 overflow-x-auto"
      >
        <div className="flex items-stretch max-w-7xl mx-auto px-1">
          {NAV.map(({ to, label, icon }) => {
            const exact = to === '/';
            const isActive = exact ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 flex-shrink-0 transition-colors duration-150 min-w-[64px]"
                style={{ color: isActive ? '#FFFFFF' : '#4B5563' }}
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                  {label}
                </span>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full"
                    style={{ background: club?.color1 ?? '#E8172C' }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#0D0D14' }}>
        <div className="max-w-5xl mx-auto px-4 py-5">
          {children}
        </div>
      </main>
    </div>
  );
}
