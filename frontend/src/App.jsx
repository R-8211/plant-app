import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import PlantsPage from './pages/PlantsPage';
import PlantDetailPage from './pages/PlantDetailPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>読み込み中...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><PlantsPage /></PrivateRoute>} />
        <Route path="/plants/:id" element={<PrivateRoute><PlantDetailPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
