import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoMoon from './LogoMoon';

const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Валидация для входа
    if (!isSignUp) {
      if (!username.trim()) {
        setError('Введите имя пользователя');
        return;
      }
    } else {
      // Валидация для регистрации
      if (!username.trim()) {
        setError('Введите имя пользователя');
        return;
      }
      if (!email.trim()) {
        setError('Введите почту');
        return;
      }
      // Простая валидация email
      if (!email.includes('@') || !email.includes('.')) {
        setError('Введите корректный адрес почты');
        return;
      }
      if (!password.trim() || password.length < 3) {
        setError('Пароль должен содержать минимум 3 символа');
        return;
      }
    }

    setIsSubmitting(true);

    // Имитация задержки для UX
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      if (isSignUp) {
        // Регистрация
        register(username.trim(), email.trim(), password);
      } else {
        // Вход
        login(username.trim());
      }
      
      // Переход на главную страницу после успешного входа/регистрации
      navigate('/', { replace: true });
    } catch (err) {
      setError(isSignUp ? 'Произошла ошибка при регистрации' : 'Произошла ошибка при входе');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Мок-функция для социального входа
    // В реальном приложении здесь будет интеграция с OAuth
    setError('');
    setIsSubmitting(true);
    
    setTimeout(() => {
      const mockUsername = provider === 'google' ? 'Google User' : 'VK User';
      const mockEmail = provider === 'google' ? 'user@gmail.com' : 'user@vk.com';
      login(mockUsername, mockEmail);
      navigate('/', { replace: true });
      setIsSubmitting(false);
    }, 500);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center starfield p-4">
      <div className="w-full max-w-md">
        {/* Логотип и заголовок */}
        <div className="flex justify-center mb-12">
          <LogoMoon size={100} />
        </div>

        {/* Форма входа/регистрации */}
        <div className="bg-dark-card/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Контейнер для полей ввода и кнопки */}
            <div className="flex gap-3">
              {/* Основные поля ввода */}
              <div className="flex-1 space-y-4">
                {/* Поле имени пользователя */}
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    onFocus={() => setError('')}
                    placeholder="Имя пользователя"
                    className="w-full bg-dark-panel/80 text-white placeholder-gray-400 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-dark-panel transition-all duration-200 border border-white/10"
                    disabled={isSubmitting}
                    autoComplete="username"
                  />
                </div>

                {/* Поле почты (только для регистрации) */}
                {isSignUp && (
                  <div className="animate-fade-in">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      onFocus={() => setError('')}
                      placeholder="Почта"
                      className="w-full bg-dark-panel/80 text-white placeholder-gray-400 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-dark-panel transition-all duration-200 border border-white/10"
                      disabled={isSubmitting}
                      autoComplete="email"
                    />
                  </div>
                )}

                {/* Поле пароля */}
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль"
                    className="w-full bg-dark-panel/80 text-white placeholder-gray-400 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-dark-panel transition-all duration-200 border border-white/10"
                    disabled={isSubmitting}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                </div>
              </div>

              {/* Вертикальная кнопка отправки */}
              <button
                type="submit"
                disabled={isSubmitting || !username.trim() || (isSignUp && (!email.trim() || !password.trim()))}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl px-6 self-stretch transition-all duration-200 flex items-center justify-center min-w-[60px] shadow-lg hover:shadow-teal-500/50 active:scale-95"
                title={isSignUp ? "Зарегистрироваться" : "Войти"}
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Сообщение об ошибке */}
            {error && (
              <div className="text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Кнопки социального входа */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isSubmitting}
                className="flex-1 bg-dark-panel/80 hover:bg-dark-panel text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm">Войти через</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('vk')}
                disabled={isSubmitting}
                className="flex-1 bg-dark-panel/80 hover:bg-dark-panel text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm">Войти через VK ID</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#0077FF"/>
                  <path d="M13.162 18.994c.609 0 .858-.406.851-.915-.008-.526-.282-.717-.653-1.177l-3.4-3.724c-.198-.217-.282-.326-.282-.566 0-.315.239-.566.653-.566.239 0 .413.109.653.326l2.956 2.543c.239.217.413.326.653.326.413 0 .653-.217.653-.566 0-.217-.044-.326-.239-.543l-2.956-2.543c-.198-.217-.282-.326-.653-.326-.413 0-.653.217-.653.566 0 .24.084.349.282.566l3.4 3.724c.37.46.653.651.653 1.177 0 .509-.242.915-.851.915H10.5c-.413 0-.653-.217-.653-.566 0-.315.24-.566.653-.566h2.662z" fill="white"/>
                </svg>
              </button>
            </div>

            {/* Ссылка на регистрацию/вход */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-teal-400 hover:text-teal-300 text-sm transition-colors duration-200 underline"
              >
                {isSignUp
                  ? 'Уже есть аккаунт? Войдите'
                  : 'Нет аккаунта? Зарегистрируйтесь'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
