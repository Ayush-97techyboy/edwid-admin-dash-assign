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
    <div className="flex items-center text-sm text-gray-500 mb-6 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
      <button onClick={() => { setActiveTab('dashboard'); setReadingBlog(null); }} className="flex items-center hover:text-indigo-600 transition-colors">
        <Home size={16} className="mr-2" />{t('home')}
      </button>
      {activeTab !== 'dashboard' && (
        <>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <button onClick={() => { setReadingBlog(null); }} className={`${!readingBlog ? 'font-bold text-indigo-600 cursor-default' : 'hover:text-indigo-600 transition-colors'}`} disabled={!readingBlog}>
            {getTabLabel()}
          </button>
        </>
      )}
      {readingBlog && (
        <>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="font-bold text-indigo-600 truncate max-w-[200px] sm:max-w-xs">{readingBlog.title}</span>
        </>
      )}
    </div>
  );
};
export default Breadcrumbs;
