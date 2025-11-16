import React from 'react';

const LogoMoon = ({ size = 80 }) => {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Иконка луны с анимацией */}
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse"></div>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="relative z-10"
        >
          {/* Основной круг луны */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="#E8E8E8"
            className="drop-shadow-lg"
          />
          {/* Кратеры на луне */}
          <circle cx="35" cy="40" r="8" fill="#D0D0D0" opacity="0.6" />
          <circle cx="60" cy="45" r="6" fill="#D0D0D0" opacity="0.5" />
          <circle cx="50" cy="65" r="5" fill="#D0D0D0" opacity="0.4" />
          <circle cx="70" cy="60" r="4" fill="#D0D0D0" opacity="0.3" />
        </svg>
      </div>
      
      {/* Название с выделением последних букв */}
      <h1 className="text-5xl font-bold text-white mb-2">
        <span className="text-white">СОН</span>
        <span className="text-teal-400">НИК</span>
      </h1>
      
      {/* Подзаголовок */}
      <p className="text-gray-300 text-lg">Время познакомиться с собой</p>
    </div>
  );
};

export default LogoMoon;

