"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { Box, VStack, HStack, Input, Text, Avatar, IconButton, InputGroup, InputLeftElement, Badge, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Chat from '../components/Chat/Chat';
import "./MessagesPage.css";

const MessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/messages/conversations`);
        setConversations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast({
          title: 'Error loading conversations',
          description: error.response?.data?.error || 'Something went wrong',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        setLoading(false);
      }
    };

    loadConversations();
  }, [toast]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box h="100vh" bg="gray.50">
      {userId ? (
        // Chat view
        <Box h="100%">
          <HStack
            p={4}
            bg="white"
            borderBottomWidth="1px"
            borderColor="gray.200"
            position="sticky"
            top={0}
            zIndex={1}
          >
            <IconButton
              icon={<ArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/messages')}
            />
            <Text fontWeight="bold">
              {conversations.find(c => c.user.id === parseInt(userId))?.user.name || 'Chat'}
            </Text>
          </HStack>

          <Chat receiverId={userId} />
        </Box>
      ) : (
        // Conversations list view
        <Box h="100%">
          <Box
            p={4}
            bg="white"
            borderBottomWidth="1px"
            borderColor="gray.200"
            position="sticky"
            top={0}
            zIndex={1}
          >
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Messages
            </Text>

            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Box>

          <VStack spacing={0} align="stretch" pb={4}>
            {loading ? (
              <Box p={4} textAlign="center">
                Loading...
              </Box>
            ) : filteredConversations.length === 0 ? (
              <Box p={4} textAlign="center" color="gray.500">
                No conversations found
              </Box>
            ) : (
              filteredConversations.map((conv) => (
                <Box
                  key={conv.user.id}
                  p={4}
                  bg="white"
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                  cursor="pointer"
                  onClick={() => navigate(`/messages/${conv.user.id}`)}
                  _hover={{ bg: 'gray.50' }}
                >
                  <HStack spacing={4}>
                    <Box position="relative">
                      <Avatar
                        size="md"
                        name={conv.user.name}
                        src={conv.user.image}
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
                        />
                      )}
                    </Box>

                    <Box flex="1">
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="bold">
                          {conv.user.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(conv.lastMessage.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </HStack>

                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          noOfLines={1}
                          flex="1"
                        >
                          {conv.lastMessage.sender === 'you' && 'You: '}
                          {conv.lastMessage.text}
                        </Text>

                        {conv.unreadCount > 0 && (
                          <Badge
                            colorScheme="blue"
                            borderRadius="full"
                            px={2}
                          >
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  </HStack>
                </Box>
              ))
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default MessagesPage;

