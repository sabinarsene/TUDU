import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { getConversations, markAllMessagesRead } from '../services/messageApi';
import Chat from '../components/Chat';
import { 
  Avatar, 
  Badge, 
  Box, 
  Flex, 
  Text, 
  Input, 
  InputGroup, 
  InputLeftElement,
  Divider,
  Heading,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { Search, ArrowLeft, MessageCircle } from 'lucide-react';
import './ChatPage.css';
import { useMessages } from '../contexts/MessageContext';
import { getProfileImageUrl } from '../utils/imageUtils';

// Array of colors for avatars
const avatarColors = [
  "red.500", "orange.500", "yellow.500", "green.500", "teal.500", 
  "blue.500", "cyan.500", "purple.500", "pink.500", "linkedin.500"
];

// Function to get a deterministic color based on user name
const getAvatarColor = (name) => {
  if (!name) return "gray.500";
  
  // Get a simple hash of the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color
  const index = Math.abs(hash % avatarColors.length);
  return avatarColors[index];
};

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const { refreshUnreadCount } = useMessages();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [markingAsRead, setMarkingAsRead] = useState(false);
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgLight = useColorModeValue('white', 'gray.800');
  const bgActive = useColorModeValue('blue.50', 'blue.900');
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const textColorPrimary = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const chatBgColor = useColorModeValue('gray.50', 'gray.900');

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
        if (receiverId && !userId) {
          navigate(`/chat/${receiverId}`);
          return;
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId, navigate, user.id, location.state]);

  // Mark messages as read when a user opens a conversation
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!userId || markingAsRead) return;
      
      try {
        setMarkingAsRead(true);
        // Mark all messages from this sender as read
        await markAllMessagesRead(userId);
        
        // Update the conversations list to reflect the read status
        const updatedConversations = await getConversations();
        setConversations(updatedConversations);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      } finally {
        setMarkingAsRead(false);
      }
    };

    markMessagesAsRead();
  }, [userId]);

  // Listen for new messages to update conversations list
  useEffect(() => {
    if (!socket || !connected) return;

    const handleMessageReceived = async (message) => {
      // If this message is relevant to the current user (sender or receiver)
      if (message.sender_id === user.id || message.receiver_id === user.id) {
        // If the message is from the current open conversation, mark it as read immediately
        if (message.sender_id === parseInt(userId) && message.receiver_id === user.id) {
          try {
            await markAllMessagesRead(userId);
          } catch (err) {
            console.error('Error marking message as read:', err);
          }
        }
        
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
  }, [socket, connected, user.id, userId]);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    return conversations.filter(conv => 
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Format relative time for last message
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.round((now - date) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    
    // If it's today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false // Folosește formatul 24h
      });
    }
    
    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // If it's within a week
    if (diff < 604800) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Flex height="100vh" width="100%" alignItems="center" justifyContent="center">
        <Box 
          borderRadius="md" 
          bg={bgLight} 
          p={4} 
          boxShadow="md"
          textAlign="center"
        >
          <Text color={textColorSecondary}>Loading conversations...</Text>
        </Box>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex height="100vh" width="100%" alignItems="center" justifyContent="center">
        <Box 
          borderRadius="md" 
          bg={bgLight} 
          p={4} 
          boxShadow="md"
          textAlign="center"
        >
          <Text color="red.500">{error}</Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex height="100vh" width="100%" overflow="hidden">
      {/* Sidebar with conversations */}
      <Flex 
        direction="column" 
        width={{ base: userId ? "0" : "100%", md: "350px" }} 
        borderRight="1px solid" 
        borderColor={borderColor}
        bg={bgLight}
        overflow="hidden"
        display={{ base: userId ? "none" : "flex", md: "flex" }}
        maxHeight="100vh"
      >
        {/* Header */}
        <Flex 
          p={4} 
          align="center" 
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <Flex align="center" width="100%">
            <Box 
              as="button"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              p={2}
              mr={3}
              _hover={{ bg: bgHover }}
              onClick={() => navigate('/home')}
            >
              <Icon as={ArrowLeft} boxSize={5} />
            </Box>
            <Heading size="md" fontWeight="600">Messages</Heading>
          </Flex>
        </Flex>

        {/* Search */}
        <Box p={4} pb={2}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={Search} color={placeholderColor} />
            </InputLeftElement>
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="full"
              bg={bgHover}
              _placeholder={{ color: placeholderColor }}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
            />
          </InputGroup>
        </Box>

        {/* Conversations List */}
        <Box 
          flex="1" 
          overflowY="auto"
          height="calc(100vh - 130px)"
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '24px',
            },
          }}
        >
          {filteredConversations.length === 0 ? (
            <Flex 
              direction="column" 
              height="100%" 
              justify="center" 
              align="center" 
              p={4} 
              textAlign="center"
            >
              {searchQuery ? (
                <Box>
                  <Text color={textColorSecondary}>No conversations matching "{searchQuery}"</Text>
                </Box>
              ) : (
                <Box>
                  <Icon as={MessageCircle} boxSize={12} color="blue.400" mb={4} />
                  <Text fontWeight="medium" mb={2}>No conversations yet</Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    Start a chat from a user's profile
                  </Text>
                </Box>
              )}
            </Flex>
          ) : (
            <Box>
              {filteredConversations.map((conv) => (
                <Box
                  key={conv.user.id}
                  onClick={() => navigate(`/chat/${conv.user.id}`)}
                  cursor="pointer"
                  px={4}
                  py={3}
                  bg={conv.user.id === parseInt(userId) ? bgActive : "transparent"}
                  _hover={{ bg: conv.user.id === parseInt(userId) ? bgActive : bgHover }}
                  transition="background-color 0.2s"
                  borderLeft={conv.user.id === parseInt(userId) ? "4px solid" : "4px solid transparent"}
                  borderLeftColor="blue.500"
                >
                  <Flex>
                    <Box position="relative" mr={3}>
                      <Avatar
                        size="md"
                        name={conv.user.name}
                        src={getProfileImageUrl(conv.user)}
                        bg={getAvatarColor(conv.user.name)}
                      />
                      {conv.user.isOnline && (
                        <Badge
                          position="absolute"
                          bottom="0"
                          right="0"
                          bg="green.400"
                          borderRadius="full"
                          transform="translate(20%, 20%)"
                          boxSize="3"
                          border="2px solid white"
                        />
                      )}
                    </Box>
                    
                    <Flex flex="1" direction="column" minWidth="0">
                      <Flex justify="space-between" align="baseline" width="100%">
                        <Text 
                          fontWeight={conv.unreadCount > 0 ? "bold" : "medium"} 
                          fontSize="md"
                          noOfLines={1}
                          color={textColorPrimary}
                        >
                          {conv.user.name}
                        </Text>
                        <Text 
                          fontSize="xs" 
                          color={conv.unreadCount > 0 ? "blue.500" : textColorSecondary}
                          fontWeight={conv.unreadCount > 0 ? "bold" : "normal"}
                          ml={2}
                          flexShrink={0}
                        >
                          {formatRelativeTime(conv.lastMessage.time)}
                        </Text>
                      </Flex>
                      
                      <Flex justify="space-between" align="center" mt={1}>
                        <Text
                          fontSize="sm"
                          color={conv.unreadCount > 0 ? textColorPrimary : textColorSecondary}
                          fontWeight={conv.unreadCount > 0 ? "medium" : "normal"}
                          noOfLines={1}
                          flex="1"
                        >
                          {conv.lastMessage.sender === 'you' && <Text as="span" color={textColorSecondary}>You: </Text>}
                          {conv.lastMessage.text}
                        </Text>
                        
                        {conv.unreadCount > 0 && (
                          <Badge
                            colorScheme="blue"
                            borderRadius="full"
                            fontSize="xs"
                            px={2}
                            py={1}
                            ml={2}
                          >
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Flex>

      {/* Chat area */}
      <Flex 
        flex="1" 
        display={{ base: userId ? "flex" : "none", md: "flex" }}
        direction="column"
        position="relative"
        bg={chatBgColor}
        maxHeight="100vh"
        overflow="hidden"
      >
        {userId ? (
          <Chat 
            otherUser={conversations.find(c => c.user.id === parseInt(userId))?.user}
          />
        ) : (
          <Flex 
            height="100vh" 
            width="100%" 
            direction="column"
            align="center"
            justify="center"
            p={4}
            textAlign="center"
            overflow="hidden"
          >
            <Box 
              bg="blue.50" 
              color="blue.500" 
              borderRadius="full" 
              p={6} 
              mb={6}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={MessageCircle} boxSize={12} />
            </Box>
            <Heading size="lg" mb={4}>Your Messages</Heading>
            <Text fontSize="md" color={textColorSecondary} maxWidth="400px">
              Select a conversation to start chatting or find new people from their profile.
            </Text>
          </Flex>
        )}
        
        {/* Back button on mobile when viewing a conversation */}
        {userId && (
          <Box 
            position="absolute" 
            top={4} 
            left={4} 
            zIndex={2}
            display={{ base: "block", md: "none" }}
          >
            <Box
              as="button"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="40px"
              height="40px"
              borderRadius="full"
              bg="white"
              boxShadow="md"
              onClick={() => navigate('/chat')}
            >
              <ArrowLeft size={20} />
            </Box>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export default ChatPage;