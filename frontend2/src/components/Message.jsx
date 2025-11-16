import React from 'react';

const Message = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-enter`}
    >
      <div
        className={`max-w-2xl rounded-2xl px-6 py-4 ${
          isUser
            ? 'bg-gray-600 text-white'
            : 'bg-dark-card/80 text-white backdrop-blur-sm'
        } shadow-lg`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.text}
        </div>
        {message.timestamp && (
          <div className="text-xs text-gray-400 mt-2">
            {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;

