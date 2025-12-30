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

  // Generate random user avatar
  const getRandomAvatar = (author) => {
    const seed = author.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  // Get admin avatar (Google photo if available)
  const getAdminAvatar = () => {
    return user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`;
  };

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
    <div className="theme-bg-secondary rounded-xl shadow-lg border theme-border overflow-hidden animate-fade-in-up">
      <div className="relative h-64 w-full">
        <img src={blog.image || "https://via.placeholder.com/800x400"} alt={blog.title} className="w-full h-full object-cover" />
        <button onClick={onClose} className="absolute top-4 right-4 theme-bg-secondary/90 p-2 rounded-full hover:theme-bg-secondary transition-colors shadow-lg group">
          <X size={24} className="theme-text-primary group-hover:rotate-90 transition-transform" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
          <span className="bg-[#ff8449] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">{getCategoryTranslation(blog.category, t)}</span>
          <h1 className="text-3xl font-bold text-white leading-tight">{blog.title}</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">{blog.author?.[0] || 'A'}</div>
              <div><p className="font-bold theme-text-primary">{blog.author}</p><p className="text-sm theme-text-secondary">{t('postedOn')} {formatDate(blog.publishDate)}</p></div>
            </div>
            <span className="flex items-center gap-1 theme-bg-tertiary px-3 py-1 rounded-full"><Eye size={16}/> {viewCount.toLocaleString()} {t('views')}</span>
          </div>
          <div className="prose max-w-none theme-text-primary leading-relaxed mb-12">{blog.description.split('\n').map((p, i) => <p key={i} className="mb-4 text-lg">{p}</p>)}</div>
        </div>

        <div className="theme-bg-tertiary p-6 rounded-xl h-fit">
          <h3 className="font-bold theme-text-primary mb-4 flex items-center"><MessageSquare size={18} className="mr-2"/> {t('comment')} ({blogComments.length})</h3>
          
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <input type="text" placeholder={t('commentText')} className="w-full pl-4 pr-10 py-3 rounded-lg theme-border border focus:ring-2 focus:ring-[#ff8449] outline-none theme-bg-secondary theme-text-primary" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-600 hover:bg-primary-50 rounded-md disabled:text-gray-300"><Send size={18} /></button>
            </div>
          </form>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {blogComments.length > 0 ? (
              blogComments.map(c => (
                <div key={c.id} className="theme-bg-secondary p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={getRandomAvatar(c.author)} 
                        alt={c.author} 
                        className="h-8 w-8 rounded-full"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23e5e7eb'/><text x='16' y='20' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='14'>${c.author?.[0] || 'U'}</text></svg>`;
                        }}
                      />
                      <div>
                        <p className="font-bold text-sm theme-text-primary">{c.author}</p>
                        <p className="text-xs theme-text-secondary">{formatDate(c.date)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm theme-text-secondary mb-3">{c.text}</p>
                  <button onClick={() => setReplyingTo(c.id)} className="text-xs text-[#ff8449] hover:text-[#e6753d] font-medium flex items-center gap-1">
                    <Reply size={14} /> {t('reply')}
                  </button>

                  {replyingTo === c.id && (
                    <div className="mt-3 pt-3 border-t theme-border">
                      <div className="flex gap-2">
                        <input type="text" placeholder={t('commentText')} className="flex-1 px-3 py-2 text-sm theme-border border rounded-lg focus:ring-2 focus:ring-[#ff8449] outline-none theme-bg-secondary theme-text-primary" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleReply(c.id)} />
                        <button onClick={() => handleReply(c.id)} disabled={!replyText.trim()} className="px-3 py-2 bg-[#ff8449] text-white text-sm rounded-lg hover:bg-[#e6753d] disabled:opacity-50">
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {replies[c.id] && replies[c.id].length > 0 && (
                    <div className="mt-3 pt-3 border-t theme-border space-y-2">
                      {replies[c.id].map(reply => (
                        <div key={reply.id} className="theme-bg-tertiary p-3 rounded-lg ml-4 border-l-2 border-primary-300">
                          <div className="flex items-center gap-2 mb-1">
                            <img 
                              src={getAdminAvatar()} 
                              alt={reply.author} 
                              className="h-6 w-6 rounded-full"
                              onError={(e) => {
                                e.target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect width='24' height='24' fill='%23e5e7eb'/><text x='12' y='16' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='12'>${reply.author?.[0] || 'U'}</text></svg>`;
                              }}
                            />
                            <p className="font-semibold text-xs theme-text-primary">{reply.author}</p>
                            <p className="text-xs theme-text-secondary">{formatDate(reply.date)}</p>
                          </div>
                          <p className="text-xs theme-text-secondary">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center theme-text-secondary text-sm py-4">{t('noComments')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlogReader;
