import React from 'react';
import { useChat } from '../hooks/useChat';
import ChatList from '../components/ChatList';
import ChatArea from '../components/ChatArea';
import InputPanel from '../components/InputPanel';
import { useAuth } from '../contexts/AuthContext';

function MainPage() {
  const { user } = useAuth();
  const { chats, activeChatId, messages, selectChat, sendMessage, createNewChat, deleteChat, isLoaded } = useChat(user?.username);

  // Убеждаемся, что chats - это массив
  const safeChats = Array.isArray(chats) ? chats : [];
  // Убеждаемся, что messages - это массив
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex h-screen bg-dark-bg">
      <ChatList chats={safeChats} activeChatId={activeChatId} onSelectChat={selectChat} onCreateNewChat={createNewChat} onDeleteChat={deleteChat} />
      <div className="flex-1 relative starfield">
        <ChatArea messages={safeMessages} />
        <InputPanel onSendMessage={sendMessage} />
      </div>
    </div>
  );
}

export default MainPage;
