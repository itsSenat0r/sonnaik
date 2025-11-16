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

    try {
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
  }, [username, storageKey]);

  // Функция для обновления чатов с автоматическим сохранением
  const setChats = useCallback((updater) => {
    setChatsState((prevChats) => {
      let newChats;
      if (typeof updater === 'function') {
        newChats = updater(prevChats);
      } else {
        newChats = updater;
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

  return {
    chats,
    setChats,
    isLoaded,
  };
};

