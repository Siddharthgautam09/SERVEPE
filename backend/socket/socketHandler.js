const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Order = require('../models/Order');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log('Socket auth attempt with token:', token ? 'present' : 'missing');
    
    if (!token) {
      console.log('No token provided for socket authentication');
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found for socket authentication');
      return next(new Error('User not found'));
    }

    console.log('Socket authenticated for user:', user.firstName, user._id);
    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io, socket) => {
  console.log(`User ${socket.user.firstName} (${socket.userId}) connected with socket ID: ${socket.id}`);

  // Join user to their personal room for direct messaging
  socket.join(`user_${socket.userId}`);
  console.log(`User ${socket.userId} joined personal room: user_${socket.userId}`);

  // Join conversation room
  socket.on('join_conversation', (data) => {
    const { conversationId, otherUserId, orderId } = data;
    console.log('Join conversation request:', data);
    
    if (conversationId) {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation room: ${conversationId}`);
    }
    
    // Also join order-specific room if it's an order conversation
    if (orderId) {
      const orderRoom = `order_${orderId}`;
      socket.join(orderRoom);
      console.log(`User ${socket.userId} joined order room: ${orderRoom}`);
    }
  });

  // Leave conversation room
  socket.on('leave_conversation', (data) => {
    const { conversationId, orderId } = data;
    console.log('Leave conversation request:', data);
    
    if (conversationId) {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation room: ${conversationId}`);
    }
    
    if (orderId) {
      const orderRoom = `order_${orderId}`;
      socket.leave(orderRoom);
      console.log(`User ${socket.userId} left order room: ${orderRoom}`);
    }
  });

  // Handle new message
  socket.on('send_message', async (messageData) => {
    try {
      console.log('Received socket message from user:', socket.userId, messageData);
      
      const { recipientId, content, messageType = 'text', orderId } = messageData;

      if (!content || !recipientId) {
        console.log('Missing required fields for message');
        socket.emit('message_error', { error: 'Missing required fields' });
        return;
      }

      let actualRecipientId = recipientId;

      // Handle order-specific conversations where recipientId might be 'unknown'
      if (orderId && recipientId === 'unknown') {
        const order = await Order.findById(orderId).populate('client freelancer');
        if (!order) {
          console.log('Order not found for message');
          socket.emit('message_error', { error: 'Order not found' });
          return;
        }

        // Determine recipient based on current user
        if (order.client._id.toString() === socket.userId) {
          actualRecipientId = order.freelancer._id.toString();
        } else if (order.freelancer._id.toString() === socket.userId) {
          actualRecipientId = order.client._id.toString();
        } else {
          console.log('User not authorized for this order');
          socket.emit('message_error', { error: 'Not authorized for this order' });
          return;
        }
      }

      // Basic content filtering
      const lowerCaseContent = content.toLowerCase();
      const filteredWords = ['phone', 'number', 'whatsapp', 'telegram', 'instagram', 'email', 'address'];
      const containsFilteredWord = filteredWords.some(word => lowerCaseContent.includes(word));
      const isFiltered = containsFilteredWord;

      // Create conversation ID
      const conversationId = orderId ? `order_${orderId}` : [socket.userId, actualRecipientId].sort().join('_');

      const message = await Message.create({
        conversationId,
        participants: [socket.userId, actualRecipientId],
        sender: socket.userId,
        recipient: actualRecipientId,
        messageType,
        content,
        order: orderId || null,
        isFiltered
      });

      await message.populate('sender', 'firstName lastName profilePicture role');
      await message.populate('recipient', 'firstName lastName profilePicture role');
      if (orderId) {
        await message.populate('order', 'orderNumber status client freelancer', {
          populate: {
            path: 'client freelancer',
            select: 'firstName lastName profilePicture role'
          }
        });
      }

      console.log('Created message via socket:', message._id);

      // Broadcast to all relevant rooms
      const rooms = [
        `user_${socket.userId}`,
        `user_${actualRecipientId}`,
        conversationId
      ];

      if (orderId) {
        rooms.push(`order_${orderId}`);
      }

      // Send to all rooms
      rooms.forEach(room => {
        console.log(`Broadcasting message to room: ${room}`);
        io.to(room).emit('newMessage', message);
      });

      // Update order's last message timestamp
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { lastMessageAt: new Date() });
      }

      // Send success confirmation to sender
      socket.emit('message_sent', { messageId: message._id, success: true });

      if (isFiltered) {
        socket.emit('message_filtered', { 
          messageId: message._id,
          warning: "Your message contained potentially sensitive information and was filtered."
        });
      }

    } catch (error) {
      console.error('Socket send message error:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', ({ recipientId, conversationId }) => {
    console.log(`User ${socket.userId} started typing to ${recipientId} in ${conversationId}`);
    
    // Send to recipient's personal room and conversation room
    io.to(`user_${recipientId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.firstName,
      conversationId
    });
    
    if (conversationId) {
      socket.to(conversationId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.firstName,
        conversationId
      });
    }
  });

  socket.on('typing_stop', ({ recipientId, conversationId }) => {
    console.log(`User ${socket.userId} stopped typing to ${recipientId} in ${conversationId}`);
    
    io.to(`user_${recipientId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      conversationId
    });
    
    if (conversationId) {
      socket.to(conversationId).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId
      });
    }
  });

  // Handle proposal updates
  socket.on('proposal_update', (proposalData) => {
    console.log('Proposal update received:', proposalData);
    if (proposalData.clientId) {
      io.to(`user_${proposalData.clientId}`).emit('proposal_updated', proposalData);
    }
    if (proposalData.freelancerId) {
      io.to(`user_${proposalData.freelancerId}`).emit('proposal_updated', proposalData);
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.user.firstName} (${socket.userId}) disconnected - Reason: ${reason}`);
  });

  // Handle reconnection
  socket.on('reconnect', () => {
    console.log(`User ${socket.user.firstName} (${socket.userId}) reconnected`);
  });
};

module.exports = {
  socketAuth,
  handleConnection
};