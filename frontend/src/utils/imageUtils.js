import { API_BASE_URL } from '../config/api';
import defaultProfileImage from '../assets/default-profile.jpg';

/**
 * Get the full URL for an image path
 * @param {string} path - The relative path to the image
 * @returns {string} The full URL to the image
 */
export const getImageUrl = (path) => {
  if (!path) return defaultProfileImage;
  if (path.startsWith('blob:')) return path;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Get the full URL for a profile image
 * @param {string|Object} pathOrUser - The relative path to the profile image or user object
 * @returns {string} The full URL to the profile image
 */
export const getProfileImageUrl = (pathOrUser) => {
  // If it's a user object, extract the profile image path
  if (pathOrUser && typeof pathOrUser === 'object') {
    // Try both profileImage and profile_image properties
    const imagePath = pathOrUser.profileImage || pathOrUser.profile_image;
    return getImageUrl(imagePath);
  }
  
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