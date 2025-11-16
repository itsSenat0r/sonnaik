import React from 'react';
import { useChat } from '../hooks/useChat';
import ChatList from '../components/ChatList';
import ChatArea from '../components/ChatArea';
import InputPanel from '../components/InputPanel';
import { useAuth } from '../contexts/AuthContext';

function MainPage() {
  const { user } = useAuth(); // Получаем информацию о пользователе из контекста
  const { chats, activeChatId, messages, selectChat, sendMessage, createNewChat, deleteChat, isLoaded } = useChat(user?.username);

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Левая панель */}
      <ChatList
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onCreateNewChat={createNewChat}
        onDeleteChat={deleteChat}
      />

      {/* Центральная область с диалогом */}
      <div className="flex-1 relative starfield">
        <ChatArea messages={messages} />
        <InputPanel onSendMessage={sendMessage} />
      </div>
    </div>
  );
}

export default MainPage;

