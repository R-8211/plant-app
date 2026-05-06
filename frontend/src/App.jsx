import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const PlantsPage = lazy(() => import('./pages/PlantsPage'));
const PlantDetailPage = lazy(() => import('./pages/PlantDetailPage'));

function LoadingScreen() {
  return <div className="loading-screen">読み込み中...</div>;
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><PlantsPage /></PrivateRoute>} />
            <Route path="/plants/:id" element={<PrivateRoute><PlantDetailPage /></PrivateRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
