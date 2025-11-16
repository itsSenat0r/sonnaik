// Простой хук для работы с localStorage (альтернатива useAuth из контекста)
// Можно использовать для прямого доступа к localStorage без контекста

export const useLocalAuth = () => {
  const getUser = () => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const login = (username) => {
    const userData = {
      username,
      loggedAt: new Date().toISOString(),
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
  };

  const isAuthenticated = () => {
    return !!getUser();
  };

  return {
    getUser,
    login,
    logout,
    isAuthenticated,
  };
};

