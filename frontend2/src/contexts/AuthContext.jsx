import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Вспомогательные функции для работы с cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем пользователя из cookie при монтировании
  useEffect(() => {
    const authToken = getCookie('authToken');
    if (authToken) {
      try {
        // Декодируем токен (предполагаем, что токен содержит данные пользователя в base64)
        // В реальном приложении токен должен быть JWT или другим форматом
        const decoded = JSON.parse(atob(authToken));
        setUser(decoded);
      } catch (e) {
        console.error('Ошибка при чтении токена из cookie:', e);
        deleteCookie('authToken');
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
    
    // Сохраняем токен авторизации в cookie
    // Кодируем данные пользователя в base64 для простоты (в реальном приложении должен быть JWT токен)
    const token = btoa(JSON.stringify(userData));
    setCookie('authToken', token, 7); // Токен действителен 7 дней
    
    // Также сохраняем в localStorage для обратной совместимости (если нужно)
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
    
    // Сохраняем токен авторизации в cookie
    const token = btoa(JSON.stringify(userData));
    setCookie('authToken', token, 7);
    
    // Также сохраняем в localStorage для обратной совместимости
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Функция выхода
  const logout = () => {
    deleteCookie('authToken');
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

