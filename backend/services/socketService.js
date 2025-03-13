const { Server } = require('socket.io');
const { supabase } = require('../db');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io'
    });

    this.userSockets = new Map(); // userId -> socketId
    this.typingUsers = new Map(); // userId -> Set of typing users

    // Set up authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', this.handleConnection.bind(this));
  }

  async handleConnection(socket) {
    const userId = socket.userId;
    console.log(`[Socket] User ${userId} connected`);

    // Store socket mapping
    this.userSockets.set(userId, socket.id);

    // Update user status to online
    await this.updateUserStatus(userId, 'online');

    // Set up event listeners
    socket.on('disconnect', () => this.handleDisconnect(socket));
    socket.on('send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('edit_message', (data) => this.handleEditMessage(socket, data));
    socket.on('delete_message', (data) => this.handleDeleteMessage(socket, data));
    socket.on('typing', (receiverId) => this.handleTyping(socket, receiverId));
    socket.on('stop_typing', (receiverId) => this.handleStopTyping(socket, receiverId));
    socket.on('message_read', (data) => this.handleMessageRead(socket, data));
  }

  async handleDisconnect(socket) {
    const userId = socket.userId;
    console.log(`[Socket] User ${userId} disconnected`);

    this.userSockets.delete(userId);
    await this.updateUserStatus(userId, 'offline');
  }

  async updateUserStatus(userId, status) {
    try {
      const { error } = await supabase
        .from('user_status')
        .upsert({
          user_id: userId,
          status,
          last_seen: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('[Socket] Error updating user status:', error);
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { receiverId, content, replyTo = null } = data;
      
      if (!receiverId || !content) {
        throw new Error('Missing required fields');
      }

      const senderId = socket.userId;

      // Save message to database
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          reply_to: replyTo,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          sender:users!sender_id(
            id, first_name, last_name, profile_image,
            user_status(status, last_seen)
          ),
          receiver:users!receiver_id(
            id, first_name, last_name, profile_image,
            user_status(status, last_seen)
          )
        `)
        .single();

      if (error) throw error;

      // Send to both sender and receiver
      socket.emit('message_received', message);
      const receiverSocket = this.userSockets.get(receiverId);
      if (receiverSocket) {
        this.io.to(receiverSocket).emit('message_received', message);
      }
    } catch (error) {
      console.error('[Socket] Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  }

  async handleEditMessage(socket, data) {
    try {
      const { messageId, content } = data;
      
      if (!messageId || !content) {
        throw new Error('Missing required fields');
      }

      const { data: message, error } = await supabase
        .from('messages')
        .update({
          content,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', socket.userId)
        .select()
        .single();

      if (error) throw error;

      // Notify both users
      socket.emit('message_updated', message);
      const receiverSocket = this.userSockets.get(message.receiver_id);
      if (receiverSocket) {
        this.io.to(receiverSocket).emit('message_updated', message);
      }
    } catch (error) {
      console.error('[Socket] Error editing message:', error);
      socket.emit('message_error', { error: 'Failed to edit message' });
    }
  }

  async handleDeleteMessage(socket, data) {
    try {
      const { messageId } = data;
      
      if (!messageId) {
        throw new Error('Missing messageId');
      }

      const { data: message, error } = await supabase
        .from('messages')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', socket.userId)
        .select()
        .single();

      if (error) throw error;

      // Notify both users
      socket.emit('message_deleted', { messageId });
      const receiverSocket = this.userSockets.get(message.receiver_id);
      if (receiverSocket) {
        this.io.to(receiverSocket).emit('message_deleted', { messageId });
      }
    } catch (error) {
      console.error('[Socket] Error deleting message:', error);
      socket.emit('message_error', { error: 'Failed to delete message' });
    }
  }

  handleTyping(socket, receiverId) {
    const senderId = socket.userId;
    const receiverSocket = this.userSockets.get(receiverId);

    if (!this.typingUsers.has(receiverId)) {
      this.typingUsers.set(receiverId, new Set());
    }

    this.typingUsers.get(receiverId).add(senderId);

    if (receiverSocket) {
      this.io.to(receiverSocket).emit('user_typing', { userId: senderId });
    }
  }

  handleStopTyping(socket, receiverId) {
    const senderId = socket.userId;
    const receiverSocket = this.userSockets.get(receiverId);

    if (this.typingUsers.has(receiverId)) {
      this.typingUsers.get(receiverId).delete(senderId);
    }

    if (receiverSocket) {
      this.io.to(receiverSocket).emit('user_stopped_typing', { userId: senderId });
    }
  }

  async handleMessageRead(socket, data) {
    try {
      const { messageId } = data;
      
      if (!messageId) {
        throw new Error('Missing messageId');
      }

      const { data: message, error } = await supabase
        .from('messages')
        .update({
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('receiver_id', socket.userId)
        .select()
        .single();

      if (error) throw error;

      // Notify sender
      const senderSocket = this.userSockets.get(message.sender_id);
      if (senderSocket) {
        this.io.to(senderSocket).emit('message_read', { messageId });
      }
    } catch (error) {
      console.error('[Socket] Error marking message as read:', error);
    }
  }
}

module.exports = SocketService;