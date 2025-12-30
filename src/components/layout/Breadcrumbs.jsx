import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

const Breadcrumbs = () => {
  const { t } = useTranslation();
  const { activeTab, readingBlog, setActiveTab, setReadingBlog } = useAppContext();
  
  const getTabLabel = () => {
    if (activeTab === 'create') return t('createNewBlog');
    if (activeTab === 'blogs') return t('allBlogs');
    if (activeTab === 'comments') return t('comments');
    if (activeTab === 'trash') return t('trash');
    if (activeTab === 'settings') return t('settings');
    return activeTab;
  };

  return (
    <div className="flex items-center text-sm theme-text-secondary mb-6 theme-bg-secondary px-4 py-3 rounded-xl shadow-sm border theme-border">
      <button onClick={() => { setActiveTab('dashboard'); setReadingBlog(null); }} className="flex items-center hover:text-[#ff8449] transition-colors theme-text-secondary">
        <Home size={16} className="mr-2" />{t('home')}
      </button>
      {activeTab !== 'dashboard' && (
        <>
          <ChevronRight size={14} className="mx-2 theme-text-secondary opacity-60" />
          <button onClick={() => { setReadingBlog(null); }} className={`${!readingBlog ? 'font-bold text-[#ff8449] cursor-default' : 'hover:text-[#ff8449] transition-colors theme-text-secondary'}`} disabled={!readingBlog}>
            {getTabLabel()}
          </button>
        </>
      )}
      {readingBlog && (
        <>
          <ChevronRight size={14} className="mx-2 theme-text-secondary opacity-60" />
          <span className="font-bold text-[#ff8449] truncate max-w-[200px] sm:max-w-xs">{readingBlog.title}</span>
        </>
      )}
    </div>
  );
};
export default Breadcrumbs;
