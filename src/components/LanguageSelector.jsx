import React from 'react';
import { Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LanguageSelector = () => {
  const { lang, setLang } = useAppContext();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
        <Globe size={18} />
        <span className="text-sm font-medium">{languages.find(l => l.code === lang)?.flag}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map(language => (
          <button
            key={language.code}
            onClick={() => setLang(language.code)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
              lang === language.code ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
            } ${language.code !== languages[languages.length - 1].code ? 'border-b border-gray-100' : ''}`}
          >
            <span className="text-xl">{language.flag}</span>
            <div>
              <div className="font-medium">{language.name}</div>
              <div className="text-xs text-gray-500">{language.code.toUpperCase()}</div>
            </div>
            {lang === language.code && (
              <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
