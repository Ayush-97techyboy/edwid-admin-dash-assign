export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const isOldTrash = (deletedAt) => {
  if (!deletedAt) return false;
  // Check if deleted more than 30 minutes ago for demo purposes
  return Math.ceil(Math.abs(new Date() - new Date(deletedAt)) / (1000 * 60)) > 30;
};

export const getRecentDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const getMonthsArray = () => {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
};

export const getDaysAgo = (dateString) => {
  if (!dateString) return '0 days ago';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
  return `${Math.floor(diff / 365)} years ago`;
};

// Mock analytics data for the entire year
export const generateMockAnalyticsData = () => {
  const months = getMonthsArray();
  const analyticsData = {};
  
  months.forEach((month, idx) => {
    // Generate data points for each week of the month
    const baseVisitors = 1000 + (idx * 200) + Math.random() * 500;
    analyticsData[month] = [
      Math.floor(baseVisitors * 0.7),
      Math.floor(baseVisitors * 0.85),
      Math.floor(baseVisitors * 0.95),
      Math.floor(baseVisitors * 1.1),
      Math.floor(baseVisitors * 1.2),
      Math.floor(baseVisitors * 1.3),
      Math.floor(baseVisitors * 1.15)
    ];
  });
  
  return analyticsData;
};
