import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClub, getTabla, getJornadas, getJornada, getNoticias, leerTodasNoticias, getOfertas, getJugadores } from '../api/client.js';
import { ClubShield } from '../components/Layout.jsx';

const TIPO_ICONO = {
  lesion:  '🩹',
  sponsor: '💰',
  moral:   '💬',
  oferta:  '📨',
  mercado: '✅',
};

const formatPesos = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const formatM = (n) => {
  if (n >= 1000000) return `$ ${(n/1000000).toFixed(2)}M`;
  return `$ ${(n/1000).toFixed(0)}k`;
};

function isLight(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return (r*299+g*587+b*114)/1000 > 128;
  } catch { return false; }
}

// ─── HERO: Próximo Partido ─────────────────────────────────────────────────────
function ProximoPartido({ club, partido, jornadaNum, navigate }) {
  if (!partido) return null;
  const esLocal = partido.clubLocalId === club.id;
  const rival = esLocal ? partido.clubVisitante : partido.clubLocal;

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-5"
      style={{
        background: `linear-gradient(105deg, ${club.color1}22 0%, #12121F 45%, ${rival.color1}22 100%)`,
        border: '1px solid #1E1E32',
        minHeight: 180,
      }}
    >
      {/* Subtle background gradient overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(105deg, ${club.color1}, transparent 40%, ${rival.color1})`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center py-6 px-4">
        {/* Jornada label */}
        <p
          className="text-[10px] font-black uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid #1E1E32' }}
        >
          Jornada {jornadaNum} · {esLocal ? 'Local' : 'Visitante'}
        </p>

        {/* VS row */}
        <div className="flex items-center gap-4 sm:gap-8 w-full max-w-md justify-center">
          {/* Tu club */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <ClubShield club={club} size={64} />
            <p className="text-white font-black text-sm uppercase tracking-tight text-center leading-tight">
              {club.nombre}
            </p>
            <p className="text-gray-500 text-xs text-center">{club.ciudad}</p>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <span
              className="text-3xl font-black"
              style={{ color: '#E8172C', textShadow: '0 0 24px #E8172C60' }}
            >
              VS
            </span>
          </div>

          {/* Rival */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <ClubShield club={rival} size={64} />
            <p className="text-white font-black text-sm uppercase tracking-tight text-center leading-tight">
              {rival.nombre}
            </p>
            <p className="text-gray-500 text-xs text-center">{rival.ciudad}</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/jornada')}
          className="mt-5 px-8 py-2.5 rounded-xl font-bold text-sm text-white uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${club.color1}, ${club.color1}CC)`,
            boxShadow: `0 4px 24px ${club.color1}40`,
          }}
        >
          Ir a Partidos →
        </button>
      </div>
    </div>
  );
}

