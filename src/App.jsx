import React, { useContext } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import AuthScreen from './pages/AuthPage';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Breadcrumbs from './components/layout/Breadcrumbs';
import DashboardView from './pages/DashboardPage';
import AllBlogsView from './pages/AllBlogsPage';
import CreateBlogView from './pages/CreateBlogPage';
import CommentsView from './pages/CommentsPage';
import TrashView from './pages/TrashPage';
import SettingsView from './pages/SettingsPage';
import BlogReader from './components/blogs/BlogReader';
import Modal from './components/ui/Modal';
import BlogForm from './components/blogs/BlogForm';

const MainLayout = () => {
  const context = useAppContext();
  
  if (!context) {
    return <div className="h-screen flex items-center justify-center"><div className="text-red-600">Context not available</div></div>;
  }
  
  const { 
    user, authLoading, onOfflineMode, activeTab, isSidebarOpen, 
    setIsSidebarOpen, handleLogout, isOffline, badges, isCollapsed,
    notifications, showNotif, setShowNotif, readingBlog, setReadingBlog,
    isBlogModalOpen, setIsBlogModalOpen, editingBlog, t, comments
  } = context;

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center theme-bg-primary transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="theme-text-secondary transition-colors duration-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <AuthScreen onLogin={() => {}} onOfflineMode={onOfflineMode} />;

  return (
    <div className="min-h-screen theme-bg-primary flex font-sans theme-text-primary transition-colors duration-300">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <TopBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} notifications={notifications} showNotif={showNotif} setShowNotif={setShowNotif} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative theme-bg-primary transition-colors duration-300">
          <Breadcrumbs />
          {readingBlog ? (
            <BlogReader blog={readingBlog} onClose={() => setReadingBlog(null)} comments={comments.filter(c => c.blogId === readingBlog.id || !c.blogId)} />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'blogs' && <AllBlogsView />}
              {activeTab === 'create' && <CreateBlogView />}
              {activeTab === 'comments' && <CommentsView />}
              {activeTab === 'trash' && <TrashView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>
      <Modal isOpen={isBlogModalOpen} onClose={() => setIsBlogModalOpen(false)} title={editingBlog ? "Edit Blog" : t.createBlog} size="lg">
        <BlogForm initialData={editingBlog} onClose={() => setIsBlogModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
