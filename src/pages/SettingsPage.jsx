import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

const SettingsView = () => {
  const { user } = useAppContext();
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{t('settings')}</h2>
      
      <div className="bg-white p-6 rounded-xl border flex items-center gap-6">
        <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-2xl">
          {user.email ? user.email[0] : 'G'}
        </div>
        <div>
          <p className="text-sm text-gray-500">EMAIL</p>
          <p className="font-bold text-lg">{user.email || "Guest"}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border">
        <h3 className="font-bold mb-4 flex gap-2">
          <Globe /> {t('language') || 'Language'}
        </h3>
        <div className="flex flex-wrap gap-3">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`px-4 py-2 border rounded-lg font-medium transition-all flex items-center gap-2
                ${i18n.language === lang.code 
                  ? 'bg-indigo-100 border-indigo-600 text-indigo-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
