import { useState, useCallback, useEffect } from 'react';
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
  // Используем хук для работы с localStorage
  const { chats: storedChats, setChats, isLoaded } = useChatStorage(username);
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Синхронизируем messages при изменении активного чата или загрузке истории
  useEffect(() => {
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

    // Генерируем ответ ассистента через небольшую задержку
    setTimeout(() => {
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        text: generateMockResponse(text),
        timestamp: new Date().toISOString(),
      };
      
      // Добавляем сообщение ассистента в локальное состояние
      setMessages(prev => [...prev, assistantMessage]);
      
      // Обновляем чат с ответом ассистента с автоматическим сохранением
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === currentChatId) {
            // Добавляем сообщение ассистента к существующим сообщениям чата
            const currentMessages = chat.messages || [];
            return {
              ...chat,
              messages: [...currentMessages, assistantMessage],
            };
          }
          return chat;
        });
      });
    }, 1000);
  }, [activeChatId, setChats]);

  const generateMockResponse = (userText) => {
    const responses = [
      'Этот сон может отражать ваши скрытые эмоции и внутренние переживания, о которых вы редко думаете в повседневной жизни. Он предлагает обратить внимание на те аспекты себя, которые требуют понимания и принятия. Возможно, это сигнал к тому, чтобы более осознанно относиться к своим решениям и чувствам. Сон может быть подсказкой, что сейчас время пересмотреть приоритеты и научиться отпускать лишнее.',
      'Этот сон символизирует период перемен или развития, через который вы проходите. Он отражает ваши сомнения и надежды, а также желание понять собственные возможности. Иногда сновидение служит способом подготовить вас к будущим событиям, подсказать, на что стоит обратить внимание и чему стоит доверять в себе и своих решениях.',
      'Сновидение может указывать на скрытые ресурсы или таланты, которые вы пока не используете. Оно призывает прислушиваться к своим ощущениям и интуиции, чтобы принимать более осознанные решения. Подсознание часто показывает такие образы, чтобы дать возможность лучше понять себя и увидеть новые перспективы.',
      'Этот сон может быть отражением эмоционального состояния или внутреннего поиска гармонии. Он подсказывает, что сейчас важно уделять внимание собственным чувствам и не игнорировать внутренние сигналы. Иногда сновидение помогает осознать страхи или ограничения, которые мешают действовать, и предлагает возможность отпустить их.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Функция удаления чата
  const deleteChat = useCallback((chatId) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    
    // Если удаляемый чат был активным, очищаем активный чат
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  }, [activeChatId, setChats]);

  const activeChat = storedChats.find(chat => chat.id === activeChatId);

  // Фильтруем чаты: показываем только те, у которых есть название (т.е. было хотя бы одно сообщение)
  const visibleChats = storedChats.filter(chat => chat.title && chat.messages.length > 0);

  return {
    chats: visibleChats,
    activeChatId,
    activeChat,
    messages,
    selectChat,
    sendMessage,
    createNewChat,
    deleteChat,
    isLoaded, // Для индикации загрузки истории
  };
};

