import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/messages`;

// Configure axios instance with default headers
const messageApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
messageApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get all conversations for the current user
 * @returns {Promise<Array>} List of conversations
 */
export const getConversations = async () => {
  try {
    const response = await messageApi.get('/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get messages between current user and another user
 * @param {string} userId - ID of the other user
 * @returns {Promise<Array>} List of messages
 */
export const getMessages = async (userId) => {
  try {
    const response = await messageApi.get(`/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a new message
 * @param {string} receiverId - ID of the message receiver
 * @param {string} content - Message content
 * @param {string} replyTo - Optional ID of the message being replied to
 * @returns {Promise<Object>} Created message
 */
export const sendMessage = async (receiverId, content, replyTo = null) => {
  try {
    const response = await messageApi.post('/', {
      receiverId,
      content,
      replyTo
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Edit a message
 * @param {string} messageId - ID of the message to edit
 * @param {string} content - New message content
 * @returns {Promise<Object>} Updated message
 */
export const editMessage = async (messageId, content) => {
  try {
    const response = await messageApi.put(`/${messageId}`, { content });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} messageId - ID of the message to delete
 * @returns {Promise<Object>} Response data
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await messageApi.delete(`/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Mark a message as read
 * @param {string} messageId - ID of the message to mark as read
 * @returns {Promise<Object>} Updated message
 */
export const markMessageRead = async (messageId) => {
  try {
    const response = await messageApi.post(`/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}; 