import React from 'react';
import { ImageIcon, FileText, Trash2, RotateCcw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const BlogCard = ({ blog, isTrash, onEdit, onDelete, onRestore }) => {
  const { t } = useAppContext();
  return (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full ${isTrash ? 'h-auto' : ''}`}>
    <div className={`relative bg-gray-100 overflow-hidden ${isTrash ? 'h-24' : 'h-48'}`}>
        {blog.image ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={isTrash ? 24 : 48} /></div>}
        <div className="absolute top-2 right-2"><span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${blog.status==='Publish'?'bg-green-500':'bg-yellow-500'}`}>{blog.status}</span></div>
    </div>
    <div className={`flex-1 flex flex-col ${isTrash ? 'p-3' : 'p-5'}`}>
        <h3 className={`font-bold mb-2 line-clamp-2 ${isTrash ? 'text-sm' : 'text-lg'}`}>{blog.title}</h3>
        {!isTrash && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{blog.description}</p>}
        <div className="mt-auto flex justify-between items-center gap-2">
            {!isTrash && <span className="text-xs text-gray-500">{t.views}: {(blog.views || 0).toLocaleString()}</span>}
            <div className={`flex ${isTrash ? 'gap-1' : 'gap-2'}`}>
                {!isTrash ? (
                    <>
                        <button onClick={onEdit} className="p-2 hover:bg-indigo-50 rounded-lg text-gray-600 hover:text-indigo-600 transition-colors" title="Edit"><FileText size={18}/></button>
                        <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Move to Trash"><Trash2 size={18}/></button>
                    </>
                ) : (
                    <>
                        <button onClick={onRestore} className={`flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors ${isTrash ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1.5'}`}><RotateCcw size={12}/> {t.restore}</button>
                        <button onClick={onDelete} className={`flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${isTrash ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1.5'}`}><Trash2 size={12}/> {t.purge}</button>
                    </>
                )}
            </div>
        </div>
    </div>
  </div>
  );
};
export default BlogCard;
