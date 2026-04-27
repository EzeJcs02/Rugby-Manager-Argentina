import { useEffect, useState } from 'react';
import { getClubs, getJugadores, getTransferencias, crearTransferencia, getOfertas, responderOferta, getMercado } from '../api/client.js';

const ATTRS = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
function overall(j) { return Math.round(ATTRS.reduce((s, a) => s + j[a], 0) / ATTRS.length); }

function attrColor(v) {
  if (v >= 85) return 'text-green-400';
  if (v >= 70) return 'text-yellow-400';
  if (v >= 55) return 'text-orange-400';
  return 'text-red-400';
}

const formatPesos = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function Transferencias({ clubId }) {
  const [clubs, setClubs] = useState([]);
  const [clubSeleccionado, setClubSeleccionado] = useState('');
  const [jugadoresOtroClub, setJugadoresOtroClub] = useState([]);
  const [libres, setLibres] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comprando, setComprando] = useState(null);
  const [respondiendo, setRespondiendo] = useState(null);
  const [tab, setTab] = useState('mercado');
  // Filtros
  const [filtroPosicion, setFiltroPosicion] = useState('');
  const [filtroOvr, setFiltroOvr] = useState(0);
  const [mostrarLibres, setMostrarLibres] = useState(false);

  const cargar = () => {
    getClubs().then(cs => setClubs(cs.filter(c => c.id !== clubId)));
    getTransferencias(clubId).then(setHistorial);
    getOfertas(clubId).then(setOfertas);
    getMercado().then(setLibres);
  };

  useEffect(() => { cargar(); }, [clubId]);

  // Ir a ofertas si hay alguna pendiente
  useEffect(() => {
    if (ofertas.length > 0 && tab === 'mercado') setTab('ofertas');
  }, [ofertas.length]);

  const cargarJugadoresClub = async (id) => {
    setClubSeleccionado(id);
    if (!id) { setJugadoresOtroClub([]); return; }
    setLoading(true);
    const js = await getJugadores(parseInt(id));
    setJugadoresOtroClub(js);
    setLoading(false);
  };

  const handleComprar = async (jugador) => {
    const monto = jugador.valor;
    if (!confirm(`¿Comprar a ${jugador.nombre} ${jugador.apellido} por ${formatPesos(monto)}?`)) return;
    setComprando(jugador.id);
    try {
      await crearTransferencia({ jugadorId: jugador.id, clubDestinoId: clubId, monto });
      setJugadoresOtroClub(prev => prev.filter(j => j.id !== jugador.id));
      cargar();
      alert(`✅ ${jugador.nombre} ${jugador.apellido} fichado!`);
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error en la transferencia');
    } finally {
      setComprando(null);
    }
  };

  const handleResponder = async (id, accion) => {
    setRespondiendo(id);
    try {
      await responderOferta(id, accion);
      setOfertas(prev => prev.filter(o => o.id !== id));
      cargar();
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error al responder oferta');
    } finally {
      setRespondiendo(null);
    }
  };

  const tabs = [
    { id: 'mercado',  label: '🔍 Fichar', count: null },
    { id: 'ofertas',  label: '📨 Ofertas', count: ofertas.length || null },
    { id: 'historial', label: '📋 Historial', count: null },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Transferencias</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5
              ${tab === t.id ? 'bg-rugby-green text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {t.label}
            {t.count != null && (
              <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Fichar ─── */}
      {tab === 'mercado' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="card space-y-3">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-36">
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Club</label>
                <select
                  value={mostrarLibres ? 'libres' : clubSeleccionado}
                  onChange={e => {
                    if (e.target.value === 'libres') { setMostrarLibres(true); setClubSeleccionado(''); }
                    else { setMostrarLibres(false); cargarJugadoresClub(e.target.value); }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rugby-green"
                >
                  <option value="">— Seleccioná —</option>
                  <option value="libres">🆓 Agentes libres ({libres.length})</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="min-w-36">
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Posición</label>
                <select
                  value={filtroPosicion}
                  onChange={e => setFiltroPosicion(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rugby-green"
                >
                  <option value="">Todas</option>
                  {['Pilar Izq','Hooker','Pilar Der','Segunda Línea','Ala','Octavo','Medio Scrum','Apertura','Centro','Wing','Fullback'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-28">
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">OVR mín: {filtroOvr}</label>
                <input type="range" min="0" max="90" step="5" value={filtroOvr}
                  onChange={e => setFiltroOvr(parseInt(e.target.value))}
                  className="w-full accent-rugby-green" />
              </div>
            </div>
          </div>

          {loading && <p className="text-gray-500 animate-pulse text-center">Cargando jugadores...</p>}

          {(() => {
            const lista = (mostrarLibres ? libres : jugadoresOtroClub)
              .filter(j => (!filtroPosicion || j.posicion === filtroPosicion) && overall(j) >= filtroOvr)
              .sort((a, b) => overall(b) - overall(a));

            if (!mostrarLibres && !clubSeleccionado) return null;
            return (
              <div className="card space-y-1">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-800">
                  <div className="grid grid-cols-12 flex-1 text-xs text-gray-600 uppercase">
                    <span className="col-span-4">Jugador</span>
                    <span className="col-span-2 text-center">OVR</span>
                    <span className="col-span-3 text-center">Posición</span>
                    <span className="col-span-2 text-center">Valor</span>
                    <span className="col-span-1" />
                  </div>
                </div>
                {lista.length === 0 && <p className="text-gray-600 text-sm text-center py-4">Sin resultados con esos filtros</p>}
                {lista.map(j => (
                  <div key={j.id} className="grid grid-cols-12 items-center py-2 px-2 hover:bg-gray-800 rounded-lg">
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-white">{j.nombre} {j.apellido}</p>
                      <p className="text-xs text-gray-500">{j.edad} años</p>
                    </div>
                    <span className={`col-span-2 text-center font-bold text-sm ${attrColor(overall(j))}`}>{overall(j)}</span>
                    <span className="col-span-3 text-center text-xs text-gray-400">{j.posicion}</span>
                    <span className="col-span-2 text-center text-xs text-gray-300">${(j.valor/1000).toFixed(0)}k</span>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => handleComprar(j)} disabled={comprando === j.id} className="text-xs btn-primary py-1 px-2">
                        {comprando === j.id ? '...' : '→'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── Ofertas recibidas ─── */}
      {tab === 'ofertas' && (
        <div className="space-y-3">
          {ofertas.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500 text-sm">No hay ofertas pendientes.</p>
              <p className="text-gray-600 text-xs mt-1">Las ofertas aparecen cuando simulás jornadas.</p>
            </div>
          ) : (
            ofertas.map(o => (
              <div key={o.id} className="card border-yellow-500/30">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: o.clubDestino.color1 }} />
                      <p className="text-sm text-gray-400">{o.clubDestino.nombre} ofrece por:</p>
                    </div>
                    <p className="text-white font-bold">{o.jugador.nombre} {o.jugador.apellido}</p>
                    <p className="text-xs text-gray-500">{o.jugador.posicion} · {o.jugador.edad} años · OVR {overall(o.jugador)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-rugby-green font-bold text-lg">{formatPesos(o.monto)}</p>
                    <p className="text-xs text-gray-600">Valor base: {formatPesos(o.jugador.valor)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => handleResponder(o.id, 'rechazar')}
                    disabled={respondiendo === o.id}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleResponder(o.id, 'aceptar')}
                    disabled={respondiendo === o.id}
                    className="flex-1 btn-primary"
                  >
                    {respondiendo === o.id ? '...' : `Aceptar ${formatPesos(o.monto)}`}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Historial ─── */}
      {tab === 'historial' && (
        <div className="card">
          {historial.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Sin transferencias registradas.</p>
          ) : (
            <div className="space-y-2">
              {historial.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{t.jugador.nombre} {t.jugador.apellido}</p>
                    <p className="text-xs text-gray-500">
                      {t.clubOrigen?.nombre ?? 'Libre'} → {t.clubDestino.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-rugby-green font-bold">{formatPesos(t.monto)}</p>
                    <span className={`badge text-xs ${t.estado === 'aprobada' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-500'}`}>
                      {t.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
