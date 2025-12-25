import React, { useRef, useState, useEffect } from 'react';
import { Database, Zap, Eye, FileText, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import WaveChart from '../components/dashboard/WaveChart';
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

const DashboardView = () => {
  const { t } = useTranslation();
  const { blogs, seedData, setReadingBlog, isSeeding } = useAppContext();
  const activeBlogs = blogs.filter(b => !b.isDeleted);
  const [highlightAnalytics, setHighlightAnalytics] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date());
  const analyticsRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleViewAnalytics = () => {
    if (analyticsRef.current) {
      analyticsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightAnalytics(true);
      setTimeout(() => setHighlightAnalytics(false), 2000);
    }
  };
  
  const totalViews = activeBlogs.reduce((acc, curr) => acc + (curr.views || 0), 0);
  
  const getYearViewsData = (year) => {
    const monthlyViews = Array(12).fill(0);
    activeBlogs.forEach(blog => {
      const blogDate = new Date(blog.publishDate);
      if (blogDate.getFullYear() === year) {
        const month = blogDate.getMonth();
        monthlyViews[month] += blog.views || 0;
      }
    });
    return monthlyViews;
  };
  
  const viewsData = getYearViewsData(selectedYear);
  const popularBlogs = [...activeBlogs].sort((a,b) => (b.views||0) - (a.views||0)).slice(0, 4);
  const latestBlogs = [...activeBlogs].sort((a,b) => new Date(b.publishDate) - new Date(a.publishDate)).slice(0, 5);

  const getCurrentDateTime = () => {
    const date = currentTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const time = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${date} - ${time}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('dashboardOverview')}</h2>
        <p className="md:hidden text-xs sm:text-sm text-gray-600 font-medium">{getCurrentDateTime()}</p>
      </div>
      {activeBlogs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-sm">
          <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600"><Database size={40} strokeWidth={1.5} /></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('welcomeToDashboard')}</h3>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto text-lg">{t('databaseEmpty')}</p>
          <Button onClick={seedData} size="lg" disabled={isSeeding} className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 px-8 py-4 text-base">
            {isSeeding ? <Loader2 className="animate-spin mr-2" size={20} /> : <Zap size={20} className="mr-2 fill-current"/>} {isSeeding ? t('seeding') : t('populateMockBlogs')}
          </Button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{t('totalImpressions')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalViews.toLocaleString()}</h3>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
                <Eye size={24} />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{t('totalPosts')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{activeBlogs.length}</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <FileText size={24} />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{t('published')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{activeBlogs.filter(b => b.status === 'Publish' || b.status === 'Published').length}</h3>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-green-600">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{t('drafts')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{activeBlogs.filter(b => b.status === 'Draft').length}</h3>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600">
                <FileText size={24} />
              </div>
            </div>
          </div>

          {/* Analytics and Popular Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Analytics Section - Full Height */}
            <div ref={analyticsRef} className={`lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[400px] transition-all duration-500 ${highlightAnalytics ? 'ring-4 ring-indigo-300 scale-[1.02] shadow-lg' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-800">{t('analyticsOverview')}</h3>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={new Date().getFullYear()}>{t('thisYear') || 'This Year'}</option>
                  <option value={new Date().getFullYear() - 1}>{t('lastYear') || 'Last Year'}</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mb-4">{t('monthJan')} - {t('monthDec')} {selectedYear}</p>
              <div className="flex-1 relative min-h-[300px]">
                <div className="absolute inset-0">
                  {viewsData.length > 0 ? <WaveChart data={viewsData} color="#4F46E5" /> : <div className="h-full flex items-center justify-center text-gray-400">No data available</div>}
                </div>
              </div>
            </div>

            {/* Popular Posts Section - Matching Height */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[400px]">
              <h3 className="font-bold text-lg text-gray-800 mb-4">{t('popularPosts')}</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-4">
                {popularBlogs.map(blog => (
                  <div key={blog.id} className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => setReadingBlog(blog)}>
                    <img src={blog.image} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600">{blog.title}</h4>
                      <span className="text-xs text-gray-500">{blog.views.toLocaleString()} {t('reads')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full text-xs mt-auto" onClick={handleViewAnalytics}>{t('viewFullAnalytics')}</Button>
            </div>
          </div>

          {/* Latest Posts Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-6">{t('latestPosts')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-4 pl-2">{t('articleName')}</th>
                    <th className="pb-4 hidden md:table-cell">{t('category')}</th>
                    <th className="pb-4 hidden md:table-cell">{t('publishedDate')}</th>
                    <th className="pb-4 hidden lg:table-cell">{t('views')}</th>
                    <th className="pb-4">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {latestBlogs.map(blog => (
                    <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setReadingBlog(blog)} className="w-10 h-10 rounded overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                            <img src={blog.image} className="w-full h-full object-cover" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-900 text-sm block truncate">{blog.title}</span>
                            <span className="text-xs text-gray-500 md:hidden">{getCategoryTranslation(blog.category, t)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-500 hidden md:table-cell">{getCategoryTranslation(blog.category, t)}</td>
                      <td className="py-4 text-sm text-gray-500 hidden md:table-cell">{formatDate(blog.publishDate)}</td>
                      <td className="py-4 text-sm text-gray-500 font-medium hidden lg:table-cell">{blog.views.toLocaleString()}</td>
                      <td className="py-4">
                        <button onClick={() => setReadingBlog(blog)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1">{t('read')} <ArrowRight size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default DashboardView;
