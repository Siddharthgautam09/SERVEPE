const Order = require('../models/Order');
const Service = require('../models/Service');
const Message = require('../models/Message');
const { upload, handleMulterError } = require('../middleware/upload');
const mongoose = require('mongoose');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { 
      serviceId, 
      selectedPlan, 
      requirements, 
      addOns = [] 
    } = req.body;

    const service = await Service.findById(serviceId).populate('freelancer');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Calculate pricing
    const planPrice = service.pricingPlans[selectedPlan].price;
    const addOnsTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0);
    const totalAmount = planPrice + addOnsTotal;
    const platformFee = totalAmount * 0.1; // 10% platform fee
    const freelancerEarnings = totalAmount - platformFee;

    // Calculate delivery date
    const deliveryDays = service.pricingPlans[selectedPlan].deliveryTime + 
      addOns.reduce((sum, addOn) => sum + (addOn.deliveryTime || 0), 0);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    // Generate order number manually to ensure it's set
    const count = await Order.countDocuments();
    const orderNumber = `ORD${Date.now()}${count.toString().padStart(4, '0')}`;

    // Generate conversation ID
    const conversationId = [req.user.id, service.freelancer._id].sort().join('_');

    const order = await Order.create({
      orderNumber,
      conversationId,
      client: req.user.id,
      freelancer: service.freelancer._id,
      service: serviceId,
      selectedPlan,
      requirements,
      addOns,
      totalAmount,
      platformFee,
      freelancerEarnings,
      deliveryDate,
      status: 'pending'
    });

    // Update service orders count
    await Service.findByIdAndUpdate(serviceId, { $inc: { orders: 1 } });

    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'firstName lastName email profilePicture')
      .populate('freelancer', 'firstName lastName email profilePicture')
      .populate('service', 'title description images');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${service.freelancer._id}`).emit('newOrder', {
        orderId: order._id,
        client: populatedOrder.client,
        service: populatedOrder.service
      });
    }

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get user's orders with enhanced filtering and real-time data
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { client: req.user.id },
        { freelancer: req.user.id }
      ]
    };

    if (status && status !== 'all') filter.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('client', 'firstName lastName email profilePicture')
      .populate('freelancer', 'firstName lastName email profilePicture')
      .populate('service', 'title images description pricingPlans')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    // Add calculated fields with real-time data
    const ordersWithCalculations = orders.map(order => {
      const orderObj = order.toObject({ virtuals: true });
      const now = new Date();
      const daysRemaining = Math.ceil((order.deliveryDate - now) / (1000 * 60 * 60 * 24));
      
      orderObj.daysRemaining = daysRemaining;
      orderObj.isOverdue = daysRemaining < 0 && !['completed', 'cancelled'].includes(order.status);
      
      // Calculate progress based on status and deliverables
      let progress = 0;
      switch (order.status) {
        case 'pending':
          progress = 5;
          break;
        case 'accepted':
        case 'in_progress':
          progress = order.deliverables.length > 0 ? 75 : 25;
          break;
        case 'delivered':
          progress = 90;
          break;
        case 'completed':
          progress = 100;
          break;
        case 'cancelled':
          progress = 0;
          break;
        default:
          progress = 0;
      }
      
      orderObj.progress = progress;
      orderObj.userRole = order.client._id.toString() === req.user.id ? 'client' : 'freelancer';
      
      return orderObj;
    });

    res.status(200).json({
      success: true,
      data: ordersWithCalculations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

// Get single order with complete details
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'firstName lastName email profilePicture location')
      .populate('freelancer', 'firstName lastName email profilePicture location skills')
      .populate('service', 'title description images pricingPlans category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access permissions
    if (
      order.client._id.toString() !== req.user.id &&
      order.freelancer._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add calculated fields
    const orderObj = order.toObject({ virtuals: true });
    const now = new Date();
    orderObj.daysRemaining = Math.ceil((order.deliveryDate - now) / (1000 * 60 * 60 * 24));
    orderObj.isOverdue = orderObj.daysRemaining < 0 && !['completed', 'cancelled'].includes(order.status);
    orderObj.userRole = order.client._id.toString() === req.user.id ? 'client' : 'freelancer';

    res.status(200).json({
      success: true,
      data: orderObj
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
};

// Update order status with real-time notifications and chat creation
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('client freelancer service');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permissions
    const isClient = order.client._id.toString() === req.user.id;
    const isFreelancer = order.freelancer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['delivered', 'cancelled'],
      'delivered': ['completed', 'revision_requested'],
      'revision_requested': ['in_progress', 'delivered'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    const oldStatus = order.status;
    order.status = status;
    
    if (status === 'completed') {
      order.actualDeliveryDate = new Date();
    }

    // Add to status history
    order.statusHistory.push({
      status,
      updatedBy: req.user.id,
      note
    });

    await order.save();

    // Create initial chat message when order is accepted
    if (oldStatus === 'pending' && status === 'accepted') {
      try {
        const conversationId = `order_${order._id}`;
        
        await Message.create({
          conversationId,
          participants: [order.client._id, order.freelancer._id],
          sender: order.freelancer._id,
          recipient: order.client._id,
          messageType: 'system',
          content: `Order #${order.orderNumber} has been accepted! You can now discuss project details here.`,
          order: order._id
        });

        console.log(`Created initial chat message for order ${order._id}`);
      } catch (chatError) {
        console.error('Error creating initial chat message:', chatError);
      }
    }

    // Send real-time notification
    const io = req.app.get('io');
    if (io) {
      const recipientId = isClient ? order.freelancer._id : order.client._id;
      io.to(`user_${recipientId}`).emit('orderStatusUpdate', {
        orderId: order._id,
        status,
        note,
        updatedBy: req.user.firstName + ' ' + req.user.lastName
      });

      // If order was accepted, notify about new chat
      if (oldStatus === 'pending' && status === 'accepted') {
        io.to(`user_${order.client._id}`).emit('newOrderChat', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          freelancerName: order.freelancer.firstName + ' ' + order.freelancer.lastName
        });
      }
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
};

