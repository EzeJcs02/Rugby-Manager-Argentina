import { useEffect, useState } from 'react';
import { getClubs, getJugadores, getTransferencias, crearTransferencia, getOfertas, responderOferta, getMercado } from '../api/client.js';

const ATTRS = ['scrum','lineout','tackle','velocidad','pase','pie','vision','potencia','motor','liderazgo'];
function overall(j) { return Math.round(ATTRS.reduce((s, a) => s + j[a], 0) / ATTRS.length); }

function attrColor(v) {
  if (v >= 85) return '#4ADE80';
  if (v >= 70) return '#FACC15';
  if (v >= 55) return '#FB923C';
  return '#F87171';
}

const formatPesos = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const formatM = (n) => {
  if (n >= 1000000) return `$ ${(n / 1000000).toFixed(2)}M`;
  return `$ ${(n / 1000).toFixed(0)}k`;
};

// ─── Modal de confirmación de compra ──────────────────────────────────────────
function ConfirmModal({ jugador, onConfirm, onClose, loading }) {
  const ov = overall(jugador);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow-2xl" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
        <h3 className="text-white font-black text-lg uppercase tracking-tight mb-1">Confirmar fichaje</h3>
        <p className="text-gray-500 text-xs mb-4">Revisá los detalles antes de cerrar el trato</p>

        <div className="rounded-xl p-4 mb-4 space-y-2" style={{ background: '#0D0D14', border: '1px solid #1E1E32' }}>
          <div className="flex items-center justify-between">
            <p className="text-white font-bold">{jugador.nombre} {jugador.apellido}</p>
            <span className="font-black text-sm" style={{ color: attrColor(ov) }}>{ov}</span>
          </div>
          <p className="text-gray-500 text-xs">{jugador.posicion} · {jugador.edad} años</p>
          <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
            <span className="text-gray-500 text-xs">Costo</span>
            <span className="text-white font-black text-lg">{formatM(jugador.valor)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors"
            style={{ background: '#1E1E32' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#E8172C' }}
          >
            {loading ? 'Fichando...' : 'Fichar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Éxito al comprar ─────────────────────────────────────────────────────────
function SuccessToast({ jugador, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3"
      style={{ background: '#0D1F18', border: '1px solid #2D6A4F' }}
    >
      <span className="text-xl">✅</span>
      <div>
        <p className="text-white font-bold text-sm">{jugador.nombre} {jugador.apellido} fichado</p>
        <p className="text-gray-400 text-xs">Bienvenido al plantel</p>
      </div>
      <button onClick={onClose} className="text-gray-600 hover:text-white ml-2">×</button>
    </div>
  );
}

export default function Transferencias({ clubId }) {
  const [clubs, setClubs]                 = useState([]);
  const [clubSeleccionado, setClubSeleccionado] = useState('');
  const [jugadoresOtroClub, setJugadoresOtroClub] = useState([]);
  const [libres, setLibres]               = useState([]);
  const [historial, setHistorial]         = useState([]);
  const [ofertas, setOfertas]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [comprando, setComprando]         = useState(null);
  const [pendienteCompra, setPendienteCompra] = useState(null);
  const [respondiendo, setRespondiendo]   = useState(null);
  const [toast, setToast]                 = useState(null);
  const [tab, setTab]                     = useState('mercado');
  const [filtroPosicion, setFiltroPosicion] = useState('');
  const [filtroOvr, setFiltroOvr]         = useState(0);
  const [mostrarLibres, setMostrarLibres] = useState(false);

  const cargar = () => {
    getClubs().then(cs => setClubs(cs.filter(c => c.id !== clubId)));
    getTransferencias(clubId).then(setHistorial);
    getOfertas(clubId).then(setOfertas);
    getMercado().then(setLibres);
  };

  useEffect(() => { cargar(); }, [clubId]);
  useEffect(() => { if (ofertas.length > 0 && tab === 'mercado') setTab('ofertas'); }, [ofertas.length]);

  const cargarJugadoresClub = async (id) => {
    setClubSeleccionado(id);
    if (!id) { setJugadoresOtroClub([]); return; }
    setLoading(true);
    const js = await getJugadores(parseInt(id));
    setJugadoresOtroClub(js);
    setLoading(false);
  };

  const handleConfirmarCompra = async () => {
    if (!pendienteCompra) return;
    const jugador = pendienteCompra;
    setComprando(jugador.id);
    try {
      await crearTransferencia({ jugadorId: jugador.id, clubDestinoId: clubId, monto: jugador.valor });
      setJugadoresOtroClub(prev => prev.filter(j => j.id !== jugador.id));
      setLibres(prev => prev.filter(j => j.id !== jugador.id));
      setToast(jugador);
      cargar();
    } catch (e) {
      alert(e.response?.data?.error ?? 'Error en la transferencia');
    } finally {
      setComprando(null);
      setPendienteCompra(null);
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
    { id: 'mercado',   label: 'Fichar',    count: null },
    { id: 'ofertas',   label: 'Ofertas',   count: ofertas.length || null },
    { id: 'historial', label: 'Historial', count: null },
  ];

  return (
    <div className="space-y-5">

      {/* Tabs */}
      <div className="flex gap-0" style={{ borderBottom: '1px solid #1E1E32' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-5 py-2.5 text-sm font-bold transition-colors flex items-center gap-2"
            style={{ color: tab === t.id ? '#FFFFFF' : '#4B5563' }}
          >
            {t.label}
            {t.count != null && (
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: '#E8172C', color: '#fff' }}
              >
                {t.count}
              </span>
            )}
            {tab === t.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full" style={{ background: '#E8172C' }} />
            )}
          </button>
        ))}
      </div>

      {/* ─── Fichar ─── */}
      {tab === 'mercado' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-36">
                <label className="section-title mb-1.5 block">Club</label>
                <select
                  value={mostrarLibres ? 'libres' : clubSeleccionado}
                  onChange={e => {
                    if (e.target.value === 'libres') { setMostrarLibres(true); setClubSeleccionado(''); }
                    else { setMostrarLibres(false); cargarJugadoresClub(e.target.value); }
                  }}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                  style={{ background: '#0D0D14', border: '1px solid #1E1E32' }}
                >
                  <option value="">— Seleccioná un club —</option>
                  <option value="libres">🆓 Agentes libres ({libres.length})</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="min-w-36">
                <label className="section-title mb-1.5 block">Posición</label>
                <select
                  value={filtroPosicion}
                  onChange={e => setFiltroPosicion(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none"
                  style={{ background: '#0D0D14', border: '1px solid #1E1E32' }}
                >
                  <option value="">Todas</option>
                  {['Pilar Izq','Hooker','Pilar Der','Segunda Línea','Ala','Octavo','Medio Scrum','Apertura','Centro','Wing','Fullback'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-28">
                <label className="section-title mb-1.5 block">OVR mín: <span className="text-white">{filtroOvr}</span></label>
                <input
                  type="range" min="0" max="90" step="5"
                  value={filtroOvr}
                  onChange={e => setFiltroOvr(parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>
          </div>

          {loading && <p className="text-gray-600 animate-pulse text-center text-xs uppercase tracking-[0.2em]">Cargando jugadores...</p>}

          {(() => {
            const lista = (mostrarLibres ? libres : jugadoresOtroClub)
              .filter(j => (!filtroPosicion || j.posicion === filtroPosicion) && overall(j) >= filtroOvr)
              .sort((a, b) => overall(b) - overall(a));

            if (!mostrarLibres && !clubSeleccionado) return null;
            return (
              <div className="rounded-xl overflow-hidden" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
                <div className="grid grid-cols-12 text-[10px] text-gray-600 uppercase tracking-wider px-4 py-2.5" style={{ borderBottom: '1px solid #1E1E32' }}>
                  <span className="col-span-4">Jugador</span>
                  <span className="col-span-2 text-center">OVR</span>
                  <span className="col-span-3 text-center">Posición</span>
                  <span className="col-span-2 text-center">Valor</span>
                  <span className="col-span-1" />
                </div>
                {lista.length === 0 && (
                  <p className="text-gray-600 text-xs text-center py-6">Sin resultados con esos filtros</p>
                )}
                <div className="divide-y divide-gray-800/30">
                  {lista.map(j => {
                    const ov = overall(j);
                    return (
                      <div key={j.id} className="grid grid-cols-12 items-center py-3 px-4 hover:bg-white/[0.02] transition-colors">
                        <div className="col-span-4">
                          <p className="text-sm font-medium text-white">{j.nombre} {j.apellido}</p>
                          <p className="text-[10px] text-gray-600">{j.edad} años</p>
                        </div>
                        <span className="col-span-2 text-center font-black text-sm" style={{ color: attrColor(ov) }}>{ov}</span>
                        <span className="col-span-3 text-center text-xs text-gray-500">{j.posicion}</span>
                        <span className="col-span-2 text-center text-xs text-gray-400">{formatM(j.valor)}</span>
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => setPendienteCompra(j)}
                            disabled={comprando === j.id}
                            className="text-xs px-2.5 py-1 rounded-lg font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                            style={{ background: '#E8172C' }}
                          >
                            {comprando === j.id ? '…' : '→'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── Ofertas recibidas ─── */}
      {tab === 'ofertas' && (
        <div className="space-y-3">
          {ofertas.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
              <p className="text-gray-500 text-sm">No hay ofertas pendientes.</p>
              <p className="text-gray-700 text-xs mt-1">Las ofertas aparecen al simular jornadas.</p>
            </div>
          ) : (
            ofertas.map(o => (
              <div
                key={o.id}
                className="rounded-xl p-4"
                style={{ background: '#12121F', border: '1px solid rgba(234,179,8,0.25)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: o.clubDestino.color1 }} />
                      <p className="text-xs text-gray-500">{o.clubDestino.nombre} ofrece por:</p>
                    </div>
                    <p className="text-white font-bold text-base">{o.jugador.nombre} {o.jugador.apellido}</p>
                    <p className="text-xs text-gray-500">{o.jugador.posicion} · {o.jugador.edad} años · OVR <span style={{ color: attrColor(overall(o.jugador)) }}>{overall(o.jugador)}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl" style={{ color: '#4ADE80' }}>{formatM(o.monto)}</p>
                    <p className="text-xs text-gray-600">Valor: {formatM(o.jugador.valor)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid #1E1E32' }}>
                  <button
                    onClick={() => handleResponder(o.id, 'rechazar')}
                    disabled={respondiendo === o.id}
                    className="flex-1 py-2 rounded-lg text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    style={{ background: '#1E1E32' }}
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleResponder(o.id, 'aceptar')}
                    disabled={respondiendo === o.id}
                    className="flex-1 py-2 rounded-lg text-white font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-opacity hover:opacity-90"
                    style={{ background: '#2D6A4F' }}
                  >
                    {respondiendo === o.id ? '...' : `Aceptar ${formatM(o.monto)}`}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Historial ─── */}
      {tab === 'historial' && (
        <div className="rounded-xl overflow-hidden" style={{ background: '#12121F', border: '1px solid #1E1E32' }}>
          {historial.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Sin transferencias registradas.</p>
          ) : (
            <div className="divide-y divide-gray-800/40">
              {historial.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{t.jugador.nombre} {t.jugador.apellido}</p>
                    <p className="text-xs text-gray-600">{t.clubOrigen?.nombre ?? 'Libre'} → {t.clubDestino.nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: '#4ADE80' }}>{formatM(t.monto)}</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={t.estado === 'aprobada'
                        ? { background: '#0D1F18', color: '#2D6A4F' }
                        : { background: '#1E1E32', color: '#6B7280' }
                      }
                    >
                      {t.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal confirmación compra */}
      {pendienteCompra && (
        <ConfirmModal
          jugador={pendienteCompra}
          onConfirm={handleConfirmarCompra}
          onClose={() => setPendienteCompra(null)}
          loading={comprando === pendienteCompra?.id}
        />
      )}

      {/* Toast éxito */}
      {toast && <SuccessToast jugador={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
