const express = require('express');
const router = express.Router();
const { supabase } = require('../db');
// This should be a function import, not an object
const authenticateToken = require('../middleware/auth');

// Get conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all messages for this user
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        read_at,
        edited_at,
        sender_id,
        receiver_id,
        sender:users!sender_id(
          id,
          first_name,
          last_name,
          profile_image,
          user_status(
            status,
            last_seen
          )
        ),
        receiver:users!receiver_id(
          id,
          first_name,
          last_name,
          profile_image,
          user_status(
            status,
            last_seen
          )
        )
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Messages] Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Return empty array if no messages
    if (!messages || messages.length === 0) {
      return res.json([]);
    }

    // Filter messages to ensure they belong to the current user
    const userMessages = messages.filter(message => 
      message.sender_id === userId || message.receiver_id === userId
    );

    // Process messages to get unique conversations
    const conversations = userMessages.reduce((acc, message) => {
      if (!message) return acc;

      // Determine the other user in the conversation
      const otherUser = message.sender_id === userId 
        ? message.receiver 
        : message.sender;

      if (!otherUser) return acc;

      // Check if conversation already exists
      const existingConv = acc.find(conv => conv.user.id === otherUser.id);

      if (!existingConv) {
        // Create new conversation
        acc.push({
          user: {
            id: otherUser.id,
            name: `${otherUser.first_name} ${otherUser.last_name}`,
            image: otherUser.profile_image,
            isOnline: otherUser.user_status?.[0]?.status === 'online',
            lastSeen: otherUser.user_status?.[0]?.last_seen
          },
          lastMessage: {
            id: message.id,
            text: message.content,
            time: message.created_at,
            isRead: !!message.read_at,
            isEdited: !!message.edited_at,
            sender: message.sender_id === userId ? 'you' : 'them'
          },
          unreadCount: message.receiver_id === userId && !message.read_at ? 1 : 0
        });
      } else if (message.receiver_id === userId && !message.read_at) {
        // Update unread count for existing conversation
        existingConv.unreadCount++;
      }

      return acc;
    }, []);

    // Sort conversations by last message time
    conversations.sort((a, b) => 
      new Date(b.lastMessage.time) - new Date(a.lastMessage.time)
    );

    res.json(conversations);
  } catch (error) {
    console.error('[Messages] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages between current user and another user
router.get('/:userId', authenticateToken, async (req, res) => {
  const currentUserId = req.user?.id;
  const otherUserId = req.params.userId;

  if (!currentUserId || !otherUserId) {
    return res.status(400).json({ error: 'Invalid user IDs' });
  }

  try {
    // Get messages between users
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        read_at,
        edited_at,
        sender_id,
        receiver_id,
        reply_to,
        sender:users!sender_id(
          id,
          first_name,
          last_name,
          profile_image,
          user_status(
            status,
            last_seen
          )
        ),
        receiver:users!receiver_id(
          id,
          first_name,
          last_name,
          profile_image,
          user_status(
            status,
            last_seen
          )
        )
      `)
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Messages] Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Format messages
    const formattedMessages = messages.map(message => ({
      id: message.id,
      text: message.content,
      time: message.created_at,
      sender: message.sender_id === currentUserId ? 'you' : 'them',
      senderDetails: {
        ...message.sender,
        isOnline: message.sender.user_status?.[0]?.status === 'online',
        lastSeen: message.sender.user_status?.[0]?.last_seen
      },
      receiverDetails: {
        ...message.receiver,
        isOnline: message.receiver.user_status?.[0]?.status === 'online',
        lastSeen: message.receiver.user_status?.[0]?.last_seen
      },
      isRead: !!message.read_at,
      isEdited: !!message.edited_at,
      replyTo: message.reply_to
    }));

    // Mark unread messages as read
    const unreadMessages = messages.filter(m => 
      m.sender_id === otherUserId && 
      m.receiver_id === currentUserId && 
      !m.read_at
    );

    if (unreadMessages.length > 0) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadMessages.map(m => m.id));

      if (updateError) {
        console.error('[Messages] Error marking messages as read:', updateError);
      }
    }

    res.json(formattedMessages);
  } catch (error) {
    console.error('[Messages] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a new message
router.post('/', authenticateToken, async (req, res) => {
  const senderId = req.user?.id;
  const { receiverId, content, replyTo } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        reply_to: replyTo,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[Messages] Database error:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    res.json(message);
  } catch (error) {
    console.error('[Messages] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Edit a message
router.put('/:messageId', authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  const messageId = req.params.messageId;
  const { content } = req.body;

  if (!userId || !messageId || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: message, error } = await supabase
      .from('messages')
      .update({
        content,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Messages] Database error:', error);
      return res.status(500).json({ error: 'Failed to edit message' });
    }

    res.json(message);
  } catch (error) {
    console.error('[Messages] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  const messageId = req.params.messageId;

  if (!userId || !messageId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: message, error } = await supabase
      .from('messages')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Messages] Database error:', error);
      return res.status(500).json({ error: 'Failed to delete message' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Messages] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test authentication route
router.get('/test-auth', authenticateToken, (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({ user: req.user });
});

module.exports = router;