import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, sendMessage, markMessageRead } from '../services/messageApi';
import { getProfileImageUrl, handleImageError } from '../utils/imageUtils';
import './Chat.css';

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages(userId);
        setMessages(data);
        
        // Extract chat partner details from the first message
        if (data && data.length > 0) {
          const firstMessage = data[0];
          const partnerDetails = firstMessage.sender === 'you' 
            ? firstMessage.receiverDetails 
            : firstMessage.senderDetails;
            
          setChatPartner({
            id: partnerDetails.id,
            name: `${partnerDetails.first_name} ${partnerDetails.last_name}`,
            image: partnerDetails.profile_image,
            isOnline: partnerDetails.isOnline,
            lastSeen: partnerDetails.lastSeen
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadMessages();
    }
  }, [userId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !connected) return;

    const handleMessageReceived = (message) => {
      if (message.sender_id === userId || message.receiver_id === userId) {
        setMessages(prev => [...prev, {
          ...message,
          sender: message.sender_id === user.id ? 'you' : 'them'
        }]);
        if (message.sender_id === userId) {
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

    socket.on('message_received', handleMessageReceived);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, connected, userId, user.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const sentMessage = await sendMessage(userId, newMessage.trim());
      setNewMessage('');
      
      // Add the sent message to the messages state locally
      // This ensures the message appears immediately without waiting for socket
      setMessages(prev => [...prev, {
        id: sentMessage.id,
        text: sentMessage.content,
        time: sentMessage.created_at,
        sender: 'you',
        isRead: false,
        isEdited: false
      }]);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return <div className="chat-loading">Loading messages...</div>;
  }

  if (error) {
    return <div className="chat-error">{error}</div>;
  }

  return (
    <div className="chat-container">
      {chatPartner && (
        <div className="chat-header">
          <div className="chat-partner-info">
            <img 
              src={getProfileImageUrl(chatPartner.image)} 
              alt={chatPartner.name}
              className="chat-partner-avatar"
              onError={handleImageError}
            />
            <div className="chat-partner-details">
              <h3>{chatPartner.name}</h3>
              <span className={`status-indicator ${chatPartner.isOnline ? 'online' : 'offline'}`}>
                {chatPartner.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'you' ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {new Date(message.time).toLocaleTimeString()}
              </span>
              {message.isEdited && <span className="edited-tag">(edited)</span>}
            </div>
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
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat; 