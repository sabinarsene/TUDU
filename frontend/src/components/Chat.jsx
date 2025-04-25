import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, sendMessage, markMessageRead } from '../services/messageApi';
import { getProfileImageUrl, handleImageError } from '../utils/imageUtils';
import { Avatar, Box, Flex, Text, Input, Button, VStack, HStack, Spinner, Icon } from '@chakra-ui/react';
import { SendHorizontal, Phone, Video, MoreVertical } from 'lucide-react';

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
  const inputRef = useRef(null);

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
        
        setMessages(data);
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

  // Focus input field when chat partner changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [chatPartner]);

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

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach(message => {
      const messageDate = new Date(message.time).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = { date: messageDate, messages: [] };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

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
      
      // Focus back on input field
      inputRef.current?.focus();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <Flex height="100%" alignItems="center" justifyContent="center">
        <Spinner color="blue.500" size="xl" thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex height="100%" alignItems="center" justifyContent="center">
        <Text color="red.500">{error}</Text>
      </Flex>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <Flex direction="column" height="100%" bg="gray.50" overflow="hidden">
      {/* Chat header */}
      {chatPartner && (
        <Flex 
          p={3} 
          bg="white" 
          alignItems="center" 
          justifyContent="space-between"
          borderBottom="1px solid" 
          borderColor="gray.200"
          position="sticky"
          top={0}
          zIndex={1}
        >
          <HStack spacing={3}>
            <Avatar 
              name={chatPartner.name}
              src={getProfileImageUrl(chatPartner)}
              size="md"
              bg={!getProfileImageUrl(chatPartner) ? "blue.500" : undefined}
              color="white"
            />
            <Box>
              <Text fontWeight="bold">{chatPartner.name}</Text>
              <Text fontSize="xs" color={chatPartner.isOnline ? "green.500" : "gray.500"}>
                {chatPartner.isOnline ? 'Online' : 'Offline'}
              </Text>
            </Box>
          </HStack>
          <HStack spacing={2}>
            <Icon as={Phone} boxSize={6} color="blue.500" cursor="pointer" />
            <Icon as={Video} boxSize={6} color="blue.500" cursor="pointer" />
            <Icon as={MoreVertical} boxSize={6} color="gray.500" cursor="pointer" />
          </HStack>
        </Flex>
      )}

      {/* Messages container */}
      <VStack 
        flex="1" 
        overflowY="auto" 
        spacing={4} 
        p={4} 
        align="stretch"
        height="calc(100% - 120px)"
        css={{
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '24px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#A0AEC0' }
        }}
      >
        {messageGroups.map((group, groupIndex) => (
          <VStack key={groupIndex} spacing={4} align="stretch">
            <Flex justify="center" my={2}>
              <Text fontSize="xs" color="gray.500" bg="gray.100" px={3} py={1} borderRadius="full">
                {formatDate(group.date)}
              </Text>
            </Flex>
            
            {group.messages.map((message, index) => {
              const prevMessage = group.messages[index - 1];
              const nextMessage = group.messages[index + 1];
              const isFirstInSequence = !prevMessage || prevMessage.sender !== message.sender;
              const isLastInSequence = !nextMessage || nextMessage.sender !== message.sender;
              
              return (
                <Flex 
                  key={message.id} 
                  justify={message.sender === 'you' ? 'flex-end' : 'flex-start'}
                  mb={isLastInSequence ? 3 : 1}
                >
                  <Flex maxWidth="75%" direction="column">
                    <Box
                      bg={message.sender === 'you' ? 'blue.500' : 'white'}
                      color={message.sender === 'you' ? 'white' : 'black'}
                      px={4}
                      py={2}
                      borderRadius={12}
                      boxShadow="sm"
                      borderTopLeftRadius={message.sender !== 'you' && !isFirstInSequence ? 4 : 12}
                      borderTopRightRadius={message.sender === 'you' && !isFirstInSequence ? 4 : 12}
                      borderBottomLeftRadius={message.sender !== 'you' && !isLastInSequence ? 4 : 12}
                      borderBottomRightRadius={message.sender === 'you' && !isLastInSequence ? 4 : 12}
                    >
                      <Text>{message.text}</Text>
                    </Box>
                    <HStack 
                      spacing={1} 
                      alignSelf={message.sender === 'you' ? 'flex-end' : 'flex-start'}
                      mt={1}
                    >
                      <Text fontSize="xs" color="gray.500">
                        {new Date(message.time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false
                        })}
                      </Text>
                      {message.isEdited && (
                        <Text fontSize="xs" color="gray.500">(edited)</Text>
                      )}
                    </HStack>
                  </Flex>
                </Flex>
              );
            })}
          </VStack>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      {/* Message input */}
      <Flex 
        as="form" 
        onSubmit={handleSendMessage} 
        p={4} 
        bg="white" 
        borderTop="1px solid" 
        borderColor="gray.200"
      >
        <Input
          ref={inputRef}
          flex="1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          borderRadius="full"
          mr={2}
          bg="gray.100"
          _focus={{ bg: "white", borderColor: "blue.500" }}
        />
        <Button 
          type="submit"
          isDisabled={!newMessage.trim()}
          colorScheme="blue" 
          borderRadius="full"
          px={5}
          leftIcon={<SendHorizontal size={18} />}
        >
          Send
        </Button>
      </Flex>
    </Flex>
  );
};

export default Chat; 