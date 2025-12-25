import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DeletedBlogCard = ({ blog, onRestore, onDelete }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Content */}
      <div className="p-4">
        {/* Header with Image, Title, and Badge */}
        <div className="flex gap-3 mb-4">
          {/* Thumbnail */}
          <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
            {blog.image ? (
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300" />
            )}
          </div>

          {/* Title and Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{blog.title}</h3>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                {t('deleted')}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {t('deleted')}: {blog.deletedAt ? new Date(blog.deletedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRestore}
            className="flex-1 flex items-center justify-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded text-xs transition-colors"
          >
            <RotateCcw size={14} />
            {t('restore')}
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-3 rounded text-xs transition-colors"
          >
            <Trash2 size={14} />
            {t('purge')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletedBlogCard;
