const mongoose = require('mongoose');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Project = require('../models/Project');
const User = require('../models/User');

// Get client dashboard statistics
exports.getClientStats = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    // Get total spent (sum of all completed order amounts)
    const totalSpentResult = await Order.aggregate([
      {
        $match: {
          client: mongoose.Types.ObjectId(clientId),
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get order counts by status
    const orderStats = await Order.aggregate([
      {
        $match: { client: mongoose.Types.ObjectId(clientId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get active projects count
    const activeProjects = await Project.countDocuments({
      client: clientId,
      status: { $in: ['open', 'in_progress'] }
    });

    // Process order stats
    const activeOrderStatuses = ['pending', 'accepted', 'in_progress', 'delivered'];
    const completedOrderStatuses = ['completed'];
    
    let activeOrders = 0;
    let completedOrders = 0;
    
    orderStats.forEach(stat => {
      if (activeOrderStatuses.includes(stat._id)) {
        activeOrders += stat.count;
      }
      if (completedOrderStatuses.includes(stat._id)) {
        completedOrders += stat.count;
      }
    });

    const totalSpent = totalSpentResult[0]?.totalSpent || 0;

    res.status(200).json({
      success: true,
      data: {
        totalSpent,
        activeOrders,
        completedOrders,
        activeProjects
      }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client statistics'
    });
  }
};

// Get freelancer dashboard statistics
exports.getFreelancerStats = async (req, res) => {
  try {
    const freelancerId = req.user.id;
    
    // Get total earnings (sum of freelancer earnings from completed orders)
    const totalEarningsResult = await Order.aggregate([
      {
        $match: {
          freelancer: mongoose.Types.ObjectId(freelancerId),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$freelancerEarnings' }
        }
      }
    ]);

    // Get order counts
    const activeOrders = await Order.countDocuments({
      freelancer: freelancerId,
      status: { $in: ['accepted', 'in_progress', 'delivered'] }
    });

    const completedOrders = await Order.countDocuments({
      freelancer: freelancerId,
      status: 'completed'
    });

    // Get services count
    const activeServices = await Service.countDocuments({
      freelancer: freelancerId,
      status: 'active'
    });

    const totalEarnings = totalEarningsResult[0]?.totalEarnings || 0;

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        activeOrders,
        completedOrders,
        activeServices
      }
    });
  } catch (error) {
    console.error('Get freelancer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching freelancer statistics'
    });
  }
};