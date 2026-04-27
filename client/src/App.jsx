import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import SeleccionClub from './pages/SeleccionClub.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Plantel from './pages/Plantel.jsx';
import Jornada from './pages/Jornada.jsx';
import Tabla from './pages/Tabla.jsx';
import Transferencias from './pages/Transferencias.jsx';
import Formacion from './pages/Formacion.jsx';
import Entrenamiento from './pages/Entrenamiento.jsx';

export default function App() {
  const [clubId, setClubId] = useState(() => {
    const stored = localStorage.getItem('rma_clubId');
    return stored ? parseInt(stored) : null;
  });

  const handleSelectClub = (id) => {
    localStorage.setItem('rma_clubId', id);
    setClubId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('rma_clubId');
    setClubId(null);
  };

  if (!clubId) {
    return <SeleccionClub onSelect={handleSelectClub} />;
  }

  return (
    <Layout clubId={clubId} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard clubId={clubId} />} />
        <Route path="/plantel" element={<Plantel clubId={clubId} />} />
        <Route path="/jornada" element={<Jornada clubId={clubId} />} />
        <Route path="/tabla" element={<Tabla clubId={clubId} />} />
        <Route path="/transferencias" element={<Transferencias clubId={clubId} />} />
        <Route path="/formacion" element={<Formacion clubId={clubId} />} />
        <Route path="/entrenamiento" element={<Entrenamiento clubId={clubId} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
