import React, { useState, useEffect } from 'react';
import { X, Eye, MessageSquare, Send, Reply } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';

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

const BlogReader = ({ blog, onClose, comments }) => {
  const { t } = useTranslation();
  const { addComment, user, isOffline, blogs, setBlogs, comments: allComments } = useAppContext();
  const [newComment, setNewComment] = useState('');
  const [viewCount, setViewCount] = useState(Number(blog.views) || 0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(() => {
    const stored = localStorage.getItem('edwid_replies');
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    const incrementViews = async () => {
      const currentViews = Number(blog.views) || 0;
      const newViewCount = currentViews + 1;
      setViewCount(newViewCount);

      if (isOffline) {
        const updated = blogs.map(b => b.id === blog.id ? { ...b, views: newViewCount } : b);
        setBlogs(updated);
        localStorage.setItem('edwid_blogs', JSON.stringify(updated));
      } else {
        try {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'blogs', blog.id), {
            views: newViewCount
          });
        } catch (e) {
          console.error('Error updating views:', e);
        }
      }
    };

    incrementViews();
  }, [blog.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(newComment.trim()) {
      addComment(newComment, blog.id);
      setNewComment('');
    }
  };

  const handleReply = (commentId) => {
    if(replyText.trim()) {
      const newReplies = {
        ...replies,
        [commentId]: [...(replies[commentId] || []), {
          id: `reply_${Date.now()}`,
          author: 'Admin',
          text: replyText,
          date: new Date().toISOString()
        }]
      };
      setReplies(newReplies);
      localStorage.setItem('edwid_replies', JSON.stringify(newReplies));
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const blogComments = allComments.filter(c => c.blogId === blog.id || !c.blogId);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
      <div className="relative h-64 w-full">
        <img src={blog.image || "https://via.placeholder.com/800x400"} alt={blog.title} className="w-full h-full object-cover" />
        <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors shadow-lg group">
          <X size={24} className="text-gray-800 group-hover:rotate-90 transition-transform" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">{getCategoryTranslation(blog.category, t)}</span>
          <h1 className="text-3xl font-bold text-white leading-tight">{blog.title}</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">{blog.author?.[0] || 'A'}</div>
              <div><p className="font-bold text-gray-900">{blog.author}</p><p className="text-sm text-gray-500">{t('postedOn')} {formatDate(blog.publishDate)}</p></div>
            </div>
            <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full"><Eye size={16}/> {viewCount.toLocaleString()} {t('views')}</span>
          </div>
          <div className="prose max-w-none text-gray-700 leading-relaxed mb-12">{blog.description.split('\n').map((p, i) => <p key={i} className="mb-4 text-lg">{p}</p>)}</div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl h-fit">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center"><MessageSquare size={18} className="mr-2"/> {t('comment')} ({blogComments.length})</h3>
          
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <input type="text" placeholder={t('commentText')} className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md disabled:text-gray-300"><Send size={18} /></button>
            </div>
          </form>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {blogComments.length > 0 ? (
              blogComments.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">{c.author?.[0] || 'U'}</div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{c.author}</p>
                        <p className="text-xs text-gray-500">{formatDate(c.date)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{c.text}</p>
                  <button onClick={() => setReplyingTo(c.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                    <Reply size={14} /> {t('reply')}
                  </button>

                  {replyingTo === c.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input type="text" placeholder={t('commentText')} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                        <button onClick={() => handleReply(c.id)} disabled={!replyText.trim()} className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {replies[c.id] && replies[c.id].length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      {replies[c.id].map(reply => (
                        <div key={reply.id} className="bg-gray-50 p-3 rounded-lg ml-4 border-l-2 border-indigo-300">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">{reply.author?.[0] || 'U'}</div>
                            <p className="font-semibold text-xs text-gray-900">{reply.author}</p>
                            <p className="text-xs text-gray-500">{formatDate(reply.date)}</p>
                          </div>
                          <p className="text-xs text-gray-600">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">{t('noComments')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlogReader;