// Submit deliverables with file upload support
exports.submitDeliverables = [
  upload.array('orderDeliverables', 10),
  handleMulterError,
  async (req, res) => {
    try {
      const { message } = req.body;
      const order = await Order.findById(req.params.id)
        .populate('client freelancer');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.freelancer._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Only the freelancer can submit deliverables'
        });
      }

      // Process uploaded files
      const deliverableFiles = req.files ? req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        fileType: file.mimetype
      })) : [];

      // Add deliverable entry
      const deliverable = {
        files: deliverableFiles,
        message: message || 'Order deliverables submitted',
        submittedAt: new Date()
      };

      order.deliverables.push(deliverable);
      order.status = 'delivered';
      order.statusHistory.push({
        status: 'delivered',
        updatedBy: req.user.id,
        note: 'Deliverables submitted'
      });

      await order.save();

      // Send real-time notification to client
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${order.client._id}`).emit('deliverablesReceived', {
          orderId: order._id,
          freelancer: order.freelancer.firstName + ' ' + order.freelancer.lastName,
          filesCount: deliverableFiles.length
        });
      }

      res.status(200).json({
        success: true,
        data: order,
        message: 'Deliverables submitted successfully'
      });
    } catch (error) {
      console.error('Submit deliverables error:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting deliverables'
      });
    }
  }
];

// Request revision
exports.requestRevision = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('client freelancer');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.client._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the client can request revisions'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only request revision for delivered orders'
      });
    }

    order.revisions.push({
      reason,
      requestedAt: new Date()
    });

    order.status = 'revision_requested';
    order.statusHistory.push({
      status: 'revision_requested',
      updatedBy: req.user.id,
      note: reason
    });

    await order.save();

    // Send notification to freelancer
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.freelancer._id}`).emit('revisionRequested', {
        orderId: order._id,
        reason,
        client: order.client.firstName + ' ' + order.client.lastName
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Revision requested successfully'
    });
  } catch (error) {
    console.error('Request revision error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting revision'
    });
  }
};

// Get order analytics for freelancers
exports.getOrderAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can access order analytics'
      });
    }

    const freelancerId = req.user.id;
    const { timeRange = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get order statistics
    const totalOrders = await Order.countDocuments({ freelancer: freelancerId });
    const completedOrders = await Order.countDocuments({ 
      freelancer: freelancerId, 
      status: 'completed' 
    });
    
    const recentOrders = await Order.find({
      freelancer: freelancerId,
      createdAt: { $gte: startDate }
    });

    const totalEarnings = await Order.aggregate([
      {
        $match: {
          freelancer: mongoose.Types.ObjectId(freelancerId),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$freelancerEarnings' }
        }
      }
    ]);

    const avgDeliveryTime = await Order.aggregate([
      {
        $match: {
          freelancer: mongoose.Types.ObjectId(freelancerId),
          status: 'completed',
          actualDeliveryDate: { $exists: true }
        }
      },
      {
        $addFields: {
          deliveryDays: {
            $divide: [
              { $subtract: ['$actualDeliveryDate', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$deliveryDays' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0,
        totalEarnings: totalEarnings[0]?.total || 0,
        avgDeliveryTime: avgDeliveryTime[0]?.avgDays || 0,
        recentOrdersCount: recentOrders.length
      }
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order analytics'
    });
  }
};

// Get all orders for admin
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'client.firstName': { $regex: search, $options: 'i' } },
        { 'client.lastName': { $regex: search, $options: 'i' } },
        { 'freelancer.firstName': { $regex: search, $options: 'i' } },
        { 'freelancer.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('client', 'firstName lastName email profilePicture')
      .populate('freelancer', 'firstName lastName email profilePicture')
      .populate('service', 'title description images category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    // Add calculated fields
    const ordersWithDetails = orders.map(order => {
      const orderObj = order.toObject({ virtuals: true });
      const now = new Date();
      const daysRemaining = Math.ceil((order.deliveryDate - now) / (1000 * 60 * 60 * 24));
      
      orderObj.daysRemaining = daysRemaining;
      orderObj.isOverdue = daysRemaining < 0 && !['completed', 'cancelled'].includes(order.status);
      
      return orderObj;
    });

    res.status(200).json({
      success: true,
      data: ordersWithDetails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders for admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders for admin'
    });
  }
};