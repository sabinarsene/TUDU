import React from 'react';
import { Box, VStack, Text, Avatar, Flex } from '@chakra-ui/react';

export function ChatList({ chats, selectedChat, onSelectChat }) {
  return (
    <VStack spacing={0} align="stretch" className="chat-list">
      {chats.map((chat) => (
        <Box
          key={chat.userId}
          className={`chat-item ${selectedChat?.userId === chat.userId ? 'active' : ''}`}
          onClick={() => onSelectChat(chat)}
          p={3}
          cursor="pointer"
          _hover={{ bg: 'gray.50' }}
          bg={selectedChat?.userId === chat.userId ? 'blue.50' : 'white'}
        >
          <Flex align="center">
            <Avatar size="sm" name={chat.userName} src={chat.userAvatar} />
            <Box ml={3} flex={1}>
              <Text fontWeight="medium">{chat.userName}</Text>
              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                {chat.lastMessage}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">
                {new Date(chat.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              {chat.unreadCount > 0 && (
                <Box
                  bg="blue.500"
                  color="white"
                  borderRadius="full"
                  px={2}
                  py={1}
                  fontSize="xs"
                  textAlign="center"
                  mt={1}
                >
                  {chat.unreadCount}
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}