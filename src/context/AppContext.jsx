import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, writeBatch, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db, appId } from '../config/firebase';
import { generateMockBlogs } from '../utils/mockData';
import { isOldTrash } from '../utils/helpers';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const sanitizeBlog = (data) => ({
  id: data.id,
  title: String(data.title || ''),
  description: String(data.description || ''),
  category: String(data.category || ''),
  author: String(data.author || ''),
  publishDate: String(data.publishDate || ''),
  status: String(data.status || 'Publish'),
  views: Number(data.views) || 0,
  image: String(data.image || ''),
  isDeleted: Boolean(data.isDeleted),
  deletedAt: data.deletedAt || null,
  createdAt: data.createdAt || null
});

export const AppProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [badges, setBadges] = useState({ blogs: 0, comments: 0, trash: 0 });
  const [isSeeding, setIsSeeding] = useState(false);

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [readingBlog, setReadingBlog] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  
  const addNotification = (type, titleKey, messageKey, icon = '📝') => {
    const title = typeof titleKey === 'string' && titleKey.includes(' ') ? titleKey : t(titleKey);
    const message = typeof messageKey === 'string' && messageKey.includes('"') ? messageKey : t(messageKey);
    
    const newNotif = {
      id: Date.now(),
      type,
      title,
      message,
      icon,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
  };

  // Network detection
  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        addNotification('success', 'Connection Restored', 'Network connection restored. Loading your real data...', '✅');
        
        // Clear mock data and localStorage
        setBlogs([]);
        localStorage.removeItem('edwid_blogs');
        localStorage.removeItem('blogsPopulated');
        
        setIsOffline(false);
        
        // Clean up any mock data from Firebase
        setTimeout(() => cleanupMockData(), 1000);
      }
    };
    
    const handleOffline = () => {
      if (!isOffline) {
        handleOfflineMode();
        // Force load mock data immediately
        setTimeout(() => {
          localStorage.removeItem('blogsPopulated');
          seedData();
        }, 500);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!isOffline) {
        setUser(u);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isOffline]);

  useEffect(() => {
    if (!user) return;
    
    if (isOffline) {
      const storedComments = JSON.parse(localStorage.getItem('edwid_comments') || '[]');
      setComments(storedComments);
      
      // Load mock data for offline mode
      const mockBlogs = JSON.parse(localStorage.getItem('edwid_blogs') || '[]');
      if (mockBlogs.length > 0) {
        setBlogs(mockBlogs);
      } else {
        // Generate fresh mock data
        seedData();
      }
    } else {
      const qBlogs = collection(db, 'artifacts', appId, 'users', user.uid, 'blogs');
      const unsubBlogs = onSnapshot(qBlogs, (snap) => {
        const items = snap.docs.map(d => sanitizeBlog({ id: d.id, ...d.data() }));
        
        // Filter out mock data when online - only show real user blogs
        const realBlogs = items.filter(blog => !blog.id.startsWith('mock_blog_'));
        
        setBlogs(realBlogs);
        console.log('Loaded blogs (total):', realBlogs.length, 'active:', realBlogs.filter(b => !b.isDeleted).length, 'deleted:', realBlogs.filter(b => b.isDeleted).length);
        
        // Store real blogs for offline use
        localStorage.setItem('edwid_real_blogs', JSON.stringify(realBlogs));
      }, (err) => {
         console.error('Firebase connection error:', err);
         if (err.code === 'permission-denied' || err.code === 'unavailable') {
           handleOfflineMode();
         }
      });

      const qComments = collection(db, 'artifacts', appId, 'users', user.uid, 'comments');
      const unsubComments = onSnapshot(qComments, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setComments(items);
      });

      return () => { unsubBlogs(); unsubComments(); };
    }
  }, [user, isOffline]);

  useEffect(() => {
    const activeBlogs = blogs.filter(b => !b.isDeleted);
    const trashedBlogs = blogs.filter(b => b.isDeleted);
    setBadges({
      blogs: activeBlogs.length,
      comments: comments.length,
      trash: trashedBlogs.length
    });
  }, [blogs, comments]);

  const cleanupMockData = async () => {
    if (!user || isOffline) return;
    
    try {
      const qBlogs = collection(db, 'artifacts', appId, 'users', user.uid, 'blogs');
      const snapshot = await getDocs(qBlogs);
      
      for (const blogDoc of snapshot.docs) {
        if (blogDoc.id.startsWith('mock_blog_')) {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'blogs', blogDoc.id));
          console.log('Deleted mock blog:', blogDoc.id);
        }
      }
      console.log('Mock data cleanup completed');
    } catch (err) {
      console.error('Error cleaning mock data:', err);
    }
  };

  const handleOfflineMode = () => {
    // Show network lost notification first
    addNotification('error', 'Network Connection Lost', 'Network connection lost. Showing mock data for offline use.', '🌐');
    
    setIsOffline(true);
    setUser({ uid: 'offline-demo', email: 'demo@offline.local', isAnonymous: true });
    setAuthLoading(false);
    
    // Clear real blogs and load mock data
    setBlogs([]);
  };
  
  const onOfflineMode = handleOfflineMode;

  const seedData = async () => {
    // Only seed in offline mode
    if (!isOffline) {
      console.log('Online mode - skipping mock data seed');
      return;
    }
    
    const isBlogsPopulated = localStorage.getItem('blogsPopulated');
    if (isBlogsPopulated) {
      console.log('Blogs already populated, skipping seed');
      return;
    }

    if (!user) {
      console.log('User not ready, skipping seed');
      return;
    }

    console.log('Starting seedData function');
    setIsSeeding(true);
    const MOCK_DATA = generateMockBlogs(i18n.language);
    console.log('Generated fresh mock data:', MOCK_DATA.length, 'blogs');
    
    try {
      if (isOffline) {
        const seeded = MOCK_DATA.map((b) => ({ 
          ...b, 
          id: `mock_blog_${b.id}`, 
          isDeleted: false, 
          deletedAt: null 
        }));
        setBlogs(seeded);
        localStorage.setItem('edwid_blogs', JSON.stringify(seeded));
        console.log('✅ Blogs populated in offline mode. Total:', seeded.length);
        localStorage.setItem('blogsPopulated', 'true');
      }
    } catch (err) {
      console.error('Error in seedData function:', err);
    } finally {
      setIsSeeding(false);
      console.log('SeedData function completed');
    }
  };

  const addComment = async (text, blogId) => {
    const newC = { id: "c_" + Date.now(), author: "Current User", text, date: new Date().toISOString(), status: "Published", blogId };
    setBadges(prev => ({ ...prev, comments: prev.comments + 1 }));
    
    if (isOffline) {
      const up = [newC, ...comments];
      setComments(up);
      localStorage.setItem('edwid_comments', JSON.stringify(up));
    } else {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'comments'), newC);
    }
  };

  const deleteComment = async (id) => {
    if (isOffline) {
      const up = comments.filter(c => c.id !== id);
      setComments(up);
      localStorage.setItem('edwid_comments', JSON.stringify(up));
    } else {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'comments', id));
    }
    setBadges(prev => ({ ...prev, comments: Math.max(0, prev.comments - 1) }));
  };

  const softDeleteBlog = async (id) => {
    console.log('Soft deleting blog:', id);
    
    const blog = blogs.find(b => b.id === id);
    const blogTitle = blog?.title || 'Blog';
    
    setBlogs(prevBlogs => {
      const updated = prevBlogs.map(b => 
        b.id === id ? { ...b, isDeleted: true, deletedAt: new Date().toISOString() } : b
      );
      
      console.log('Updated blogs state. Active:', updated.filter(b => !b.isDeleted).length, 'Deleted:', updated.filter(b => b.isDeleted).length);
      
      if (!isOffline) {
        updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'blogs', id), { 
          isDeleted: true, 
          deletedAt: new Date().toISOString() 
        }).then(() => {
          console.log('Firebase updated successfully');
        }).catch(err => {
          console.error('Error updating Firebase:', err);
        });
      } else {
        localStorage.setItem('edwid_blogs', JSON.stringify(updated));
      }
      
      return updated;
    });
    
    addNotification('info', 'blogDeleted', `"${blogTitle}" ${t('blogDeletedMsg')}.`, '🗑️');
  };
  
  const handleLogout = async () => {
    if (!isOffline) {
      await signOut(auth);
    } else {
      setUser(null);
      setIsOffline(false);
    }
  };
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const values = {
    user, setUser, authLoading, isOffline, handleOfflineMode, onOfflineMode,
    activeTab, setActiveTab,
    isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed,
    blogs, setBlogs, comments, setComments, notifications, setNotifications, badges, setBadges, addNotification,
    isSeeding, seedData,
    isBlogModalOpen, setIsBlogModalOpen, editingBlog, setEditingBlog, readingBlog, setReadingBlog,
    addComment, deleteComment, softDeleteBlog, handleLogout, toggleSidebar,
    showNotif, setShowNotif, t, i18n
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
