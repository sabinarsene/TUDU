import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage, markMessageRead } from '../../services/messageApi';
import { getImageUrl } from '../../utils/imageUtils';
import './Chat.css';

const Chat = ({ otherUser }) => {
  // Hooks and state
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Message loading
  useEffect(() => {
    const loadMessages = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const data = await getMessages(userId);
        setMessages(data);
        setError(null);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [userId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !connected || !user?.id) return;

    const handleMessageReceived = (message) => {
      if (message.sender_id === userId || message.receiver_id === userId) {
        setMessages(prev => [...prev, {
          ...message,
          sender: message.sender_id === user.id ? 'you' : 'them'
        }]);
        
        // Mark message as read if we're the receiver
        if (message.sender_id === userId && !message.read_at) {
          markMessageRead(message.id).catch(console.error);
        }
      }
    };

    const handleMessageUpdated = (message) => {
      if (message.sender_id === userId || message.receiver_id === userId) {
        setMessages(prev => prev.map(m => 
          m.id === message.id ? {
            ...message,
            sender: message.sender_id === user.id ? 'you' : 'them'
          } : m
        ));
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };

    // Socket event listeners
    socket.on('message_received', handleMessageReceived);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);

    // Cleanup
    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, connected, userId, user?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message handlers
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = newMessage.trim();
    
    if (!messageText) return;

    try {
      await sendMessage(userId, messageText);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Render loading state
  if (loading) {
    return <div className="chat-loading">Loading messages...</div>;
  }

  // Render error state
  if (error) {
    return <div className="chat-error">{error}</div>;
  }

  // Main render
  return (
    <div className="chat-container">
      <div className="chat-header">
        <img 
          src={getImageUrl(otherUser?.image)} 
          alt={otherUser?.name}
          className="chat-header-avatar"
        />
        <div className="chat-header-info">
          <h3 className="chat-header-name">{otherUser?.name}</h3>
          <p className="chat-header-status">
            {otherUser?.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'you' ? 'sent' : 'received'}`}
          >
            {message.sender === 'them' && (
              <img
                src={getImageUrl(otherUser?.image)}
                alt={otherUser?.name}
                className="message-avatar"
              />
            )}
            <div className="message-content">
              <p>{message.text}</p>
              <div className="message-metadata">
                <span className="message-time">
                  {new Date(message.time).toLocaleTimeString()}
                </span>
                {message.isEdited && <span className="edited-tag">(edited)</span>}
              </div>
            </div>
            {message.sender === 'you' && (
              <img
                src={getImageUrl(user?.image)}
                alt={user?.name}
                className="message-avatar"
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;