import { useState, useCallback, useEffect, useRef } from 'react';
import { useChatStorage } from './useChatStorage';

// Функция для генерации уникального ID
const generateId = () => {
  return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Функция для генерации названия из первых трёх слов
const generateChatTitle = (text) => {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const firstThreeWords = words.slice(0, 3);
  return firstThreeWords.join(' ') || 'Новый диалог';
};

export const useChat = (username) => {
  const { chats: storedChats, setChats, isLoaded, deleteChat: deleteChatFromStorage } = useChatStorage(username);
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Синхронизируем messages при изменении активного чата или загрузке истории
  // Используем ref для отслеживания, обновляем ли мы сообщения вручную
  const isUpdatingMessagesRef = useRef(false);
  
  useEffect(() => {
    // Не синхронизируем, если мы обновляем сообщения вручную (во время streaming)
    if (isUpdatingMessagesRef.current) {
      return;
    }
    
    if (isLoaded && activeChatId) {
      const chat = storedChats.find(c => c.id === activeChatId);
      setMessages(chat?.messages || []);
    } else if (isLoaded && !activeChatId) {
      setMessages([]);
    }
  }, [activeChatId, storedChats, isLoaded]);

  // Создание нового диалога
  const createNewChat = useCallback(() => {
    const newChatId = generateId();
    const newChat = {
      id: newChatId,
      title: '', // Пока пусто, заполнится после первого сообщения
      messages: [],
    };

    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChatId);
    setMessages([]);
  }, [setChats]);

  const selectChat = useCallback((chatId) => {
    setActiveChatId(chatId);
    const chat = storedChats.find(c => c.id === chatId);
    setMessages(chat?.messages || []);
  }, [storedChats]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    // Если нет активного чата, создаём новый
    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = generateId();
      const newChat = {
        id: currentChatId,
        title: '',
        messages: [],
      };
      setChats(prev => [...prev, newChat]);
      setActiveChatId(currentChatId);
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Добавляем сообщение пользователя в локальное состояние
    setMessages(prev => [...prev, userMessage]);
    
    // Обновляем чат в массиве чатов с автоматическим сохранением
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages, userMessage];
          // Если это первое сообщение - генерируем название
          const shouldGenerateTitle = chat.messages.length === 0;
          return {
            ...chat,
            messages: updatedMessages,
            title: shouldGenerateTitle ? generateChatTitle(text.trim()) : chat.title,
          };
        }
        return chat;
      });
    });

    // Генерируем ответ ассистента через streaming
    const generateResponse = async () => {
      try {
        // Создаем сообщение-заглушку для ассистента, которое будем обновлять
        const assistantMessageId = `assistant-${Date.now()}`;
        const assistantMessage = {
          id: assistantMessageId,
          type: 'assistant',
          text: '',
          timestamp: new Date().toISOString(),
        };
        
        // Добавляем пустое сообщение ассистента в локальное состояние и в чат
        setMessages(prev => [...prev, assistantMessage]);
        
        // Также добавляем в чат сразу
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === currentChatId) {
              return {
                ...chat,
                messages: [...(chat.messages || []), assistantMessage],
              };
            }
            return chat;
          });
        });
        
        // Импортируем функцию для streaming
        const { callOllamaStream } = await import('../api/callOllamaStream');
        
        // Собираем полный ответ по частям
        let fullResponse = '';
        
        // Устанавливаем флаг, что мы обновляем сообщения вручную
        isUpdatingMessagesRef.current = true;
        
        try {
          console.log('Начало streaming ответа');
          // Обрабатываем streaming ответ
          for await (const chunk of callOllamaStream(text)) {
            fullResponse += chunk;
            console.log('Получен chunk, текущая длина ответа:', fullResponse.length);
            
            // Обновляем сообщение ассистента в реальном времени в обоих местах
            const updatedMessage = { ...assistantMessage, text: fullResponse };
            
            setMessages(prev => {
              const updated = prev.map(msg => {
                if (msg.id === assistantMessageId) {
                  return updatedMessage;
                }
                return msg;
              });
              console.log('Обновлены messages, количество:', updated.length);
              return updated;
            });
            
            // Также обновляем в чате
            setChats(prevChats => {
              return prevChats.map(chat => {
                if (chat.id === currentChatId) {
                  const updatedMessages = (chat.messages || []).map(msg => {
                    if (msg.id === assistantMessageId) {
                      return updatedMessage;
                    }
                    return msg;
                  });
                  return {
                    ...chat,
                    messages: updatedMessages,
                  };
                }
                return chat;
              });
            });
          }
          console.log('Streaming завершен, полный ответ:', fullResponse.substring(0, 100) + '...');
        } finally {
          // Снимаем флаг после завершения streaming
          isUpdatingMessagesRef.current = false;
        }
      } catch (error) {
        // Сбрасываем флаг при ошибке
        isUpdatingMessagesRef.current = false;
        
        console.error('Ошибка при получении ответа от сервера:', error);
        // В случае ошибки добавляем сообщение об ошибке
        const errorMessage = {
          id: `assistant-error-${Date.now()}`,
          type: 'assistant',
          text: 'Извините, произошла ошибка при получении ответа. Попробуйте еще раз.',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // Также добавляем в чат
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === currentChatId) {
              const currentMessages = chat.messages || [];
              return {
                ...chat,
                messages: [...currentMessages, errorMessage],
              };
            }
            return chat;
          });
        });
      }
    };

    generateResponse();
  }, [activeChatId, setChats]);

  // Функция удаления чата
  const deleteChat = useCallback(async (chatId) => {
    // Удаляем из локального состояния
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    
    // Если удаляемый чат был активным, очищаем активный чат
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
    
    // Удаляем из БД
    if (deleteChatFromStorage) {
      await deleteChatFromStorage(chatId).catch(err => 
        console.warn('Не удалось удалить чат из БД:', err)
      );
    }
  }, [activeChatId, setChats, deleteChatFromStorage]);

  const activeChat = Array.isArray(storedChats) 
    ? storedChats.find(chat => chat && chat.id === activeChatId)
    : null;

  // Фильтруем чаты: показываем только те, у которых есть название (т.е. было хотя бы одно сообщение)
  const visibleChats = Array.isArray(storedChats)
    ? storedChats.filter(chat => 
        chat && 
        chat.title && 
        typeof chat.title === 'string' && 
        Array.isArray(chat.messages) && 
        chat.messages.length > 0
      )
    : [];

  return {
    chats: visibleChats,
    activeChatId,
    activeChat,
    messages: Array.isArray(messages) ? messages : [],
    selectChat,
    sendMessage,
    createNewChat,
    deleteChat,
    isLoaded, // Для индикации загрузки истории
  };
};

