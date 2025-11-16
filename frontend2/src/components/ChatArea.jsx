import React, { useRef, useEffect } from 'react';
import Message from './Message';

const ChatArea = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Логотип */}
      <div className="absolute top-4 right-4 z-10">
        <div className="text-2xl font-bold text-white">СОННИК</div>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-lg">Начните диалог, чтобы получить интерпретацию вашего сна</p>
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

