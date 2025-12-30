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
  const { blogs, seedData, setReadingBlog, isSeeding, hasMockBlogs } = useAppContext();
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
        <h2 className="text-2xl font-bold theme-text-primary">{t('dashboardOverview')}</h2>
        <p className="md:hidden text-xs sm:text-sm theme-text-secondary font-medium">{getCurrentDateTime()}</p>
      </div>
      {activeBlogs.length === 0 && !hasMockBlogs ? (
        <div className="theme-bg-secondary theme-border border rounded-xl p-8 text-center shadow-sm">
          <div className="mx-auto w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6 text-primary-600"><Database size={40} strokeWidth={1.5} /></div>
          <h3 className="text-2xl font-bold theme-text-primary mb-3">{t('welcomeToDashboard')}</h3>
          <p className="theme-text-secondary mb-8 max-w-lg mx-auto text-lg">{t('databaseEmpty')}</p>
          <Button onClick={seedData} size="lg" disabled={isSeeding} className="bg-gradient-to-r from-primary-500 to-orange-600 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 px-8 py-4 text-base">
            {isSeeding ? <Loader2 className="animate-spin mr-2" size={20} /> : <Zap size={20} className="mr-2 fill-current"/>} {isSeeding ? t('seeding') : t('populateMockBlogs')}
          </Button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="theme-bg-secondary p-5 rounded-xl shadow-sm theme-border border flex items-center justify-between">
              <div>
                <p className="theme-text-secondary text-sm font-medium">{t('totalImpressions')}</p>
                <h3 className="text-2xl font-bold theme-text-accent mt-1">{totalViews.toLocaleString()}</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg text-[#ff8449]">
                <Eye size={24} />
              </div>
            </div>
            <div className="theme-bg-secondary p-5 rounded-xl shadow-sm theme-border border flex items-center justify-between">
              <div>
                <p className="theme-text-secondary text-sm font-medium">{t('totalPosts')}</p>
                <h3 className="text-2xl font-bold theme-text-accent mt-1">{activeBlogs.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                <FileText size={24} />
              </div>
            </div>
            <div className="theme-bg-secondary p-5 rounded-xl shadow-sm theme-border border flex items-center justify-between">
              <div>
                <p className="theme-text-secondary text-sm font-medium">{t('published')}</p>
                <h3 className="text-2xl font-bold theme-text-accent mt-1">{activeBlogs.filter(b => b.status === 'Publish' || b.status === 'Published').length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div className="theme-bg-secondary p-5 rounded-xl shadow-sm theme-border border flex items-center justify-between">
              <div>
                <p className="theme-text-secondary text-sm font-medium">{t('drafts')}</p>
                <h3 className="text-2xl font-bold theme-text-accent mt-1">{activeBlogs.filter(b => b.status === 'Draft').length}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
                <FileText size={24} />
              </div>
            </div>
          </div>

          {/* Analytics and Popular Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Analytics Section - Full Height */}
            <div ref={analyticsRef} className={`lg:col-span-2 theme-bg-secondary rounded-xl shadow-sm theme-border border p-6 flex flex-col min-h-[400px] transition-all duration-500 ${highlightAnalytics ? 'ring-4 ring-primary-400 scale-[1.02] shadow-lg' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg theme-text-primary">{t('analyticsOverview')}</h3>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1 text-sm theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 theme-bg-secondary theme-text-primary"
                >
                  <option value={new Date().getFullYear()}>{t('thisYear') || 'This Year'}</option>
                  <option value={new Date().getFullYear() - 1}>{t('lastYear') || 'Last Year'}</option>
                </select>
              </div>
              <p className="text-xs theme-text-secondary mb-4">{t('monthJan')} - {t('monthDec')} {selectedYear}</p>
              <div className="flex-1 relative min-h-[300px]">
                <div className="absolute inset-0">
                  {viewsData.length > 0 ? <WaveChart data={viewsData} color="#ff8449" /> : <div className="h-full flex items-center justify-center theme-text-secondary">No data available</div>}
                </div>
              </div>
            </div>

            {/* Popular Posts Section - Matching Height */}
            <div className="theme-bg-secondary rounded-xl shadow-sm theme-border border p-6 flex flex-col min-h-[400px]">
              <h3 className="font-bold text-lg theme-text-primary mb-4">{t('popularPosts')}</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-4">
                {popularBlogs.map(blog => (
                  <div key={blog.id} className="flex gap-3 group cursor-pointer hover:bg-opacity-10 hover:bg-[#ff8449] p-2 rounded-lg transition-colors" onClick={() => setReadingBlog(blog)}>
                    <img src={blog.image} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium theme-text-primary text-sm line-clamp-2 group-hover:text-[#ff8449]">{blog.title}</h4>
                      <span className="text-xs theme-text-secondary">{blog.views.toLocaleString()} {t('reads')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full text-xs mt-auto" onClick={handleViewAnalytics}>{t('viewFullAnalytics')}</Button>
            </div>
          </div>

          {/* Latest Posts Section */}
          <div className="theme-bg-secondary rounded-xl shadow-sm theme-border border p-6">
            <h3 className="font-bold text-lg theme-text-primary mb-6">{t('latestPosts')}</h3>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full table-auto min-w-[700px]">
                <thead>
                  <tr className="theme-border border-b text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                    <th className="pb-4 pl-2 min-w-[200px]">{t('articleName')}</th>
                    <th className="pb-4 min-w-[120px]">{t('category')}</th>
                    <th className="pb-4 min-w-[120px]">{t('publishedDate')}</th>
                    <th className="pb-4 min-w-[80px]">{t('views')}</th>
                    <th className="pb-4 min-w-[80px]">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {latestBlogs.map(blog => (
                    <tr key={blog.id} className="hover:bg-opacity-10 hover:bg-[#ff8449] transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setReadingBlog(blog)} className="w-10 h-10 rounded overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                            <img src={blog.image} className="w-full h-full object-cover" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium theme-text-primary text-sm block truncate">{blog.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm theme-text-secondary">{getCategoryTranslation(blog.category, t)}</td>
                      <td className="py-4 text-sm theme-text-secondary">{formatDate(blog.publishDate)}</td>
                      <td className="py-4 text-sm theme-text-secondary font-medium">{blog.views.toLocaleString()}</td>
                      <td className="py-4">
                        <button onClick={() => setReadingBlog(blog)} className="text-[#ff8449] hover:text-[#e6753d] text-sm font-medium inline-flex items-center gap-1">{t('read')} <ArrowRight size={12} /></button>
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
