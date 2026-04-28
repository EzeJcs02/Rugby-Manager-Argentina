import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClub, getTabla, getJornadas, getJornada, getNoticias, leerTodasNoticias, getOfertas, getJugadores, getHistorial } from '../api/client.js';
import { ClubShield } from '../components/Layout.jsx';

const TIPO_ICONO = {
  lesion:  '🩹',
  sponsor: '💰',
  moral:   '💬',
  oferta:  '📨',
  mercado: '✅',
};

const formatM = (n) => {
  if (n >= 1000000) return `$ ${(n/1000000).toFixed(2)}M`;
  return `$ ${(n/1000).toFixed(0)}k`;
};

const ATTRS = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
const ovr = j => Math.round(ATTRS.reduce((s, a) => s + j[a], 0) / ATTRS.length);

function ovrColor(v) {
  if (v >= 85) return '#4ADE80';
  if (v >= 70) return '#FACC15';
  if (v >= 55) return '#FB923C';
  return '#F87171';
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ h = 'h-4', w = 'w-full', rounded = 'rounded-lg' }) {
  return (
    <div
      className={`animate-pulse ${h} ${w} ${rounded}`}
      style={{ background: '#1E1E32' }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Hero skeleton */}
      <div className="rounded-2xl p-6" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2 flex-1">
            <Skeleton h="h-16" w="w-16" rounded="rounded-full" />
            <Skeleton h="h-3" w="w-20" />
          </div>
          <Skeleton h="h-8" w="w-12" />
          <div className="flex flex-col items-center gap-2 flex-1">
            <Skeleton h="h-16" w="w-16" rounded="rounded-full" />
            <Skeleton h="h-3" w="w-20" />
          </div>
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 space-y-2" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
            <Skeleton h="h-7" w="w-12" rounded="rounded" />
            <Skeleton h="h-3" w="w-16" />
          </div>
        ))}
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 rounded-xl p-4 space-y-3" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} h="h-8" />)}
        </div>
        <div className="md:col-span-3 rounded-xl p-4 space-y-3" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} h="h-10" />)}
        </div>
      </div>
    </div>
  );
}

// ─── HERO: Próximo Partido ─────────────────────────────────────────────────────
function ProximoPartido({ club, partido, jornadaNum, navigate }) {
  if (!partido) return null;
  const esLocal = partido.clubLocalId === club.id;
  const rival   = esLocal ? partido.clubVisitante : partido.clubLocal;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(105deg, ${club.color1}20 0%, #12121F 45%, ${rival.color1}20 100%)`,
        border: '1px solid #1E1E32',
        minHeight: 170,
      }}
    >
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ background: `linear-gradient(105deg, ${club.color1}, transparent 40%, ${rival.color1})` }} />

      <div className="relative z-10 flex flex-col items-center py-5 px-4">
        <p
          className="text-[10px] font-black uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid #1E1E32' }}
        >
          Jornada {jornadaNum} · {esLocal ? 'Local' : 'Visitante'}
        </p>

        <div className="flex items-center gap-4 sm:gap-10 w-full max-w-sm justify-center">
          <div className="flex flex-col items-center gap-2 flex-1">
            <ClubShield club={club} size={60} />
            <p className="text-white font-black text-xs uppercase tracking-tight text-center leading-tight">{club.nombre}</p>
          </div>
          <span className="text-3xl font-black flex-shrink-0" style={{ color: '#E8172C', textShadow: '0 0 20px #E8172C50' }}>VS</span>
          <div className="flex flex-col items-center gap-2 flex-1">
            <ClubShield club={rival} size={60} />
            <p className="text-white font-black text-xs uppercase tracking-tight text-center leading-tight">{rival.nombre}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/jornada')}
          className="mt-4 px-7 py-2 rounded-xl font-bold text-xs text-white uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${club.color1}, ${club.color1}BB)`, boxShadow: `0 4px 20px ${club.color1}35` }}
        >
          Ver partidos →
        </button>
      </div>
    </div>
  );
}

// ─── Forma reciente ────────────────────────────────────────────────────────────
function FormaReciente({ historial }) {
  if (!historial || historial.length === 0) return null;
  const forma = historial.slice(-5);
  const colors = { V: '#4ADE80', E: '#9CA3AF', D: '#F87171' };
  return (
    <div className="flex items-center gap-1.5">
      {forma.map((p, i) => (
        <div
          key={i}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{ background: `${colors[p.resultado]}18`, color: colors[p.resultado], border: `1px solid ${colors[p.resultado]}40` }}
          title={`${p.resultado} vs ${p.rival.nombre} ${p.propios}-${p.contrarios}`}
        >
          {p.resultado}
        </div>
      ))}
    </div>
  );
}

