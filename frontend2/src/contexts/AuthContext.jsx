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
  const login = async (username, password, email = null) => {
    try {
      // Пытаемся войти через API
      const response = await fetch('http://localhost:2717/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password: password || 'default' // Если пароль не передан, используем дефолтный
        })
      });

      if (response.ok) {
        const loginData = await response.json();
        // Предполагаем, что API возвращает access_token
        const accessToken = loginData.access_token || loginData.token || loginData;
        
        const userData = {
          username,
          email,
          loggedAt: new Date().toISOString(),
          access_token: accessToken
        };
        
        // Сохраняем токен авторизации в cookie
        const token = btoa(JSON.stringify(userData));
        setCookie('authToken', token, 7);
        
        // Также сохраняем в localStorage для обратной совместимости
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('authToken', token);
        setUser(userData);
        return userData;
      } else {
        // Если API недоступен или ошибка, используем локальную логику
        console.warn('Не удалось войти через API, используем локальную аутентификацию');
        const userData = {
          username,
          email,
          loggedAt: new Date().toISOString(),
        };
        
        const token = btoa(JSON.stringify(userData));
        setCookie('authToken', token, 7);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.warn('Ошибка при входе через API, используем локальную аутентификацию:', error);
      // Fallback на локальную логику
      const userData = {
        username,
        email,
        loggedAt: new Date().toISOString(),
      };
      
      const token = btoa(JSON.stringify(userData));
      setCookie('authToken', token, 7);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
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

