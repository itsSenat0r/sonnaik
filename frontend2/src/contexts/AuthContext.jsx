import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем пользователя из localStorage при монтировании
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Ошибка при чтении пользователя из localStorage:', e);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // Функция входа
  const login = (username, email = null) => {
    const userData = {
      username,
      email,
      loggedAt: new Date().toISOString(),
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
  };

  // Функция регистрации
  const register = (username, email, password) => {
    // Простая клиентская логика: сохраняем данные пользователя
    const userData = {
      username,
      email,
      registeredAt: new Date().toISOString(),
      loggedAt: new Date().toISOString(),
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Функция выхода
  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

