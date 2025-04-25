import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, getProfileImageUrl, handleImageError } from '../../utils/imageUtils';
import './ChatList.css';

const ChatList = ({ conversations, activeConversation, onSelectConversation }) => {
  const navigate = useNavigate();

  if (!conversations || conversations.length === 0) {
    return (
      <div className="no-conversations">
        <p>No conversations yet</p>
        <p className="hint">Messages will appear here when you start chatting with someone</p>
      </div>
    );
  }

  const handleSelectConversation = (conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation);
    } else {
      navigate(`/messages/${conversation.user.id}`);
    }
  };

  return (
    <div className="chat-list" style={{ maxHeight: '100%', overflowY: 'auto' }}>
      {conversations.map((conversation) => (
        <div
          key={conversation.user.id}
          className={`conversation-item ${
            activeConversation === conversation.user.id ? 'active' : ''
          }`}
          onClick={() => handleSelectConversation(conversation)}
        >
          <div className="conversation-avatar">
            <img
              src={getProfileImageUrl(conversation.user)}
              alt={conversation.user.name}
              onError={handleImageError}
            />
            {conversation.user.isOnline && (
              <span className="online-indicator" />
            )}
          </div>
          
          <div className="conversation-content">
            <div className="conversation-header">
              <h3 className="conversation-name">{conversation.user.name}</h3>
              <span className="conversation-time">
                {formatMessageTime(conversation.lastMessage.time)}
              </span>
            </div>
            
            <div className="conversation-preview">
              <p className="conversation-last-message">
                {conversation.lastMessage.sender === 'you' && <span>You: </span>}
                {conversation.lastMessage.text}
              </p>
              
              {conversation.unreadCount > 0 && (
                <span className="unread-badge">{conversation.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to format the message time
function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  // Today: show time
  if (diffInDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday: show "Yesterday"
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  
  // Within last 7 days: show day name
  if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise: show date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default ChatList;