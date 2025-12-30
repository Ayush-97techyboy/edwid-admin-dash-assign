import React from 'react';
import { Globe, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

const SettingsView = () => {
  const { user, handleLogout } = useAppContext();
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'hi', name: 'हिंदी', flag: 'IN' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{t('settings')}</h2>
      
      <div className="theme-bg-secondary p-6 rounded-xl border flex items-center gap-6">
        <div className="h-20 w-20 bg-[#ff8449] rounded-full flex items-center justify-center font-bold text-2xl text-white overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user?.email ? user.email[0].toUpperCase() : 'G'
          )}
        </div>
        <div>
          <p className="text-sm theme-text-secondary">EMAIL</p>
          <p className="font-bold text-lg">{user?.email || "Guest"}</p>
          {user?.displayName && (
            <>
              <p className="text-sm theme-text-secondary mt-2">NAME</p>
              <p className="font-medium">{user.displayName}</p>
            </>
          )}
        </div>
      </div>

      <div className="theme-bg-secondary p-6 rounded-xl border">
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
                  ? 'bg-[#ff8449] border-[#ff8449] text-white' 
                  : 'theme-bg-secondary theme-border theme-text-primary hover:border-gray-400'
                }`}
            >
              <img 
                src={`https://flagcdn.com/w20/${lang.flag.toLowerCase()}.png`}
                alt={lang.name}
                className="w-5 h-4 rounded-sm object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline-flex';
                }}
              />
              <span className="hidden w-5 h-4 rounded-sm bg-gray-200 items-center justify-center text-xs font-bold">
                {lang.flag}
              </span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="md:hidden mt-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          <LogOut size={18} />
          {t('logout') || 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
