import { API_BASE_URL } from '../config/api';
import defaultProfileImage from '../assets/default-profile.jpg';

/**
 * Get the full URL for an image path
 * @param {string} path - The relative path to the image
 * @returns {string} The full URL to the image
 */
export const getImageUrl = (path) => {
  console.log("getImageUrl called with:", path);
  
  if (!path) {
    console.log("No path provided, returning default");
    return defaultProfileImage;
  }
  
  if (path.startsWith('blob:')) {
    console.log("Blob URL detected:", path);
    return path;
  }
  
  if (path.startsWith('http')) {
    console.log("Full HTTP URL detected:", path);
    return path;
  }
  
  // Make sure API_BASE_URL doesn't end with a slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  // If the path includes uploads or is an absolute path
  if (path.includes('/uploads/') || path.startsWith('/')) {
    // Make sure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${baseUrl}${normalizedPath}`;
    console.log("Server relative path, full URL:", fullUrl);
    return fullUrl;
  }
  
  // Default case for other paths
  const fullUrl = `${baseUrl}/${path}`;
  console.log("Generated URL:", fullUrl);
  return fullUrl;
};

/**
 * Get the full URL for a profile image
 * @param {string|Object} pathOrUser - The relative path to the profile image or user object
 * @returns {string|null} The full URL to the profile image or null if no image exists
 */
export const getProfileImageUrl = (pathOrUser) => {
  // If it's a user object, extract the profile image path
  if (pathOrUser && typeof pathOrUser === 'object') {
    // Check all possible property names for profile images
    // Backend uses profile_image, but frontend might transform it to profileImage
    const imagePath = 
      pathOrUser.profile_image || 
      pathOrUser.profileImage || 
      pathOrUser.image;
    
    console.log("getProfileImageUrl input:", pathOrUser);
    console.log("getProfileImageUrl extracted path:", imagePath);
    
    // Return null if no image exists, so components can display initials instead
    if (!imagePath) return null;
    
    return getImageUrl(imagePath);
  }
  
  // If it's a string path but empty, return null
  if (!pathOrUser) return null;
  
  // If it's a string path
  return getImageUrl(pathOrUser);
};

/**
 * Handle image loading errors by setting a default avatar
 * @param {Event} e - The error event
 */
export const handleImageError = (e) => {
  e.target.src = defaultProfileImage;
}; 