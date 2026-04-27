import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClub } from '../api/client.js';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/plantel', label: 'Plantel', icon: '👥' },
  { to: '/formacion', label: 'Formación', icon: '🔰' },
  { to: '/entrenamiento', label: 'Entrenamiento', icon: '💪' },
  { to: '/jornada', label: 'Jornada', icon: '🏉' },
  { to: '/tabla', label: 'Tabla', icon: '📊' },
  { to: '/transferencias', label: 'Transferencias', icon: '🔄' },
  { to: '/estadisticas', label: 'Estadísticas', icon: '📈' },
];

export default function Layout({ clubId, onLogout, children }) {
  const [club, setClub] = useState(null);

  useEffect(() => {
    getClub(clubId).then(setClub).catch(() => {});
  }, [clubId]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏉</span>
            <div>
              <p className="text-xs text-rugby-green font-bold uppercase tracking-widest">Rugby Manager</p>
              <p className="text-xs text-gray-400">Argentina</p>
            </div>
          </div>
        </div>

        {/* Club info */}
        {club && (
          <div className="px-4 py-3 border-b border-gray-800">
            <div
              className="w-full h-1.5 rounded mb-2"
              style={{ background: `linear-gradient(90deg, ${club.color1}, ${club.color2})` }}
            />
            <p className="text-sm font-bold text-white truncate">{club.nombre}</p>
            <p className="text-xs text-gray-400">{club.ciudad}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rugby-green text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800">
          <button
            onClick={onLogout}
            className="w-full text-left text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Cambiar club
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