// ─── QUICK STATS ──────────────────────────────────────────────────────────────
function StatTile({ label, value, sub, accent }) {
  return (
    <div className="card flex flex-col items-center text-center py-4">
      <p className="text-2xl font-black text-white" style={accent ? { color: accent } : {}}>{value}</p>
      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ clubId }) {
  const [club, setClub]               = useState(null);
  const [tablaData, setTablaData]     = useState(null);
  const [jornadas, setJornadas]       = useState([]);
  const [proximoPartido, setProximoPartido] = useState(null);
  const [jornadaActualNum, setJornadaActualNum] = useState(null);
  const [noticias, setNoticias]       = useState([]);
  const [ofertas, setOfertas]         = useState([]);
  const [salarioSemanal, setSalarioSemanal] = useState(0);
  const [loading, setLoading]         = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getClub(clubId),
      getTabla(),
      getJornadas(),
      getNoticias(clubId),
      getOfertas(clubId),
      getJugadores(clubId),
    ]).then(async ([c, t, js, n, o, jugadores]) => {
      setClub(c);
      setTablaData(t);
      setJornadas(js);
      setNoticias(n);
      setOfertas(o);
      setSalarioSemanal(jugadores.reduce((s, j) => s + Math.round(j.valor / 200), 0));

      // Próximo partido
      const jornadaActiva = js.find(j => j.jugados < j.total) ?? js[js.length - 1];
      if (jornadaActiva) {
        setJornadaActualNum(jornadaActiva.numero);
        try {
          const partidos = await getJornada(jornadaActiva.numero);
          const proximo = partidos.find(
            p => !p.jugado && (p.clubLocalId === clubId || p.clubVisitanteId === clubId)
          );
          setProximoPartido(proximo ?? null);
        } catch {}
      }
    }).finally(() => setLoading(false));
  }, [clubId]);

  const noLeidas = noticias.filter(n => !n.leida).length;

  const handleLeerTodas = async () => {
    await leerTodasNoticias(clubId);
    setNoticias(prev => prev.map(n => ({ ...n, leida: true })));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-gray-600 text-xs uppercase tracking-[0.3em] animate-pulse">Cargando...</p>
    </div>
  );
  if (!club) return null;

  const miPosicion = tablaData?.tabla.findIndex(r => r.club.id === clubId) ?? -1;
  const miStats    = tablaData?.tabla[miPosicion];

  return (
    <div className="space-y-4">

      {/* ── HERO: Próximo Partido ──────────────────────────────────────── */}
      {proximoPartido && (
        <ProximoPartido
          club={club}
          partido={proximoPartido}
          jornadaNum={jornadaActualNum}
          navigate={navigate}
        />
      )}

      {/* ── Banner de ofertas ─────────────────────────────────────────── */}
      {ofertas.length > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}
          onClick={() => navigate('/transferencias')}
        >
          <span className="text-xl">📨</span>
          <div className="flex-1">
            <p className="font-bold text-yellow-300 text-sm">
              {ofertas.length === 1 ? '1 oferta recibida' : `${ofertas.length} ofertas recibidas`}
            </p>
            <p className="text-xs text-gray-500">Un rival quiere comprar a uno de tus jugadores</p>
          </div>
          <span className="text-yellow-500 text-sm">→</span>
        </div>
      )}

      {/* ── Quick Stats ───────────────────────────────────────────────── */}
      {miStats && (
        <>
          <p className="section-title">Tu temporada</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile
              label="Posición"
              value={`#${miPosicion + 1}`}
              sub={`de ${tablaData.tabla.length}`}
              accent={miPosicion === 0 ? '#E8172C' : miPosicion <= 3 ? '#2D6A4F' : undefined}
            />
            <StatTile
              label="Puntos"
              value={miStats.puntos}
              sub={`${miStats.pg}G · ${miStats.pe}E · ${miStats.pp}P`}
            />
            <StatTile
              label="Diferencia"
              value={miStats.dif >= 0 ? `+${miStats.dif}` : miStats.dif}
              sub={`${miStats.pf} a favor`}
              accent={miStats.dif > 0 ? '#2D6A4F' : miStats.dif < 0 ? '#E8172C' : undefined}
            />
            <StatTile
              label="Presupuesto"
              value={formatM(club.presupuesto)}
              sub={`Salarios: ${formatM(salarioSemanal)}/j`}
            />
          </div>
        </>
      )}

      {/* ── Top 4 + Noticias en 2 columnas ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Tabla top 4 */}
        <div className="md:col-span-2 card">
          <p className="section-title">Tabla</p>
          <div className="space-y-1.5">
            {tablaData?.tabla.slice(0, 4).map((row, i) => (
              <div
                key={row.club.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
                style={{
                  background: row.club.id === clubId ? `${club.color1}18` : 'rgba(255,255,255,0.02)',
                  border: row.club.id === clubId ? `1px solid ${club.color1}40` : '1px solid transparent',
                }}
              >
                <span
                  className="w-5 text-center font-black text-xs flex-shrink-0"
                  style={{ color: i === 0 ? '#E8172C' : '#4B5563' }}
                >
                  {i + 1}
                </span>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: row.club.color1 }}
                />
                <span className="flex-1 text-xs font-medium text-white truncate">{row.club.nombre}</span>
                <span className="text-xs font-black" style={{ color: i === 0 ? '#E8172C' : '#9CA3AF' }}>
                  {row.puntos}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/tabla')}
            className="w-full text-center text-xs text-gray-600 hover:text-gray-400 mt-3 transition-colors"
          >
            Ver tabla completa →
          </button>
        </div>

        {/* Noticias */}
        <div className="md:col-span-3 card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="section-title mb-0">Noticias</p>
              {noLeidas > 0 && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: '#E8172C' }}
                >
                  {noLeidas}
                </span>
              )}
            </div>
            {noLeidas > 0 && (
              <button
                onClick={handleLeerTodas}
                className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {noticias.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-6">
              Jugá una jornada para ver eventos.
            </p>
          ) : (
            <div className="space-y-1.5">
              {noticias.slice(0, 7).map(n => (
                <div
                  key={n.id}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                  style={{
                    background: !n.leida ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: !n.leida ? '1px solid #1E1E32' : '1px solid transparent',
                  }}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{TIPO_ICONO[n.tipo] ?? '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${n.leida ? 'text-gray-500' : 'text-gray-200'}`}>
                      {n.texto}
                    </p>
                    <p className="text-[10px] text-gray-700 mt-0.5">
                      {new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {!n.leida && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: club.color1 }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
