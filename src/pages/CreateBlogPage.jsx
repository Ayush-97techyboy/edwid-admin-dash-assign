import React from 'react';
import { PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import BlogForm from '../components/blogs/BlogForm';

const CreateBlogView = () => {
  const { t } = useTranslation();
  const { setActiveTab } = useAppContext();
  return (
    <div className="max-w-4xl mx-auto theme-bg-secondary rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center mb-6 pb-6 border-b border-gray-100">
        <div className="bg-primary-50 p-3 rounded-full mr-4 text-primary-600"><PenTool size={24} /></div>
        <div><h2 className="text-2xl font-bold theme-text-primary">{t('createNewBlog')}</h2><p className="theme-text-secondary text-sm">{t('fillDetailsPublishBlog')}</p></div>
      </div>
      <BlogForm key={Date.now()} initialData={null} onClose={() => setActiveTab('blogs')} />
    </div>
  );
};
export default CreateBlogView;
