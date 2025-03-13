// Use window.location.hostname to get the current IP or hostname
export const API_BASE_URL = `http://${window.location.hostname}:5000`;

// Export other API related configurations if needed
export const API_TIMEOUT = 5000; // 5 seconds
export const API_HEADERS = {
  'Content-Type': 'application/json'
}; 