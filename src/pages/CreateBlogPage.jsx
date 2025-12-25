import React from 'react';
import { PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import BlogForm from '../components/blogs/BlogForm';

const CreateBlogView = () => {
  const { t } = useTranslation();
  const { setActiveTab } = useAppContext();
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center mb-6 pb-6 border-b border-gray-100">
        <div className="bg-indigo-50 p-3 rounded-full mr-4 text-indigo-600"><PenTool size={24} /></div>
        <div><h2 className="text-2xl font-bold text-gray-800">{t('createNewBlog')}</h2><p className="text-gray-500 text-sm">{t('fillDetailsPublishBlog')}</p></div>
      </div>
      <BlogForm initialData={null} onClose={() => setActiveTab('blogs')} />
    </div>
  );
};
export default CreateBlogView;
