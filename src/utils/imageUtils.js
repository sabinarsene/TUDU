// Utility function to get the correct image URL
export const getImageUrl = (path) => {
  if (!path) return '/placeholder.svg';
  
  // If it's already a blob URL (for previews)
  if (path.startsWith('blob:')) {
    return path;
  }
  
  // If it's already an absolute URL
  if (path.startsWith('http')) {
    return path;
  }
  
  // If it's a relative path starting with /uploads
  if (path.startsWith('/uploads')) {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${API_URL}${path}`;
  }
  
  // If it's a relative path not starting with /uploads
  if (!path.startsWith('/')) {
    path = '/uploads/' + path;
  }
  
  // Construct the full URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${API_URL}${path}`;
};

// Utility function to handle image loading errors
export const handleImageError = (e) => {
  e.target.src = '/placeholder.svg';
}; 