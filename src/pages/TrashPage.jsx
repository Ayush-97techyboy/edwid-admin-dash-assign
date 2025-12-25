import React from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import DeletedBlogCard from '../components/blogs/DeletedBlogCard';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

const TrashView = () => {
  const { t } = useTranslation();
  const { blogs, user, isOffline, setBlogs, addNotification } = useAppContext();
  const trashItems = blogs.filter(b => b.isDeleted);
  
  const handleRestore = async (id) => {
    const blog = blogs.find(b => b.id === id);
    if (isOffline) { 
      const updated = blogs.map(b => b.id === id ? { ...b, isDeleted: false, deletedAt: null } : b); 
      setBlogs(updated); 
      localStorage.setItem('edwid_blogs', JSON.stringify(updated)); 
    }
    else await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'blogs', id), { isDeleted: false, deletedAt: null });
    
    if (blog) {
      addNotification('success', 'blogRestored', `"${blog.title}" ${t('blogRestoredMsg')}.`, '♻️');
    }
  };
  
  const handlePermDelete = async (id) => {
    const blog = blogs.find(b => b.id === id);
    if(confirm(`${t('permanentlyDelete')} ${t('permanentlyDeleteMsg')}`)) {
      if (isOffline) { 
        const updated = blogs.filter(b => b.id !== id); 
        setBlogs(updated); 
        localStorage.setItem('edwid_blogs', JSON.stringify(updated)); 
      }
      else await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'blogs', id));
      
      if (blog) {
        addNotification('info', 'blogPermanentlyDeleted', `"${blog.title}" ${t('blogPermanentlyDeletedMsg')}.`, '💀');
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header Card with Icon and Title */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          {/* Trash Icon Container */}
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Trash2 size={32} className="text-red-500" />
          </div>
          
          {/* Title and Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">{t('recycleBin')}</h2>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
              {trashItems.length}
            </span>
          </div>
        </div>
      </div>

      {/* Trash Items or Empty State */}
      {trashItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-48 bg-white rounded-xl border border-gray-100">
          <div className="mb-6 p-6 bg-gray-100 rounded-full">
            <Trash2 size={56} className="text-gray-300" />
          </div>
          <p className="text-gray-500 text-xl font-medium">{t('trashEmpty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trashItems.map(blog => (
            <DeletedBlogCard 
              key={blog.id} 
              blog={blog} 
              onRestore={() => handleRestore(blog.id)} 
              onDelete={() => handlePermDelete(blog.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default TrashView;
