const Message = require('../models/Message');
const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, messageType = 'text', files = [], orderId } = req.body;

    if (!content && (!files || files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    let actualRecipientId = recipientId;

    // Handle order-specific conversations where recipientId might be 'unknown'
    if (orderId && recipientId === 'unknown') {
      console.log('Handling order-specific conversation with orderId:', orderId);
      
      // Find the order and determine the actual recipient
      const order = await Order.findById(orderId).populate('client freelancer');
      if (!order) {
        return res.status(400).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Determine recipient based on current user
      if (order.client._id.toString() === req.user.id) {
        actualRecipientId = order.freelancer._id.toString();
      } else if (order.freelancer._id.toString() === req.user.id) {
        actualRecipientId = order.client._id.toString();
      } else {
        return res.status(400).json({
          success: false,
          message: 'You are not authorized to send messages for this order'
        });
      }

      console.log('Determined actual recipient ID:', actualRecipientId);
    }

    // Basic content filtering
    const lowerCaseContent = content.toLowerCase();
    const filteredWords = ['phone', 'number', 'whatsapp', 'telegram', 'instagram', 'email', 'address'];
    const containsFilteredWord = filteredWords.some(word => lowerCaseContent.includes(word));

    let isFiltered = false;
    if (containsFilteredWord) {
      isFiltered = true;
    }

    // Create conversation ID based on whether it's order-specific or general
    let conversationId;
    if (orderId) {
      conversationId = `order_${orderId}`;
    } else {
      conversationId = [req.user.id, actualRecipientId].sort().join('_');
    }

    console.log('Creating message with conversationId:', conversationId);

    const message = await Message.create({
      conversationId,
      participants: [req.user.id, actualRecipientId],
      sender: req.user.id,
      recipient: actualRecipientId,
      messageType,
      content,
      attachments: files,
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

    console.log('Message created successfully:', message._id);

    // Update order's last message timestamp
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { lastMessageAt: new Date() });
    }

    let warning = null;
    if (isFiltered) {
      warning = "Your message contained potentially sensitive information and was filtered. Please avoid sharing personal contact details.";
    }

    res.status(201).json({
      success: true,
      data: message,
      warning
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Get conversation with order-specific filtering
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, orderId } = req.query;
    const skip = (page - 1) * limit;

    console.log('Getting conversation for userId:', userId, 'orderId:', orderId);

    let actualUserId = userId;

    // Handle order-specific conversations where userId might be 'unknown'
    if (orderId && userId === 'unknown') {
      console.log('Handling order-specific conversation lookup with orderId:', orderId);
      
      // Find the order and determine the actual other user
      const order = await Order.findById(orderId).populate('client freelancer');
      if (!order) {
        return res.status(400).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Determine other user based on current user
      if (order.client._id.toString() === req.user.id) {
        actualUserId = order.freelancer._id.toString();
      } else if (order.freelancer._id.toString() === req.user.id) {
        actualUserId = order.client._id.toString();
      } else {
        return res.status(400).json({
          success: false,
          message: 'You are not authorized to view this conversation'
        });
      }

      console.log('Determined actual other user ID:', actualUserId);
    }

    // Create conversation ID based on whether it's order-specific or general
    let conversationId;
    if (orderId) {
      conversationId = `order_${orderId}`;
    } else {
      conversationId = [req.user.id, actualUserId].sort().join('_');
    }

    console.log('Looking for conversationId:', conversationId);

    const messages = await Message.find({
      conversationId,
      participants: { $all: [req.user.id, actualUserId] }
    })
    .populate('sender', 'firstName lastName profilePicture role')
    .populate('recipient', 'firstName lastName profilePicture role')
    .populate('order', 'orderNumber status client freelancer', {
      populate: {
        path: 'client freelancer',
        select: 'firstName lastName profilePicture role'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    const total = await Message.countDocuments({
      conversationId,
      participants: { $all: [req.user.id, actualUserId] }
    });

    console.log('Found messages:', messages.length);

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation'
    });
  }
};

// Get conversations list with order-specific grouping
exports.getConversationsList = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Getting conversations list for userId:', userId);

    // Get all conversations where user is a participant
    const conversations = await Message.aggregate([
      {
        $match: {
          participants: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    console.log('Found conversations:', conversations.length);

    // Populate user details and order information
    await Message.populate(conversations, [
      {
        path: 'lastMessage.sender',
        select: 'firstName lastName profilePicture role'
      },
      {
        path: 'lastMessage.recipient',
        select: 'firstName lastName profilePicture role'
      },
      {
        path: 'lastMessage.order',
        select: 'orderNumber status client freelancer',
        populate: {
          path: 'client freelancer',
          select: 'firstName lastName profilePicture role'
        }
      }
    ]);

    // Format the response with proper orderId extraction
    const formattedConversations = conversations.map(conv => {
      const isOrderSpecific = conv._id.startsWith('order_');
      let orderId = null;
      
      if (isOrderSpecific) {
        orderId = conv._id.replace('order_', '');
      }

      return {
        _id: conv._id,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
        isOrderSpecific,
        orderId
      };
    });

    console.log('Formatted conversations:', formattedConversations.length);

    res.status(200).json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Get conversations list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
};

// Mark conversation as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    const result = await Message.updateMany(
      {
        conversationId: conversationId,
        recipient: userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread messages count'
    });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      role: 'admin',
      _id: { $ne: req.user.id }
    };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('firstName lastName email profilePicture')
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin users'
    });
  }
};

exports.adminSendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const message = await Message.create({
      conversationId: `admin_${req.user.id}_${recipientId}`,
      sender: req.user.id,
      recipient: recipientId,
      messageType: 'text',
      content
    });

    await message.populate('sender', 'firstName lastName profilePicture role');
    await message.populate('recipient', 'firstName lastName profilePicture role');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Admin send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending admin message'
    });
  }
};