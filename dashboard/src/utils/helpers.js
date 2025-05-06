/**
 * Format a number with K, M suffix for thousands and millions
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
};

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50) => {
  if (!str) return '';
  
  if (str.length <= length) return str;
  
  return str.substring(0, length) + '...';
};

/**
 * Get YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if not found
 */
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Regular expression to extract YouTube video ID
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[7].length === 11) ? match[7] : null;
};

/**
 * Get YouTube thumbnail URL from video ID
 * @param {string} videoId - YouTube video ID
 * @returns {string} Thumbnail URL
 */
export const getYouTubeThumbnail = (videoId) => {
  if (!videoId) return '';
  
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
};

/**
 * Generate a random color
 * @returns {string} Random hex color
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Download data as CSV file
 * @param {Array} data - Array of objects to convert to CSV
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (data, filename) => {
  if (!data || !data.length) return;
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Wrap strings with quotes and escape existing quotes
        return typeof value === 'string' 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
