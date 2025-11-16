import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import MainPage from './pages/MainPage';

// Компонент для защиты маршрутов - требует авторизации
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Показываем загрузку пока проверяем localStorage
    return (
      <div className="min-h-screen flex items-center justify-center starfield">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  // Если не авторизован - редирект на /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Компонент для редиректа авторизованных пользователей с /login на /
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center starfield">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  // Если авторизован и пытается зайти на /login - редирект на /
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публичный маршрут: страница входа */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            }
          />

          {/* Защищённый маршрут: главная страница диалога */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />

          {/* Редирект всех остальных маршрутов на / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
