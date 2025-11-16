import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для работы с сохранением истории чатов в localStorage
 * @param {string} username - Имя пользователя для привязки истории
 * @returns {{ chats: Array, setChats: Function }} - Массив чатов и функция для обновления
 */
export const useChatStorage = (username) => {
  const [chats, setChatsState] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ключ для localStorage
  const storageKey = `history_${username}`;

  // Загрузка истории при монтировании или изменении username
  useEffect(() => {
    if (!username) {
      setChatsState([]);
      setIsLoaded(true);
      return;
    }

    const loadChats = () => {
      try {
        // Загружаем из localStorage
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedChats = JSON.parse(stored);
          // Валидация данных
          if (Array.isArray(parsedChats)) {
            setChatsState(parsedChats);
          } else {
            console.warn('Некорректный формат истории чатов, создаём пустой массив');
            setChatsState([]);
          }
        } else {
          setChatsState([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке истории чатов:', error);
        setChatsState([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadChats();
  }, [username, storageKey]);

  // Функция для обновления чатов с автоматическим сохранением
  const setChats = useCallback((updater) => {
    setChatsState((prevChats) => {
      let newChats;
      if (typeof updater === 'function') {
        newChats = updater(Array.isArray(prevChats) ? prevChats : []);
      } else {
        newChats = updater;
      }

      // Убеждаемся, что newChats - это массив
      if (!Array.isArray(newChats)) {
        console.warn('setChats получил не массив, преобразуем в пустой массив');
        newChats = [];
      }

      // Сохраняем в localStorage только если username есть и данные загружены
      if (username && isLoaded) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newChats));
        } catch (error) {
          console.error('Ошибка при сохранении истории чатов:', error);
        }
      }

      return newChats;
    });
  }, [username, storageKey, isLoaded]);

  // Функция для удаления чата
  const deleteChat = useCallback(async (chatId) => {
    // Удаление происходит через setChats, который автоматически сохраняет в localStorage
  }, []);

  return {
    chats,
    setChats,
    isLoaded,
    deleteChat,
  };
};

