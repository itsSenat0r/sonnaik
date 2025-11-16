import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChatList = ({ chats, activeChatId, onSelectChat, onCreateNewChat, onDeleteChat }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [menuOpenChatId, setMenuOpenChatId] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewChat = () => {
    onCreateNewChat();
    setSearchQuery(''); // Очищаем поиск при создании нового чата
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation(); // Предотвращаем выбор чата при клике на удаление
    onDeleteChat(chatId);
    setMenuOpenChatId(null);
  };

  const handleMenuToggle = (chatId, e) => {
    e.stopPropagation(); // Предотвращаем выбор чата при клике на меню
    setMenuOpenChatId(menuOpenChatId === chatId ? null : chatId);
  };

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Проверяем, что клик был вне меню
      const menuElement = document.querySelector(`[data-menu-id="${menuOpenChatId}"]`);
      if (menuElement && !menuElement.contains(e.target)) {
        setMenuOpenChatId(null);
      }
    };
    
    if (menuOpenChatId) {
      // Небольшая задержка, чтобы не закрыть меню сразу при открытии
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpenChatId]);

  // Фильтруем чаты по поисковому запросу
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  return (
    <div className="flex flex-col h-screen w-64 bg-dark-panel border-r border-gray-700">
      {/* Кнопка "Новый диалог" */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={handleNewChat}
          className="w-full bg-dark-card/80 hover:bg-dark-card text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center gap-2 border border-white/10 shadow-sm hover:shadow-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="font-medium">Новый диалог</span>
        </button>
      </div>

      {/* Поиск */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card text-white placeholder-gray-400 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
              title="Очистить поиск"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            История диалогов пуста
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            Ничего не найдено
          </div>
        ) : (
          filteredChats.map((chat) => {
            // Получаем последнее сообщение для отображения
            const lastMessage = chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].text
              : '';
            
            const isHovered = hoveredChatId === chat.id;
            const isMenuOpen = menuOpenChatId === chat.id;
            
            return (
              <div
                key={chat.id}
                className={`relative group border-b border-gray-700 hover:bg-dark-card transition-colors ${
                  activeChatId === chat.id
                    ? 'bg-teal-900/30 border-l-4 border-teal-500'
                    : ''
                }`}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full text-left p-4"
                >
                  <div className="font-medium text-white mb-1 pr-8">{chat.title}</div>
                  {lastMessage && (
                    <div className="text-sm text-gray-400 truncate pr-8">
                      {lastMessage}
                    </div>
                  )}
                </button>
                
                {/* Кнопка с тремя точками - показывается при наведении */}
                {isHovered && (
                  <button
                    onClick={(e) => handleMenuToggle(chat.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    title="Меню"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                )}
                
                {/* Меню удаления - показывается при клике на три точки */}
                {isMenuOpen && (
                  <div 
                    data-menu-id={chat.id}
                    className="absolute right-2 top-full mt-1 bg-dark-card border border-gray-700 rounded-lg shadow-lg z-30 min-w-[120px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-dark-panel hover:text-red-300 transition-colors flex items-center gap-2 rounded-lg"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Удалить</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Профиль */}
      <div className="p-4 border-t border-gray-700 bg-dark-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium truncate">
              {user?.username || 'Пользователь'}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {user?.email || (user?.loggedAt ? new Date(user.loggedAt).toLocaleDateString('ru-RU') : '')}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-dark-panel"
        >
          Выйти
        </button>
      </div>
    </div>
  );
};

export default ChatList;

