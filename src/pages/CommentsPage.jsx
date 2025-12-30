import React, { useState, useMemo } from 'react';
import { MessageSquare, Reply, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

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

const CommentsView = () => {
  const { t } = useTranslation();
  const { comments, blogs, user } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('All');
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

  const categories = useMemo(() => {
    const cats = new Set(blogs.filter(b => !b.isDeleted).map(b => b.category));
    return ['All', ...Array.from(cats).sort()];
  }, [blogs]);

  const filteredComments = useMemo(() => {
    let result;
    if (selectedCategory === 'All') {
      result = comments;
    } else {
      const categoryBlogIds = blogs
        .filter(b => b.category === selectedCategory && !b.isDeleted)
        .map(b => b.id);
      
      result = comments.filter(c => categoryBlogIds.includes(c.blogId));
    }
    
    // Sort by date - latest first
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [comments, selectedCategory, blogs]);

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold theme-text-primary">{t('comments')}</h2>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-[#ff8449] text-white'
                : 'bg-[#ffebe4] text-[#ff8449] hover:bg-[#ffd6c7]'
            }`}
          >
            {cat === 'All' ? t('all') : getCategoryTranslation(cat, t)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map(c => {
            const blog = blogs.find(b => b.id === c.blogId);
            return (
              <div key={c.id} className="theme-bg-secondary p-6 rounded-lg border theme-border shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={getRandomAvatar(c.author)} 
                    alt={c.author} 
                    className="h-10 w-10 rounded-full flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='40' height='40' fill='%23e5e7eb'/><text x='20' y='25' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'>${c.author?.[0] || 'U'}</text></svg>`;
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold theme-text-primary">{c.author}</h4>
                      {blog && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{getCategoryTranslation(blog.category, t)}</span>}
                    </div>
                    {blog && <p className="text-xs theme-text-secondary">on "{blog.title}"</p>}
                    <p className="text-xs theme-text-secondary mt-1">{formatDate(c.date)}</p>
                  </div>
                </div>

                <p className="theme-text-primary mb-4">{c.text}</p>

                <button 
                  onClick={() => setReplyingTo(c.id)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                >
                  <Reply size={14} /> {t('reply')}
                </button>

                {replyingTo === c.id && (
                  <div className="mt-4 pt-4 border-t theme-border">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={t('commentText')} 
                        className="flex-1 px-3 py-2 text-sm border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none theme-bg-primary theme-text-primary" 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(c.id)}
                      />
                      <button 
                        onClick={() => handleReply(c.id)} 
                        disabled={!replyText.trim()} 
                        className="px-4 py-2 bg-[#ff8449] text-white text-sm rounded-lg hover:bg-[#e6753d] disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {replies[c.id] && replies[c.id].length > 0 && (
                  <div className="mt-4 pt-4 border-t theme-border space-y-3">
                    {replies[c.id].map(reply => (
                      <div key={reply.id} className="theme-bg-tertiary p-3 rounded-lg border-l-4 border-primary-300 ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <img 
                            src={getAdminAvatar()} 
                            alt={reply.author} 
                            className="h-6 w-6 rounded-full"
                            onError={(e) => {
                              e.target.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect width='24' height='24' fill='%23e5e7eb'/><text x='12' y='16' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='12'>${reply.author?.[0] || 'A'}</text></svg>`;
                            }}
                          />
                          <p className="font-semibold text-xs theme-text-primary">{reply.author}</p>
                          <p className="text-xs theme-text-secondary">{formatDate(reply.date)}</p>
                        </div>
                        <p className="text-sm theme-text-primary">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="theme-bg-secondary p-8 rounded-lg border theme-border text-center theme-text-secondary">
            {t('noComments')}
          </div>
        )}
      </div>
    </div>
  );
};
export default CommentsView;
