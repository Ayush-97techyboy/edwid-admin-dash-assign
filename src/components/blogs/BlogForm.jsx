import React, { useState, useMemo, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import Button from '../ui/Button';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';

const BlogForm = ({ initialData, onClose }) => {
  const { user, isOffline, setBlogs, blogs, setBadges, addNotification } = useAppContext();
  const { t } = useTranslation();
  
  const defaultState = () => ({ title: '', description: '', category: '', author: '', image: '', publishDate: new Date().toISOString().split('T')[0], status: 'Publish', views: 0 });
  
  const normalizedInitialData = initialData ? {
    ...initialData,
    title: String(initialData.title || ''),
    description: String(initialData.description || ''),
    category: String(initialData.category || ''),
    author: String(initialData.author || ''),
    publishDate: String(initialData.publishDate || ''),
    status: String(initialData.status || 'Publish'),
    views: Number(initialData.views) || 0,
    image: String(initialData.image || '')
  } : null;
  
  const [formData, setFormData] = useState(() => {
    if (normalizedInitialData) {
      return normalizedInitialData;
    }
    // For new blogs, always use current date - force fresh calculation
    const today = new Date();
    const currentDate = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    return {
      title: '', 
      description: '', 
      category: '', 
      author: '', 
      image: '', 
      publishDate: currentDate, 
      status: 'Publish', 
      views: 0
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset date for new blogs when component mounts
  useEffect(() => {
    if (!initialData) {
      const today = new Date();
      const currentDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
      setFormData(prev => ({ ...prev, publishDate: currentDate }));
    }
  }, [initialData]);

  const isChanged = useMemo(() => JSON.stringify(formData) !== JSON.stringify(normalizedInitialData || defaultState()), [formData, normalizedInitialData]);

  const compressImage = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxWidth = 600;
        const maxHeight = 400;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        
        let quality = 0.8;
        let compressed = canvas.toDataURL('image/jpeg', quality);
        
        while (compressed.length > 500000 && quality > 0.1) {
          quality -= 0.1;
          compressed = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(compressed);
      };
      img.src = dataUrl;
    });
  };

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required!';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required!';
    }
    
    if (!formData.author.trim()) {
      errors.author = 'Author is required!';
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Category is required!';
    }
    
    if (!formData.publishDate.trim()) {
      errors.publishDate = 'Publish date is required!';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      addNotification('error', 'validationError', 'Please fill in all required fields!', '❌');
      return;
    }
    
    // Check for image errors
    if (imageError) {
      addNotification('error', 'imageError', imageError, '❌');
      return;
    }
    
    setIsSubmitting(true);
    const isNewBlog = !initialData;
    if (isNewBlog) setBadges(prev => ({ ...prev, blogs: prev.blogs + 1 })); 
    
    let imageToSave = String(formData.image).trim();
    if (imageToSave && imageToSave.startsWith('data:')) {
      imageToSave = await compressImage(imageToSave);
    }
    
    const dataToSave = {
      title: String(formData.title).trim(),
      description: String(formData.description).trim(),
      category: String(formData.category || 'Technology').trim(),
      author: String(formData.author).trim(),
      publishDate: String(formData.publishDate).trim(),
      status: String(formData.status || 'Publish').trim(),
      views: parseInt(formData.views) || 0,
      image: imageToSave
    };
    
    if (isOffline) {
      if (initialData?.id) { 
        const updated = blogs.map(b => b.id === initialData.id ? { ...b, ...dataToSave } : b); 
        setBlogs(updated); 
        localStorage.setItem('edwid_blogs', JSON.stringify(updated));
        
        // Check for status change and add notification
        if (initialData.status !== dataToSave.status) {
          if (dataToSave.status === 'Publish') {
            addNotification('success', 'Blog Published', `"${dataToSave.title}" has been published.`, '📢', { type: 'navigate', target: 'blogs' });
          } else if (dataToSave.status === 'Draft') {
            addNotification('info', 'Blog Updated to Draft', `"${dataToSave.title}" has been moved to drafts.`, '📝', { type: 'navigate', target: 'blogs' });
          }
        } else {
          addNotification('success', 'blogUpdated', `"${dataToSave.title}" ${t('blogUpdatedMsg')}.`, '✏️', { type: 'navigate', target: 'blogs' });
        }
      }
      else { 
        const newBlog = { ...dataToSave, id: "b_" + Date.now() }; 
        const updated = [newBlog, ...blogs]; 
        setBlogs(updated); 
        localStorage.setItem('edwid_blogs', JSON.stringify(updated));
        
        if (dataToSave.status === 'Publish') {
          addNotification('success', 'Blog Published', `"${dataToSave.title}" has been published.`, '📢', { type: 'navigate', target: 'blogs' });
        } else {
          addNotification('success', 'blogCreated', `"${dataToSave.title}" ${t('blogCreatedMsg')}.`, '📝', { type: 'navigate', target: 'blogs' });
        }
      }
      setIsSubmitting(false); 
      onClose();
    } else {
      try {
         if (initialData?.id) {
           await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'blogs', initialData.id), dataToSave);
           
           // Check for status change and add notification
           if (initialData.status !== dataToSave.status) {
             if (dataToSave.status === 'Publish') {
               addNotification('success', 'Blog Published', `"${dataToSave.title}" has been published.`, '📢', { type: 'navigate', target: 'blogs' });
             } else if (dataToSave.status === 'Draft') {
               addNotification('info', 'Blog Updated to Draft', `"${dataToSave.title}" has been moved to drafts.`, '📝', { type: 'navigate', target: 'blogs' });
             }
           } else {
             addNotification('success', 'blogUpdated', `"${dataToSave.title}" ${t('blogUpdatedMsg')}.`, '✏️', { type: 'navigate', target: 'blogs' });
           }
         }
         else {
           await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'blogs'), dataToSave);
           
           if (dataToSave.status === 'Publish') {
             addNotification('success', 'Blog Published', `"${dataToSave.title}" has been published.`, '📢', { type: 'navigate', target: 'blogs' });
           } else {
             addNotification('success', 'blogCreated', `"${dataToSave.title}" ${t('blogCreatedMsg')}.`, '📝', { type: 'navigate', target: 'blogs' });
           }
         }
         onClose();
      } catch (err) { 
        console.error('Firebase error:', err);
        
        // User-friendly network error messages
        let errorMessage = 'Failed to save blog. Please try again.';
        
        if (err.code === 'unavailable' || err.message.includes('network')) {
          errorMessage = 'Network connection lost. Please check your internet and try again.';
        } else if (err.code === 'permission-denied') {
          errorMessage = 'Permission denied. Please log in again.';
        } else if (err.code === 'quota-exceeded') {
          errorMessage = 'Storage quota exceeded. Please contact support.';
        }
        
        addNotification('error', 'networkError', errorMessage, '🌐');
      } finally { 
        setIsSubmitting(false); 
      }
    }
  };

  const [imageError, setImageError] = useState('');

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Clear previous errors
    setImageError('');
    
    // Validate file type - ONLY JPG and PNG
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setImageError('Only JPG and PNG images are allowed!');
      e.target.value = ''; // Clear the input
      return;
    }
    
    // Validate file size - Max 1MB
    const maxSize = 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      setImageError('Image size must be less than 1MB!');
      e.target.value = ''; // Clear the input
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(p => ({...p, image: event.target.result}));
    };
    reader.onerror = () => {
      setImageError('Error reading image file!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-xs font-bold theme-text-primary uppercase mb-3">{t('uploadCoverImage')}</label>
          <label className={`cursor-pointer w-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center hover:theme-bg-tertiary transition-colors ${
            imageError ? 'border-red-300 bg-red-50' : 'theme-border'
          }`}>
            {formData.image ? (
              <img src={formData.image} alt="preview" className="h-full w-full object-cover rounded-lg" />
            ) : (
              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-lg w-fit mx-auto mb-2">
                  <Upload size={24} className="theme-text-secondary" />
                </div>
                <p className="text-sm theme-text-secondary">{t('clickToUpload') || 'Click to upload'}</p>
              </div>
            )}
            <input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={handleImage} />
          </label>
          {imageError && (
            <p className="text-red-500 text-sm mt-2 font-medium">❌ {imageError}</p>
          )}
          <p className="theme-text-secondary text-xs mt-1">Only JPG/PNG files under 1MB allowed</p>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold theme-text-primary uppercase mb-2">{t('title')}</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => {
                setFormData({...formData, title: e.target.value});
                if (e.target.value.trim() && formErrors.title) {
                  setFormErrors(prev => ({...prev, title: ''}));
                }
              }}
              required
              placeholder={t('enterCompellingTitle')}
              className={`w-full px-4 py-2 theme-border border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8449] focus:border-transparent theme-bg-secondary theme-text-primary ${
                formErrors.title ? 'border-red-300 bg-red-50' : 'theme-border'
              }`}
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1">❌ {formErrors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold theme-text-primary uppercase mb-2">{t('author')}</label>
              <input
                type="text"
                value={formData.author}
                onChange={e => {
                  setFormData({...formData, author: e.target.value});
                  if (e.target.value.trim() && formErrors.author) {
                    setFormErrors(prev => ({...prev, author: ''}));
                  }
                }}
                required
                placeholder={t('author')}
                className={`w-full px-4 py-2 theme-border border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8449] focus:border-transparent theme-bg-secondary theme-text-primary ${
                  formErrors.author ? 'border-red-300 bg-red-50' : 'theme-border'
                }`}
              />
              {formErrors.author && (
                <p className="text-red-500 text-sm mt-1">❌ {formErrors.author}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold theme-text-primary uppercase mb-2">{t('category')}</label>
              <select
                value={formData.category}
                onChange={e => {
                  setFormData({...formData, category: e.target.value});
                  if (e.target.value && formErrors.category) {
                    setFormErrors(prev => ({...prev, category: ''}));
                  }
                }}
                className={`w-full px-4 py-2 theme-border border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8449] focus:border-transparent theme-bg-secondary theme-text-primary ${
                  formErrors.category ? 'border-red-300 bg-red-50' : 'theme-border'
                }`}
              >
                <option value="" disabled>{t('selectCategory') || 'Select category'}</option>
                <option value="Technology">{t('categoryTechnology')}</option>
                <option value="Lifestyle">{t('categoryLifestyle')}</option>
                <option value="Education">{t('categoryEducation')}</option>
                <option value="Health">{t('categoryHealth')}</option>
                <option value="Finance">{t('categoryFinance')}</option>
              </select>
              {formErrors.category && (
                <p className="text-red-500 text-sm mt-1">❌ {formErrors.category}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold theme-text-primary uppercase mb-3">{t('description')}</label>
        <textarea
          value={formData.description}
          onChange={e => {
            setFormData({...formData, description: e.target.value});
            if (e.target.value.trim() && formErrors.description) {
              setFormErrors(prev => ({...prev, description: ''}));
            }
          }}
          required
          placeholder={t('writeBlogContent')}
          className={`w-full px-4 py-3 theme-border border rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-[#ff8449] focus:border-transparent resize-none theme-bg-secondary theme-text-primary ${
            formErrors.description ? 'border-red-300 bg-red-50' : 'theme-border'
          }`}
        />
        {formErrors.description && (
          <p className="text-red-500 text-sm mt-1">❌ {formErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold theme-text-primary uppercase mb-2">{t('status')}</label>
          <select
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
            className="w-full px-4 py-2 theme-border border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8449] focus:border-transparent theme-bg-secondary theme-text-primary"
          >
            <option value="Draft">{t('draft')}</option>
            <option value="Publish">{t('Publish')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold theme-text-primary uppercase mb-2">{t('date')}</label>
          <input
            type="date"
            value={formData.publishDate}
            onChange={e => setFormData({...formData, publishDate: e.target.value})}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 theme-border border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8449] focus:border-transparent theme-bg-secondary theme-text-primary"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t theme-border">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 theme-text-primary font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isChanged}
          className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
            isSubmitting || !isChanged 
              ? 'bg-[#ff8449] opacity-50 cursor-not-allowed text-white' 
              : 'bg-[#ff8449] hover:bg-[#e6753d] text-white'
          }`}
        >
          📌 {isSubmitting ? t('saving') : initialData ? t('updateBlog') : t('saveBlog')}
        </button>
      </div>
    </form>
  );
};
export default BlogForm;
