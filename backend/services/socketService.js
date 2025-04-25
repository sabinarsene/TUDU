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

    try {
      // Verifică dacă utilizatorul există în baza de date
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error(`[Socket] User ${userId} not found or error:`, userError);
        socket.disconnect();
        return;
      }

      // Update user status to online
      await this.updateUserStatus(userId, 'online');
    } catch (err) {
      console.error(`[Socket] Error in connection handling for user ${userId}:`, err);
      // Nu deconectăm sesiunea - e mai bine să permitem conectarea chiar dacă actualizarea de status eșuează
    }

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
    try {
      const userId = socket.userId;
      console.log(`[Socket] User ${userId} disconnected`);

      // Ștergem mapearea socket-ului
      this.userSockets.delete(userId);
      
      // Verificăm dacă utilizatorul mai are alte socket-uri active
      // Dacă nu, setăm statusul la offline
      const hasOtherActiveSessions = Array.from(this.userSockets.entries())
        .some(([id, _]) => id === userId);
      
      if (!hasOtherActiveSessions) {
        await this.updateUserStatus(userId, 'offline');
      }
    } catch (error) {
      console.error('[Socket] Error in disconnect handler:', error);
    }
  }

  async updateUserStatus(userId, status) {
    try {
      // Verifică mai întâi dacă există deja o înregistrare
      const { data: existingStatus } = await supabase
        .from('user_status')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (existingStatus) {
        // Dacă înregistrarea există, actualizează-o
        const { error } = await supabase
          .from('user_status')
          .update({
            status,
            last_seen: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Dacă înregistrarea nu există, inserează o nouă înregistrare
        const { error } = await supabase
          .from('user_status')
          .insert({
            user_id: userId,
            status,
            last_seen: new Date().toISOString()
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('[Socket] Error updating user status:', error);
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { receiverId, content, replyTo = null } = data;
      
      // Validare date
      if (!receiverId) {
        throw new Error('Missing receiverId');
      }
      
      if (!content || typeof content !== 'string' || content.trim() === '') {
        throw new Error('Invalid message content');
      }

      const senderId = socket.userId;

      // Verificăm dacă utilizatorii există
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .in('id', [senderId, receiverId]);

      if (usersError) throw usersError;
      
      if (!users || users.length !== 2) {
        throw new Error('One or both users do not exist');
      }

      // Salvăm mesajul în baza de date
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim(),
          reply_to: replyTo,
          created_at: new Date().toISOString()
        })
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

      // Trimitem mesajul către expeditor și destinatar
      socket.emit('message_received', message);
      const receiverSocket = this.userSockets.get(receiverId);
      if (receiverSocket) {
        this.io.to(receiverSocket).emit('message_received', message);
      }
      
      // Returnăm mesajul către expeditor pentru confirmare
      return message;
    } catch (error) {
      console.error('[Socket] Error sending message:', error);
      socket.emit('message_error', { 
        error: 'Failed to send message', 
        details: error.message 
      });
      return null;
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
      const userId = socket.userId;
      // Putem primi fie un ID de mesaj specific, fie un ID de utilizator pentru a marca toate mesajele
      const { messageId, senderId } = data;
      
      if (!messageId && !senderId) {
        throw new Error('Missing messageId or senderId');
      }

      if (messageId) {
        // Marcăm un singur mesaj ca citit
        const { data: message, error } = await supabase
          .from('messages')
          .update({
            read_at: new Date().toISOString()
          })
          .eq('id', messageId)
          .eq('receiver_id', userId)
          .select('sender_id, id')
          .single();

        if (error) throw error;

        if (message) {
          // Notificăm expeditorul
          const senderSocket = this.userSockets.get(message.sender_id);
          if (senderSocket) {
            this.io.to(senderSocket).emit('message_read', { messageId: message.id });
          }
        }
      } else if (senderId) {
        // Marcăm toate mesajele de la un expeditor ca citite
        const { data: messages, error } = await supabase
          .from('messages')
          .update({
            read_at: new Date().toISOString()
          })
          .eq('sender_id', senderId)
          .eq('receiver_id', userId)
          .is('read_at', null)
          .select('id');

        if (error) throw error;

        if (messages && messages.length > 0) {
          // Notificăm expeditorul pentru toate mesajele
          const senderSocket = this.userSockets.get(senderId);
          if (senderSocket) {
            this.io.to(senderSocket).emit('messages_read_all', { 
              messageIds: messages.map(m => m.id),
              receiverId: userId
            });
          }
          
          // Emitem și către client
          socket.emit('messages_updated', {
            messageIds: messages.map(m => m.id),
            status: 'read'
          });
        }
      }
    } catch (error) {
      console.error('[Socket] Error marking message(s) as read:', error);
      socket.emit('message_error', { 
        error: 'Failed to mark message(s) as read',
        details: error.message
      });
    }
  }
}

module.exports = SocketService;