// ─── Top jugadores del plantel ─────────────────────────────────────────────────
function TopJugadores({ jugadores, club }) {
  const top = [...jugadores].sort((a, b) => ovr(b) - ovr(a)).slice(0, 6);
  if (top.length === 0) return null;

  const posBadge = (pos) => {
    const short = {
      'Pilar Izq': 'PIL', 'Hooker': 'HOO', 'Pilar Der': 'PIL',
      'Segunda Línea': '2LL', 'Ala': 'ALA', 'Octavo': 'OCT',
      'Medio Scrum': 'MS', 'Apertura': 'APE', 'Wing': 'WIN',
      'Centro': 'CEN', 'Fullback': 'FB',
    };
    return short[pos] ?? pos.slice(0, 3).toUpperCase();
  };

  return (
    <div className="card">
      <p className="section-title">Estrellas del plantel</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {top.map((j, i) => {
          const ov = ovr(j);
          return (
            <div
              key={j.id}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-colors"
              style={{ background: i === 0 ? `${club.color1}12` : '#0D0D14', border: `1px solid ${i === 0 ? club.color1 + '30' : '#1E1E32'}` }}
            >
              {i === 0 && <span className="text-[10px]" style={{ color: '#E8C000' }}>★</span>}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                style={{ background: `${club.color1}25`, color: club.color1 }}
              >
                {posBadge(j.posicion)}
              </div>
              <p className="text-white font-bold text-[11px] leading-tight truncate w-full">{j.apellido}</p>
              <p className="font-black text-sm" style={{ color: ovrColor(ov) }}>{ov}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Presupuesto visual ────────────────────────────────────────────────────────
function BudgetCard({ presupuesto, salarioSemanal, navigate }) {
  const pct = presupuesto > 0 ? Math.min(100, Math.round((salarioSemanal / presupuesto) * 100)) : 0;
  const color = pct > 60 ? '#E8172C' : pct > 35 ? '#FACC15' : '#4ADE80';

  return (
    <div
      className="rounded-xl p-4 cursor-pointer transition-colors hover:border-gray-700"
      style={{ background: '#12121F', border: '1px solid #1E1E32' }}
      onClick={() => navigate('/plantel')}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="section-title mb-0">Presupuesto</p>
        <p className="text-gray-600 text-[10px]">Salarios {pct}%</p>
      </div>
      <p className="text-white font-black text-2xl mb-2">{formatM(presupuesto)}</p>
      <div className="rounded-full h-1.5 overflow-hidden mb-1.5" style={{ background: '#1E1E32' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>Salarios: {formatM(salarioSemanal)}/j</span>
        <span style={{ color }}>
          {pct < 30 ? 'Saludable' : pct < 60 ? 'Moderado' : 'Alto'}
        </span>
      </div>
    </div>
  );
}

// ─── Quick stat tile ───────────────────────────────────────────────────────────
function StatTile({ label, value, sub, accent }) {
  return (
    <div className="card flex flex-col items-center text-center py-4">
      <p className="text-2xl font-black text-white" style={accent ? { color: accent } : {}}>{value}</p>
      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[10px] text-gray-700 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({ clubId }) {
  const [club, setClub]               = useState(null);
  const [tablaData, setTablaData]     = useState(null);
  const [jornadas, setJornadas]       = useState([]);
  const [proximoPartido, setProximoPartido] = useState(null);
  const [jornadaActualNum, setJornadaActualNum] = useState(null);
  const [noticias, setNoticias]       = useState([]);
  const [ofertas, setOfertas]         = useState([]);
  const [jugadores, setJugadores]     = useState([]);
  const [salarioSemanal, setSalarioSemanal] = useState(0);
  const [historial, setHistorial]     = useState([]);
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
      getHistorial(clubId),
    ]).then(async ([c, t, js, n, o, jugs, hist]) => {
      setClub(c);
      setTablaData(t);
      setJornadas(js);
      setNoticias(n);
      setOfertas(o);
      setJugadores(jugs);
      setHistorial(hist);
      setSalarioSemanal(jugs.reduce((s, j) => s + Math.round(j.valor / 200), 0));

      const jornadaActiva = js.find(j => j.jugados < j.total) ?? js[js.length - 1];
      if (jornadaActiva) {
        setJornadaActualNum(jornadaActiva.numero);
        try {
          const partidos = await getJornada(jornadaActiva.numero);
          const proximo  = partidos.find(p => !p.jugado && (p.clubLocalId === clubId || p.clubVisitanteId === clubId));
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

  if (loading) return <DashboardSkeleton />;
  if (!club) return null;

  const miPosicion = tablaData?.tabla.findIndex(r => r.club.id === clubId) ?? -1;
  const miStats    = tablaData?.tabla[miPosicion];

  return (
    <div className="space-y-4">

      {/* ── HERO: Próximo partido ── */}
      {proximoPartido && (
        <ProximoPartido
          club={club}
          partido={proximoPartido}
          jornadaNum={jornadaActualNum}
          navigate={navigate}
        />
      )}

      {/* ── Oferta de transferencia ── */}
      {ofertas.length > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
          style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}
          onClick={() => navigate('/transferencias')}
        >
          <span className="text-lg">📨</span>
          <div className="flex-1">
            <p className="font-bold text-yellow-300 text-sm">
              {ofertas.length === 1 ? '1 oferta recibida' : `${ofertas.length} ofertas recibidas`}
            </p>
            <p className="text-xs text-gray-600">Un rival quiere comprar a uno de tus jugadores</p>
          </div>
          <span className="text-yellow-600 text-sm">→</span>
        </div>
      )}

      {/* ── Stats de temporada ── */}
      {miStats && (
        <>
          <div className="flex items-center justify-between">
            <p className="section-title mb-0">Tu temporada</p>
            <FormaReciente historial={historial} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatTile
              label="Posición"
              value={`#${miPosicion + 1}`}
              sub={`de ${tablaData.tabla.length} equipos`}
              accent={miPosicion === 0 ? '#E8172C' : miPosicion <= 3 ? '#4ADE80' : undefined}
            />
            <StatTile
              label="Puntos"
              value={miStats.puntos}
              sub={`${miStats.pg}V · ${miStats.pe}E · ${miStats.pp}D`}
            />
            <StatTile
              label="Diferencia"
              value={miStats.dif >= 0 ? `+${miStats.dif}` : miStats.dif}
              sub={`${miStats.pf} pts a favor`}
              accent={miStats.dif > 0 ? '#4ADE80' : miStats.dif < 0 ? '#E8172C' : undefined}
            />
          </div>
        </>
      )}

      {/* ── Presupuesto visual ── */}
      <BudgetCard presupuesto={club.presupuesto} salarioSemanal={salarioSemanal} navigate={navigate} />

      {/* ── Top jugadores ── */}
      <TopJugadores jugadores={jugadores} club={club} />

      {/* ── Tabla + Noticias ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Top 4 */}
        <div className="md:col-span-2 card">
          <p className="section-title">Tabla</p>
          <div className="space-y-1.5">
            {tablaData?.tabla.slice(0, 4).map((row, i) => (
              <div
                key={row.club.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
                style={{
                  background: row.club.id === clubId ? `${club.color1}15` : 'rgba(255,255,255,0.02)',
                  border: row.club.id === clubId ? `1px solid ${club.color1}35` : '1px solid transparent',
                }}
              >
                <span className="w-5 text-center font-black text-xs flex-shrink-0"
                  style={{ color: i === 0 ? '#E8172C' : '#374151' }}>
                  {i + 1}
                </span>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.club.color1 }} />
                <span className="flex-1 text-xs font-medium text-white truncate">{row.club.nombre}</span>
                <span className="text-xs font-black" style={{ color: i === 0 ? '#E8172C' : '#6B7280' }}>
                  {row.puntos}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/tabla')}
            className="w-full text-center text-[11px] text-gray-700 hover:text-gray-400 mt-3 transition-colors"
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
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: '#E8172C' }}>
                  {noLeidas}
                </span>
              )}
            </div>
            {noLeidas > 0 && (
              <button onClick={handleLeerTodas} className="text-[10px] text-gray-700 hover:text-gray-400 transition-colors">
                Marcar leídas
              </button>
            )}
          </div>

          {noticias.length === 0 ? (
            <p className="text-gray-700 text-xs text-center py-6">Jugá una jornada para ver eventos.</p>
          ) : (
            <div className="space-y-1">
              {noticias.slice(0, 7).map(n => (
                <div
                  key={n.id}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                  style={{
                    background: !n.leida ? 'rgba(255,255,255,0.035)' : 'transparent',
                    border: !n.leida ? '1px solid #1E1E32' : '1px solid transparent',
                  }}
                >
                  <span className="text-sm flex-shrink-0 mt-0.5">{TIPO_ICONO[n.tipo] ?? '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${n.leida ? 'text-gray-600' : 'text-gray-200'}`}>{n.texto}</p>
                    <p className="text-[10px] text-gray-700 mt-0.5">
                      {new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {!n.leida && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: club.color1 }} />
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
