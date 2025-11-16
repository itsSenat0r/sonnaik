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
      'Интересный сон... Давайте разберём его значение. Сны часто отражают наши внутренние переживания и эмоции. Что именно в этом сне вызвало у вас сильные чувства?',
      'Это может означать несколько вещей. Сны о подобных ситуациях обычно связаны с нашими страхами, желаниями или нерешёнными вопросами. Попробуйте вспомнить детали — они могут быть важны.',
      'Спасибо, что поделились. Интерпретация снов — это всегда индивидуальный процесс. Важно, какие эмоции вы испытывали во сне и после пробуждения. Что вы чувствовали?',
      'Удивительно! Такой сон может символизировать переходный период в вашей жизни. Обратите внимание на цвета, которые вы видели — они часто несут важную информацию о вашем эмоциональном состоянии.',
      'Интересная интерпретация... В сонниках подобные образы часто связаны с подсознательными желаниями. Попробуйте подумать: что этот сон может говорить о ваших невысказанных потребностях?',
      'Сны — это язык нашего подсознания. То, что вы описали, может указывать на скрытые аспекты вашей личности или нерешённые конфликты. Какие ассоциации у вас возникают при воспоминании этого сна?',
      'Очень символичный сон! Каждый элемент может иметь своё значение. Попробуйте разобрать его по частям: где вы находились, кто был рядом, какие действия происходили?',
      'Это напоминает классический сюжет из сонников. Подобные сны часто приходят в моменты важных жизненных решений. Есть ли сейчас в вашей жизни ситуация, требующая выбора?',
      'Интригующе! Сны такого типа могут быть предупреждением или подсказкой от вашего подсознания. Обратите внимание на повторяющиеся элементы — они особенно значимы.',
      'Спасибо за доверие. Интерпретация снов требует внимания к деталям. Расскажите подробнее: какие звуки, запахи или тактильные ощущения вы помните? Это поможет глубже понять смысл.',
      'Интересный образ! В различных традициях толкования снов подобные символы могут иметь разные значения. Что для вас лично означают эти образы? Ваша интуиция часто подсказывает верный ответ.',
      'Сны — это мост между сознанием и подсознанием. То, что вы описали, может отражать ваши внутренние конфликты или невыраженные эмоции. Попробуйте вести дневник снов — это поможет увидеть закономерности.',
      'Увлекательный сюжет! Подобные сны часто приходят, когда мы переживаем изменения в жизни. Связываете ли вы этот сон с какими-то событиями в реальности?',
      'Каждый сон уникален, как и человек, который его видит. Важно не только то, что происходило во сне, но и как вы на это реагировали. Какие действия вы предпринимали во сне?',
      'Это может быть отражением ваших творческих способностей или нереализованного потенциала. Сны часто показывают нам возможности, которые мы не замечаем в бодрствующем состоянии.',
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

