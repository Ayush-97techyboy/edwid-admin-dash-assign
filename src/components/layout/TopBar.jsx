import React, { useRef, useEffect, useState } from 'react';
import { Menu, Bell, Check, Search, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import DarkModeToggle from '../ui/DarkModeToggle';

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
  const { user, setIsSidebarOpen, isSidebarOpen, notifications, setNotifications, blogs, setReadingBlog, setActiveTab, handleLogout } = useAppContext();
  const [searchInput, setSearchInput] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const notifRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

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
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'hi', name: 'हिंदी', flag: 'IN' },
  ];

  const handleNotificationClick = (notif) => {
    if (notif.action && notif.action.type === 'navigate') {
      setActiveTab(notif.action.target);
      setShowNotif(false);
    }
  };

  const handleProfileClick = () => {
    setActiveTab('settings');
    setShowProfile(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language);

  return (
    <header className="theme-bg-secondary theme-border border-b h-16 flex items-center justify-between px-6 z-10 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 theme-hover rounded-lg theme-text-secondary">
          <Menu size={24} />
        </button>
        
        <button onClick={() => setShowMobileSearch(true)} className="md:hidden p-2 theme-hover rounded-lg theme-text-secondary flex items-center gap-2">
          <Search size={20} />
          <span className="text-sm theme-text-secondary">{t('searchBlogsMobile')}</span>
        </button>

        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t('searchAuthorCategoryTitle')}
                className="w-full pl-10 pr-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-[#ff8449] text-sm theme-bg-secondary theme-text-primary" 
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => searchInput.trim() && setShowSearchResults(true)}
              />
            
            {showSearchResults && searchInput.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 theme-bg-secondary rounded-lg shadow-xl theme-border border z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="divide-y theme-border">
                    {searchResults.map(blog => (
                      <div
                        key={blog.id}
                        onClick={() => {
                          setReadingBlog(blog);
                          setSearchInput('');
                          setShowSearchResults(false);
                        }}
                        className="px-4 py-3 theme-hover cursor-pointer transition-colors flex gap-3"
                      >
                        <img src={blog.image} alt={blog.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold theme-text-primary line-clamp-1">{blog.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs theme-text-secondary">{blog.author || 'Unknown'}</span>
                            <span className="text-xs theme-text-secondary">•</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{getCategoryTranslation(blog.category, t)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center theme-text-secondary text-sm">{t('noResultsFound')}</div>
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
                    className="flex-1 px-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-[#ff8449] text-sm theme-bg-secondary theme-text-primary" 
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
          <span className="theme-text-primary font-medium transition-colors duration-300">
            {dateTime.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Kolkata' })}
          </span>
          <span className="theme-text-secondary text-xs transition-colors duration-300">
            {dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
          </span>
        </div>

        <DarkModeToggle className="hidden sm:block" />

        <div className="sm:hidden">
          <DarkModeToggle isMobile={true} />
        </div>

        <div className="relative" ref={langRef}>
          <button onClick={() => setShowLang(!showLang)} className="p-2 theme-hover rounded-lg theme-text-secondary flex items-center gap-2 text-sm">
            <img 
              src={`https://flagcdn.com/w20/${languages.find(l => l.code === i18n.language)?.flag.toLowerCase()}.png`}
              alt={languages.find(l => l.code === i18n.language)?.name}
              className="w-5 h-4 rounded-sm object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span className="hidden w-5 h-4 rounded-sm bg-gray-200 flex items-center justify-center text-xs font-bold">
              {languages.find(l => l.code === i18n.language)?.flag}
            </span>
            <span>{languages.find(l => l.code === i18n.language)?.code.toUpperCase()}</span>
          </button>
          {showLang && (
            <div className="absolute right-0 mt-2 w-56 theme-bg-secondary rounded-xl shadow-xl theme-border border z-50 py-2">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    i18n.changeLanguage(l.code);
                    setShowLang(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm theme-hover flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <img 
                      src={`https://flagcdn.com/w20/${l.flag.toLowerCase()}.png`}
                      alt={l.name}
                      className="w-5 h-4 rounded-sm object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline-flex';
                      }}
                    />
                    <span className="hidden w-5 h-4 rounded-sm bg-gray-200 items-center justify-center text-xs font-bold">
                      {l.flag}
                    </span>
                    <span className="theme-text-primary">{l.code.toUpperCase()}</span>
                    <span className="theme-text-secondary">{l.name}</span>
                  </span>
                  {i18n.language === l.code && <Check size={16} className="text-[#ff8449]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotif(!showNotif)} className="p-2 relative theme-hover rounded-full transition-colors theme-text-secondary">
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 theme-bg-secondary rounded-xl shadow-xl theme-border border z-50 overflow-hidden">
              <div className="theme-bg-tertiary px-4 py-3 theme-border border-b flex items-center justify-between">
                <h3 className="font-semibold theme-text-primary">{t('notifications')}</h3>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} className="text-xs text-[#ff8449] hover:text-[#e6753d] font-medium">
                    {t('clearAll')}
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div key={idx} onClick={() => handleNotificationClick(notif)} className={`px-4 py-3 theme-border border-b theme-hover transition-colors flex gap-3 cursor-pointer ${notif.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'theme-bg-secondary'}`}>
                      <span className="text-lg flex-shrink-0">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#ff8449]">{notif.title}</p>
                        <p className="text-xs theme-text-secondary mt-1">{notif.message}</p>
                        <p className="text-xs theme-text-secondary opacity-75 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                      </div>
                      {notif.type === 'success' && <Check size={16} className="text-green-600 flex-shrink-0 mt-1" />}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center theme-text-secondary text-sm">{t('noNotifications')}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(!showProfile)} className="h-9 w-9 bg-[#ff8449] rounded-full flex items-center justify-center font-bold text-white overflow-hidden cursor-pointer hover:bg-[#e6753d] transition-colors">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.email ? user.email[0].toUpperCase() : 'G'
            )}
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 theme-bg-secondary rounded-xl shadow-xl theme-border border z-50 py-2">
              <button
                onClick={handleProfileClick}
                className="w-full px-4 py-2 text-left text-sm theme-hover flex items-center gap-3 transition-colors theme-text-primary"
              >
                <User size={16} />
                Profile
              </button>
              <button
                onClick={() => { handleLogout(); setShowProfile(false); }}
                className="w-full px-4 py-2 text-left text-sm theme-hover flex items-center gap-3 transition-colors text-red-500 hover:text-red-600"
              >
                <LogOut size={16} />
                {t('logout') || 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default TopBar;
