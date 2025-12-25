import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import BlogCard from '../components/blogs/BlogCard';
import Button from '../components/ui/Button';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

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

const AllBlogsView = () => {
  const { t } = useTranslation();
  const { blogs, setEditingBlog, setIsBlogModalOpen, isOffline, setBlogs, user, setReadingBlog, setBadges, setActiveTab, addNotification, softDeleteBlog } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchType, setSearchType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = ['All', 'Technology', 'Lifestyle', 'Education', 'Health', 'Finance'];

  const filtered = useMemo(() => {
    let result = blogs.filter(b => !b.isDeleted);
    
    if (selectedCategory !== 'All') {
      result = result.filter(b => b.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b => {
        const title = b.title.toLowerCase();
        const author = (b.author || '').toLowerCase();
        const category = (b.category || '').toLowerCase();
        
        if (searchType === 'all') {
          return title.includes(term) || author.includes(term) || category.includes(term);
        } else if (searchType === 'title') {
          return title.includes(term);
        } else if (searchType === 'author') {
          return author.includes(term);
        } else if (searchType === 'category') {
          return category.includes(term);
        }
        return true;
      });
    }

    return result;
  }, [blogs, searchTerm, selectedCategory, searchType]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBlogs = filtered.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const isMockBlog = (blogId) => String(blogId).startsWith('mock_blog_');
  
  const getCurrentDateTime = () => {
    const day = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const date = currentTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    const time = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${day}, ${date} - ${time}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 px-4 py-2 text-center">
        <p className="text-xs sm:text-sm text-gray-700 font-medium">{getCurrentDateTime()}</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{t('allBlogs')}</h2>
        <Button onClick={() => setActiveTab('create')}><Plus size={18} className="mr-2" /> {t('createBlog')}</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t('searchAuthorCategoryTitle')}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-full" 
                value={searchTerm} 
                onChange={handleSearchChange} 
              />
            </div>
          </div>

          <select 
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All' : getCategoryTranslation(cat, t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Blog')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('category')}</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('publishedDate')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('status')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map(blog => (
                  <tr key={blog.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setReadingBlog(blog)} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                          {blog.image ? (
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <span className="text-xs">No img</span>
                            </div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{blog.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{blog.author || 'Unknown Author'}</p>
                          <p className="md:hidden text-xs text-gray-400 mt-1">{blog.publishDate ? new Date(blog.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {getCategoryTranslation(blog.category, t)}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600">
                      {blog.publishDate ? new Date(blog.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        (blog.status === 'Publish' || blog.status === 'Published') 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {(blog.status === 'Publish' || blog.status === 'Published') ? t('published') : t('draft')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setReadingBlog(blog)}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 hover:text-indigo-700 transition-colors" 
                          title="Preview Blog"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => { setEditingBlog(blog); setIsBlogModalOpen(true); }}
                          disabled={isMockBlog(blog.id)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                          title={isMockBlog(blog.id) ? 'Cannot edit mock blogs' : 'Edit Blog'}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => softDeleteBlog(blog.id)}
                          disabled={isMockBlog(blog.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                          title={isMockBlog(blog.id) ? 'Cannot delete mock blogs' : 'Delete Blog'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {t('noResultsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select 
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{Math.max(totalPages, 1)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default AllBlogsView;
