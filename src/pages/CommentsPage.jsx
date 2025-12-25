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
  const { comments, blogs } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(() => {
    const stored = localStorage.getItem('edwid_replies');
    return stored ? JSON.parse(stored) : {};
  });

  const categories = useMemo(() => {
    const cats = new Set(blogs.filter(b => !b.isDeleted).map(b => b.category));
    return ['All', ...Array.from(cats).sort()];
  }, [blogs]);

  const filteredComments = useMemo(() => {
    if (selectedCategory === 'All') return comments;
    
    const categoryBlogIds = blogs
      .filter(b => b.category === selectedCategory && !b.isDeleted)
      .map(b => b.id);
    
    return comments.filter(c => categoryBlogIds.includes(c.blogId));
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
      <h2 className="text-2xl font-bold text-gray-800">{t('comments')}</h2>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <div key={c.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 flex-shrink-0">
                    {c.author?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{c.author}</h4>
                      {blog && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{getCategoryTranslation(blog.category, t)}</span>}
                    </div>
                    {blog && <p className="text-xs text-gray-500">on "{blog.title}"</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(c.date)}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{c.text}</p>

                <button 
                  onClick={() => setReplyingTo(c.id)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                >
                  <Reply size={14} /> {t('reply')}
                </button>

                {replyingTo === c.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={t('commentText')} 
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(c.id)}
                      />
                      <button 
                        onClick={() => handleReply(c.id)} 
                        disabled={!replyText.trim()} 
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {replies[c.id] && replies[c.id].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {replies[c.id].map(reply => (
                      <div key={reply.id} className="bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-300 ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                            {reply.author?.[0] || 'A'}
                          </div>
                          <p className="font-semibold text-xs text-gray-900">{reply.author}</p>
                          <p className="text-xs text-gray-500">{formatDate(reply.date)}</p>
                        </div>
                        <p className="text-sm text-gray-700">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
            {t('noComments')}
          </div>
        )}
      </div>
    </div>
  );
};
export default CommentsView;
