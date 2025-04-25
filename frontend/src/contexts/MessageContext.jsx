import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { getUnreadMessagesCount } from '../services/messageApi';

const MessageContext = createContext();

export const useMessages = () => {
  return useContext(MessageContext);
};

export const MessageProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  // Încarcă numărul de mesaje necitite la inițializare și când utilizatorul se schimbă
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const loadUnreadCount = async () => {
      setLoading(true);
      try {
        const count = await getUnreadMessagesCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread messages count:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUnreadCount();
  }, [user]);

  // Actualizează numărul de mesaje necitite când primim un mesaj nou
  useEffect(() => {
    if (!socket || !connected || !user) return;

    const handleMessageReceived = async (message) => {
      // Dacă mesajul este pentru utilizatorul curent și nu este trimis de el
      if (message.receiver_id === user.id && message.sender_id !== user.id) {
        // Incrementează contorul de mesaje necitite
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleMessageRead = (data) => {
      if (data.count > 0) {
        // Actualizează contorul, asigurându-ne că nu scădem sub 0
        setUnreadCount(prev => Math.max(0, prev - data.count));
      }
    };

    // Ascultă pentru evenimente de mesaje noi și mesaje citite
    socket.on('message_received', handleMessageReceived);
    socket.on('messages_read', handleMessageRead);

    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.off('messages_read', handleMessageRead);
    };
  }, [socket, connected, user]);

  // Funcție pentru a reîmprospăta manual contorul de mesaje necitite
  const refreshUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await getUnreadMessagesCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error refreshing unread messages count:', error);
    }
  };

  const value = {
    unreadCount,
    loading,
    refreshUnreadCount
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider; 