import React from 'react';
import { LayoutDashboard, FileText, Plus, MessageSquare, Trash2, Settings, LogOut, Wifi, WifiOff, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
  const { t: tContext } = useTranslation();
  const { 
    activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isOffline, 
    badges, isCollapsed, setIsCollapsed, setReadingBlog, setEditingBlog, setBadges, handleLogout
  } = useAppContext();
  
  const items = [
    { id: 'dashboard', label: tContext('dashboard'), icon: LayoutDashboard },
    { id: 'blogs', label: tContext('allBlogs'), icon: FileText, badge: badges.blogs },
    { id: 'create', label: tContext('createBlog'), icon: Plus },
    { id: 'comments', label: tContext('comments'), icon: MessageSquare, badge: badges.comments },
    { id: 'trash', label: tContext('trash'), icon: Trash2, badge: badges.trash }
  ];
  
  const handleItemClick = (item) => { 
    setActiveTab(item.id);
    setReadingBlog(null);
    setEditingBlog(null);
    if (item.badge > 0) {
      setBadges(prev => ({ ...prev, [item.id]: 0 }));
    }
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 z-40 theme-bg-secondary theme-border border-r shadow-xl transform transition-all duration-300 flex flex-col justify-between
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}>
        
        {/* Header */}
        <div>
          <div className="h-16 flex items-center px-4 theme-border border-b gap-2">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center gap-3 w-full">
              <button onClick={toggleMenu} className="p-1 theme-hover rounded flex items-center justify-center flex-shrink-0" title={isCollapsed ? tContext('dashboard') : 'Collapse Sidebar'}>
                <Menu size={24} className="text-gray-600" />
              </button>
              {!isCollapsed && <span className="text-lg font-bold theme-text-primary transition-colors duration-300">Edwid<span className="text-[#ff8449]">Admin</span></span>}
            </div>
            
            {/* Mobile/Tablet Header */}
            <div className="flex lg:hidden items-center gap-3 w-full">
              <span className="text-lg font-bold theme-text-primary transition-colors duration-300">Edwid<span className="text-[#ff8449]">Admin</span></span>
              <button onClick={() => setIsSidebarOpen(false)} className="ml-auto p-1 theme-hover rounded">
                <X size={24} className="text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Navigation Items */}
          <nav className="p-3 space-y-2 mt-4">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all relative
                  ${activeTab === item.id 
                    ? 'bg-[#ff8449] text-white' 
                    : 'theme-text-primary hover:bg-[#ff8449] hover:text-white'
                  }
                  ${isCollapsed && 'lg:justify-center lg:gap-0'}`}
                title={item.label}
              >
                <item.icon size={20} className="flex-shrink-0" />
                
                {(!isCollapsed || window.innerWidth < 1024) && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {isCollapsed && window.innerWidth >= 1024 && item.badge > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="p-3 theme-border border-t space-y-2 transition-colors duration-300">
          {(!isCollapsed || window.innerWidth < 1024) && (
            <div className="px-3 py-2 mb-2">
              {!isOffline ? (
                <div className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                  <Wifi size={12} /> {tContext('live')}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full w-fit">
                  <WifiOff size={12} /> {tContext('offline')}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all
              ${activeTab === 'settings'
                ? 'bg-[#ff8449] text-white'
                : 'theme-text-primary hover:bg-[#ff8449] hover:text-white'
              }
              ${isCollapsed && 'lg:justify-center lg:gap-0'}`}
            title={tContext('settings')}
          >
            <Settings size={20} className="flex-shrink-0" />
            {(!isCollapsed || window.innerWidth < 1024) && <span className="flex-1 text-left">{tContext('settings')}</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all
              ${isCollapsed && 'lg:justify-center lg:gap-0'}`}
            title={tContext('logout')}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(!isCollapsed || window.innerWidth < 1024) && <span className="flex-1 text-left">{tContext('logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
