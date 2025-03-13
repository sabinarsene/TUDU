import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { getConversations } from '../services/messageApi';
import Chat from '../components/Chat';
import './ChatPage.css';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shouldAutoRedirect, setShouldAutoRedirect] = useState(true);

  // Load conversations
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const data = await getConversations();
        
        // Verificăm dacă avem date valide
        if (!data || !Array.isArray(data)) {
          setConversations([]);
          setError('Nu s-au putut încărca conversațiile');
          setLoading(false);
          return;
        }
        
        // Nu mai filtrăm conversațiile, deoarece backend-ul ar trebui să returneze doar conversațiile utilizatorului curent
        setConversations(data);
        setError(null);

        // Check if we have a receiverId in the location state (from profile page)
        const receiverId = location.state?.receiverId;
        
        // If we have a receiverId in state, navigate to that chat
        if (receiverId && !userId && shouldAutoRedirect) {
          navigate(`/chat/${receiverId}`);
          setShouldAutoRedirect(false);
          return;
        }
        
        // If no userId is selected and we have conversations, select the first one
        // Only redirect if shouldAutoRedirect is true (first load)
        if (!userId && data.length > 0 && shouldAutoRedirect) {
          navigate(`/chat/${data[0].user.id}`);
          setShouldAutoRedirect(false);
        } else {
          // If we're on /chat and we don't want to auto-redirect, just show the conversations
          setShouldAutoRedirect(false);
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId, navigate, user.id, location.state, shouldAutoRedirect]);

  // Listen for new messages to update conversations list
  useEffect(() => {
    if (!socket || !connected) return;

    const handleMessageReceived = async (message) => {
      // If this message is relevant to the current user (sender or receiver)
      if (message.sender_id === user.id || message.receiver_id === user.id) {
        // Refresh the conversations list
        try {
          const data = await getConversations();
          if (data && Array.isArray(data)) {
            setConversations(data);
          }
        } catch (err) {
          console.error('Error refreshing conversations after new message:', err);
        }
      }
    };

    socket.on('message_received', handleMessageReceived);

    return () => {
      socket.off('message_received', handleMessageReceived);
    };
  }, [socket, connected, user.id]);

  if (loading) {
    return <div className="chat-page-loading">Loading chats...</div>;
  }

  if (error) {
    return <div className="chat-page-error">{error}</div>;
  }

  return (
    <div className="chat-page">
      <div className="conversations-sidebar">
        <h2>Messages</h2>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <p className="no-conversations-hint">Start a chat from a user's profile</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.user.id}
                className={`conversation-item ${
                  conversation.user.id === parseInt(userId) ? 'active' : ''
                }`}
                onClick={() => navigate(`/chat/${conversation.user.id}`)}
              >
                <div className="conversation-avatar">
                  <img
                    src={conversation.user.image || '/default-avatar.png'}
                    alt={conversation.user.name}
                  />
                  {conversation.user.isOnline && (
                    <span className="online-indicator" />
                  )}
                </div>
                <div className="conversation-details">
                  <div className="conversation-header">
                    <h3>{conversation.user.name}</h3>
                    <span className="last-message-time">
                      {new Date(conversation.lastMessage.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="last-message">
                    {conversation.lastMessage.sender === 'you' && 'You: '}
                    {conversation.lastMessage.text}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="unread-count">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="chat-area">
        {userId ? (
          <Chat 
            otherUser={conversations.find(c => c.user.id === parseInt(userId))?.user}
          />
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start chatting</p>
            <p>or find a user to chat with from their profile</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;