import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/api';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let socketInstance = null;

    const initializeSocket = () => {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        console.log('[Socket] No authentication token or user');
        return null;
      }

      // Initialize socket connection
      socketInstance = io(API_BASE_URL, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('[Socket] Connected to server');
        setConnected(true);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        setConnected(false);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        setConnected(false);
      });

      // Message event handlers
      socketInstance.on('message_received', (message) => {
        console.log('[Socket] Message received:', message);
      });

      socketInstance.on('message_updated', (message) => {
        console.log('[Socket] Message updated:', message);
      });

      socketInstance.on('message_deleted', ({ messageId }) => {
        console.log('[Socket] Message deleted:', messageId);
      });

      socketInstance.on('user_typing', ({ userId }) => {
        console.log('[Socket] User typing:', userId);
      });

      socketInstance.on('user_stopped_typing', ({ userId }) => {
        console.log('[Socket] User stopped typing:', userId);
      });

      socketInstance.on('message_read', ({ messageId }) => {
        console.log('[Socket] Message read:', messageId);
      });

      return socketInstance;
    };

    // Initialize socket when component mounts or user changes
    if (user) {
      socketInstance = initializeSocket();
      if (socketInstance) {
        setSocket(socketInstance);
      }
    }

    // Cleanup on unmount or user change
    return () => {
      if (socketInstance) {
        console.log('[Socket] Cleaning up connection');
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
        setSocket(null);
        setConnected(false);
      }
    };
  }, [user]);

  // Message sending helper
  const sendMessage = useCallback((receiverId, content, replyTo = null) => {
    if (socket?.connected) {
      socket.emit('send_message', {
        receiverId,
        content,
        replyTo
      });
    }
  }, [socket]);

  // Message editing helper
  const editMessage = useCallback((messageId, content) => {
    if (socket?.connected) {
      socket.emit('edit_message', {
        messageId,
        content
      });
    }
  }, [socket]);

  // Message deletion helper
  const deleteMessage = useCallback((messageId) => {
    if (socket?.connected) {
      socket.emit('delete_message', {
        messageId
      });
    }
  }, [socket]);

  // Typing notification helpers
  const startTyping = useCallback((receiverId) => {
    if (socket?.connected) {
      socket.emit('typing', receiverId);
    }
  }, [socket]);

  const stopTyping = useCallback((receiverId) => {
    if (socket?.connected) {
      socket.emit('stop_typing', receiverId);
    }
  }, [socket]);

  // Message read helper
  const markMessageRead = useCallback((messageId) => {
    if (socket?.connected) {
      socket.emit('message_read', {
        messageId
      });
    }
  }, [socket]);

  const value = {
    socket,
    connected,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    markMessageRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);