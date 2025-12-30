import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const DarkModeToggle = ({ className = '', isMobile = false }) => {
  const { isDarkMode, toggleDarkMode } = useAppContext();

  if (isMobile) {
    return (
      <button
        onClick={toggleDarkMode}
        className={`relative w-8 h-12 rounded-full transition-all duration-500 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff8449] overflow-hidden ${className}`}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(180deg, #87CEEB 0%, #4FC3F7 50%, #29B6F6 100%)',
          borderRadius: '16px 12px 16px 12px'
        }}
      >
        {isDarkMode && (
          <>
            <div className="absolute top-1 left-2 text-white text-xs">⭐</div>
            <div className="absolute top-2 right-1 text-white text-xs opacity-70">✨</div>
            <div className="absolute bottom-2 left-1 text-white text-xs opacity-60">⭐</div>
          </>
        )}
        
        {!isDarkMode && (
          <>
            <div className="absolute top-1 right-1 text-white text-xs opacity-80">☁️</div>
            <div className="absolute bottom-1 left-1 text-white text-xs opacity-70">☁️</div>
          </>
        )}
        
        <div
          className={`absolute w-5 h-5 rounded-full shadow-lg transform transition-all duration-500 ease-in-out flex items-center justify-center text-sm left-1/2 -translate-x-1/2 ${
            isDarkMode ? 'translate-y-6 bg-gray-800' : 'translate-y-1 bg-white'
          }`}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={`relative w-20 h-10 rounded-full transition-all duration-500 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff8449] overflow-hidden ${className}`}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #87CEEB 0%, #4FC3F7 50%, #29B6F6 100%)',
        borderRadius: '25px 15px 25px 15px'
      }}
    >
      {isDarkMode && (
        <>
          <div className="absolute top-2 left-3 text-white text-xs">⭐</div>
          <div className="absolute top-1 left-6 text-white text-xs opacity-70">✨</div>
          <div className="absolute bottom-2 left-2 text-white text-xs opacity-60">⭐</div>
          <div className="absolute top-3 right-8 text-white text-xs opacity-80">✨</div>
        </>
      )}
      
      {!isDarkMode && (
        <>
          <div className="absolute top-1 right-3 text-white text-sm opacity-80">☁️</div>
          <div className="absolute bottom-1 left-3 text-white text-xs opacity-70">☁️</div>
        </>
      )}

      <div
        className={`absolute top-1 w-8 h-8 rounded-full shadow-lg transform transition-all duration-500 ease-in-out flex items-center justify-center text-lg ${
          isDarkMode ? 'translate-x-10 bg-gray-800' : 'translate-x-1 bg-white'
        }`}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

export default DarkModeToggle;