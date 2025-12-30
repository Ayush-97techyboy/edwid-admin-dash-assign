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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Always start collapsed on mobile, check localStorage for desktop
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return true;
    }
    const saved = localStorage.getItem('edwid_sidebar_collapsed');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [badges, setBadges] = useState({ blogs: 0, comments: 0, trash: 0 });
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasMockBlogs, setHasMockBlogs] = useState(false); // Track if user has populated mock blogs in this session

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [readingBlog, setReadingBlog] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('edwid_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const addNotification = (type, titleKey, messageKey, icon = '📝', action = null) => {
    const title = typeof titleKey === 'string' && titleKey.includes(' ') ? titleKey : t(titleKey);
    const message = typeof messageKey === 'string' && messageKey.includes('"') ? messageKey : t(messageKey);
    
    const newNotif = {
      id: Date.now(),
      type,
      title,
      message,
      icon,
      timestamp: new Date().toISOString(),
      action
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
        const wasLoggedOut = !user && u; // Only true when transitioning from logged out to logged in
        setUser(u);
        setAuthLoading(false);
        
        // Only reset to dashboard when user first logs in, not on every auth state change
        if (wasLoggedOut) {
          setActiveTab('dashboard');
        }
      }
    });
    return () => unsubscribe();
  }, [isOffline, user]); // Changed dependency from activeTab to user

  useEffect(() => {
    if (!user) return;
    
    if (isOffline) {
      const storedComments = JSON.parse(localStorage.getItem('edwid_comments') || '[]');
      setComments(storedComments);
      
      // Load mock data for offline mode
      const mockBlogs = JSON.parse(localStorage.getItem('edwid_blogs') || '[]');
      if (mockBlogs.length > 0) {
        setBlogs(mockBlogs);
        setHasMockBlogs(true);
      } else {
        // Don't auto-generate mock data, wait for user to click button
        setBlogs([]);
        setHasMockBlogs(false);
      }
    } else {
      const qBlogs = collection(db, 'artifacts', appId, 'users', user.uid, 'blogs');
      const unsubBlogs = onSnapshot(qBlogs, (snap) => {
        const items = snap.docs.map(d => sanitizeBlog({ id: d.id, ...d.data() }));
        
        // Filter out mock data when online - only show real user blogs
        const realBlogs = items.filter(blog => {
          const blogId = String(blog.id || '');
          return !blogId.startsWith('mock_blog_');
        });
        
        setBlogs(realBlogs);
        setHasMockBlogs(false); // Reset mock blogs state for online mode
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

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        // On mobile, keep current state but ensure proper mobile behavior
        if (!isSidebarOpen) {
          setIsCollapsed(true);
        }
      } else {
        // On desktop, always close mobile overlay and set proper desktop state
        setIsSidebarOpen(false); // Close mobile overlay
        const saved = localStorage.getItem('edwid_sidebar_collapsed');
        setIsCollapsed(saved ? JSON.parse(saved) : true);
      }
    };

    window.addEventListener('resize', handleResize);
    // Run immediately to handle initial state
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

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
        const blogId = String(blogDoc.id || '');
        if (blogId.startsWith('mock_blog_')) {
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
        // For offline mode, store in localStorage
        const seeded = MOCK_DATA.map((b) => ({ 
          ...b, 
          id: `mock_blog_${b.id}`, 
          isDeleted: false, 
          deletedAt: null 
        }));
        setBlogs(seeded);
        localStorage.setItem('edwid_blogs', JSON.stringify(seeded));
        setHasMockBlogs(true);
        console.log('✅ Mock blogs populated in offline mode. Total:', seeded.length);
      } else {
        // For online mode, add to Firebase with session-only flag
        const batch = writeBatch(db);
        const seeded = [];
        
        for (const blog of MOCK_DATA) {
          const blogData = {
            ...blog,
            isDeleted: false,
            deletedAt: null,
            isSessionOnly: true, // Mark as session-only
            createdAt: new Date().toISOString()
          };
          const docRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'blogs'));
          batch.set(docRef, blogData);
          seeded.push({ ...blogData, id: docRef.id });
        }
        
        await batch.commit();
        setHasMockBlogs(true);
        console.log('✅ Mock blogs populated in Firebase. Total:', seeded.length);
      }
      
      addNotification('success', 'Mock Blogs Added', '10 sample blogs have been added to your dashboard for testing!', '📚');
    } catch (err) {
      console.error('Error in seedData function:', err);
      addNotification('error', 'Error', 'Failed to populate mock blogs. Please try again.', '❌');
    } finally {
      setIsSeeding(false);
      console.log('SeedData function completed');
    }
  };

  const addComment = async (text, blogId) => {
    const newC = { id: "c_" + Date.now(), author: "Current User", text, date: new Date().toISOString(), status: "Published", blogId };
    setBadges(prev => ({ ...prev, comments: prev.comments + 1 }));
    
    // Add notification for new comment with navigation action
    addNotification('info', 'New Comment', `New comment added: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, '💬', { type: 'navigate', target: 'comments' });
    
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
    
    addNotification('info', 'blogDeleted', `"${blogTitle}" ${t('blogDeletedMsg')}.`, '🗑️', { type: 'navigate', target: 'trash' });
  };
  
  const handleLogout = async () => {
    // Clear session-only mock blogs before logout
    if (!isOffline && user && hasMockBlogs) {
      try {
        const qBlogs = collection(db, 'artifacts', appId, 'users', user.uid, 'blogs');
        const snapshot = await getDocs(qBlogs);
        
        const batch = writeBatch(db);
        for (const blogDoc of snapshot.docs) {
          const blogData = blogDoc.data();
          if (blogData.isSessionOnly) {
            batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'blogs', blogDoc.id));
          }
        }
        await batch.commit();
        console.log('Session-only mock blogs cleared');
      } catch (err) {
        console.error('Error clearing session blogs:', err);
      }
    }
    
    if (!isOffline) {
      await signOut(auth);
    } else {
      setUser(null);
      setIsOffline(false);
    }
    
    // Reset all app state to initial values
    setActiveTab('dashboard');
    setIsSidebarOpen(false);
    setIsCollapsed(true);
    setEditingBlog(null);
    setReadingBlog(null);
    setIsBlogModalOpen(false);
    setShowNotif(false);
    setHasMockBlogs(false);
    
    // Clear session-specific storage
    localStorage.removeItem('edwid_sidebar_state');
    localStorage.removeItem('edwid_sidebar_collapsed');
    localStorage.removeItem('edwid_blogs'); // Clear offline mock blogs
  };
  
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('edwid_dark_mode', JSON.stringify(newMode));
    
    // Apply dark mode class to document
    if (newMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Force a repaint
    document.documentElement.style.display = 'none';
    document.documentElement.offsetHeight; // Trigger reflow
    document.documentElement.style.display = '';
  };

  // Apply dark mode on initial load
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    // Only save to localStorage on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      localStorage.setItem('edwid_sidebar_collapsed', JSON.stringify(newCollapsed));
    }
  };

  const values = {
    user, setUser, authLoading, isOffline, handleOfflineMode, onOfflineMode,
    activeTab, setActiveTab,
    isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed,
    blogs, setBlogs, comments, setComments, notifications, setNotifications, badges, setBadges, addNotification,
    isSeeding, seedData, hasMockBlogs, setHasMockBlogs,
    isBlogModalOpen, setIsBlogModalOpen, editingBlog, setEditingBlog, readingBlog, setReadingBlog,
    addComment, deleteComment, softDeleteBlog, handleLogout, toggleSidebar,
    showNotif, setShowNotif, t, i18n, isDarkMode, toggleDarkMode
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
