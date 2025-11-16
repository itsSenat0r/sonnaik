import React, { useState, useRef, useEffect } from 'react';

const InputPanel = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = true;
    recognition.interimResults = true; // Включаем промежуточные результаты для транскрибации

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (e) => {
      let interim = '';
      let final = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      // Показываем промежуточные результаты в реальном времени
      setInterimTranscript(interim);

      // Добавляем финальный результат к тексту
      if (final) {
        setInputValue(prev => prev + (prev ? ' ' : '') + final);
        setInterimTranscript('');
      }
    };

    recognition.onerror = (e) => {
      console.error('Ошибка распознавания речи:', e.error);
      setIsListening(false);
      setInterimTranscript('');
      
      if (e.error === 'no-speech') {
        // Игнорируем ошибку "нет речи"
        return;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleMicrophoneClick = () => {
    if (!recognitionRef.current) {
      alert('Ваш браузер не поддерживает распознавание речи. Пожалуйста, используйте современный браузер (Chrome, Edge).');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Ошибка при запуске распознавания:', error);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      setInterimTranscript('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-64 right-0 p-4 z-20 bg-gradient-to-t from-dark-bg via-dark-bg/95 to-transparent">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Индикатор транскрибации */}
        {isListening && (
          <div className="mb-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg animate-pulse">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Идёт запись...</span>
              {interimTranscript && (
                <span className="text-gray-300 italic ml-2">"{interimTranscript}"</span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-end gap-3">
          {/* Поле ввода */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Что снилось вам сегодня?"
              className="w-full bg-dark-card/90 backdrop-blur-sm text-white rounded-xl px-6 py-4 pr-24 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 placeholder-gray-400"
            />
            {/* Показываем промежуточный текст поверх инпута */}
            {interimTranscript && !inputValue && (
              <div className="absolute left-6 top-4 text-gray-500 italic pointer-events-none">
                {interimTranscript}
              </div>
            )}
          </div>

          {/* Кнопка микрофона */}
          <button
            type="button"
            onClick={handleMicrophoneClick}
            className={`
              relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50 animate-pulse' 
                : 'bg-dark-card/90 backdrop-blur-sm hover:bg-dark-card text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600'
              }
            `}
            title={isListening ? 'Остановить запись' : 'Голосовой ввод'}
          >
            {isListening ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`
              group relative flex items-center gap-2 px-6 py-4 rounded-xl font-medium
              transition-all duration-200 transform
              ${inputValue.trim()
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 active:scale-95'
                : 'bg-dark-card/50 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <span className="relative">
              Отправить
              <svg
                className={`
                  inline-block ml-2 w-4 h-4 transition-transform duration-200
                  ${inputValue.trim() ? 'group-hover:translate-x-1' : ''}
                `}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            
            {/* Эффект свечения при наведении */}
            {inputValue.trim() && (
              <span className="absolute inset-0 rounded-xl bg-teal-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-200"></span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputPanel;
