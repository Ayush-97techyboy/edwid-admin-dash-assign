import React, { useRef, useEffect, useState } from 'react';
import { Menu, Bell, Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

const getCategoryTranslation = (category, t) => {
  const categoryMap = {
    'Technology': t('categoryTechnology'),
    'Lifestyle': t('categoryLifestyle'),
    'Education': t('categoryEducation'),
    'Health': t('categoryHealth'),
    'Finance': t('categoryFinance')
  };
  return categoryMap[category] || category;
};

const TopBar = () => {
  const { t, i18n } = useTranslation();
  const { user, setIsSidebarOpen, isSidebarOpen, notifications, setNotifications, blogs, setReadingBlog } = useAppContext();
  const [searchInput, setSearchInput] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const notifRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const searchResults = searchInput.trim() 
    ? blogs.filter(b => !b.isDeleted).filter(blog => {
        const term = searchInput.toLowerCase();
        return (
          blog.title.toLowerCase().includes(term) ||
          (blog.author && blog.author.toLowerCase().includes(term)) ||
          (blog.category && blog.category.toLowerCase().includes(term))
        );
      }).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) setShowMobileSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (langRef.current && !langRef.current.contains(e.target)) setShowLang(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language);

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          <Menu size={24} />
        </button>
        
        <button onClick={() => setShowMobileSearch(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex items-center gap-2">
          <Search size={20} />
          <span className="text-sm text-gray-600">{t('searchBlogsMobile')}</span>
        </button>

        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t('searchAuthorCategoryTitle')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" 
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => searchInput.trim() && setShowSearchResults(true)}
            />
            
            {showSearchResults && searchInput.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map(blog => (
                      <div
                        key={blog.id}
                        onClick={() => {
                          setReadingBlog(blog);
                          setSearchInput('');
                          setShowSearchResults(false);
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3"
                      >
                        <img src={blog.image} alt={blog.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{blog.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{blog.author || 'Unknown'}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{getCategoryTranslation(blog.category, t)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">{t('noResultsFound')}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {showMobileSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setShowMobileSearch(false)}>
            <div className="absolute top-0 left-0 right-0 bg-white rounded-b-xl shadow-xl" ref={mobileSearchRef} onClick={(e) => e.stopPropagation()}>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowMobileSearch(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                    <Search size={24} />
                  </button>
                  <input 
                    type="text" 
                    placeholder={t('searchBlogsMobile')}
                    autoFocus
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button onClick={() => { setSearchInput(''); setShowMobileSearch(false); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">✕</button>
                </div>
                {searchInput.trim() && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map(blog => (
                        <div
                          key={blog.id}
                          onClick={() => {
                            setReadingBlog(blog);
                            setSearchInput('');
                            setShowMobileSearch(false);
                          }}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 rounded-lg border border-gray-100"
                        >
                          <img src={blog.image} alt={blog.title} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{blog.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{blog.author || 'Unknown'}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{getCategoryTranslation(blog.category, t)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">{t('noResultsFound')}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end text-sm">
          <span className="text-gray-700 font-medium">
            {dateTime.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Kolkata' })}
          </span>
          <span className="text-gray-500 text-xs">
            {dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
          </span>
        </div>

        <div className="relative" ref={langRef}>
          <button onClick={() => setShowLang(!showLang)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex items-center gap-2 text-sm">
            <span>{currentLang?.flag}</span>
            <span>{currentLang?.code.toUpperCase()}</span>
          </button>
          {showLang && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    i18n.changeLanguage(l.code);
                    setShowLang(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span>{l.flag}</span>
                    <span className="text-gray-700">{l.code.toUpperCase()}</span>
                    <span className="text-gray-500">{l.name}</span>
                  </span>
                  {i18n.language === l.code && <Check size={16} className="text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotif(!showNotif)} className="p-2 relative hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{t('notifications')}</h3>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    {t('clearAll')}
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div key={idx} className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex gap-3 ${notif.type === 'success' ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <span className="text-lg flex-shrink-0">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                      </div>
                      {notif.type === 'success' && <Check size={16} className="text-green-600 flex-shrink-0 mt-1" />}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">{t('noNotifications')}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">{user?.email?user.email[0]:'G'}</div>
      </div>
    </header>
  );
};
export default TopBar;
