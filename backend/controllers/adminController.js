const User = require('../models/User');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Project = require('../models/Project');
const Category = require('../models/Category');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('rating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's services if freelancer
    let services = [];
    if (user.role === 'freelancer') {
      services = await Service.find({ freelancer: user._id });
    }

    // Get user's orders
    const orders = await Order.find({
      $or: [
        { client: user._id },
        { freelancer: user._id }
      ]
    }).limit(10).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        services,
        orders,
        stats: {
          totalOrders: orders.length,
          totalServices: services.length
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

// Get platform statistics with enhanced data
exports.getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFreelancers,
      totalClients,
      totalServices,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalCategories,
      totalRevenue,
      monthlyRevenue,
      freelancerEarnings,
      platformFees
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' }),
      Service.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'cancelled' }),
      Category.countDocuments(),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // Monthly revenue for last 6 months
      Order.aggregate([
        { 
          $match: { 
            status: 'completed',
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Total freelancer earnings
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$freelancerEarnings' } } }
      ]),
      // Platform fees (totalAmount - freelancerEarnings)
      Order.aggregate([
        { $match: { status: 'completed' } },
        { 
          $group: { 
            _id: null, 
            total: { $sum: { $subtract: ['$totalAmount', '$freelancerEarnings'] } } 
          } 
        }
      ])
    ]);

    // Get recent activities
    const recentOrders = await Order.find()
      .populate('client', 'firstName lastName')
      .populate('freelancer', 'firstName lastName')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsers = await User.find()
      .select('firstName lastName role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get top freelancers by earnings
    const topFreelancers = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$freelancer',
          totalEarnings: { $sum: '$freelancerEarnings' },
          completedOrders: { $sum: 1 }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'freelancer'
        }
      },
      { $unwind: '$freelancer' }
    ]);

    // Format monthly revenue data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyRevenue = monthlyRevenue.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalFreelancers,
          totalClients,
          totalServices,
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalCategories,
          totalRevenue: totalRevenue[0]?.total || 0,
          freelancerEarnings: freelancerEarnings[0]?.total || 0,
          platformFees: platformFees[0]?.total || 0
        },
        monthlyRevenue: formattedMonthlyRevenue,
        topFreelancers,
        recentOrders,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform statistics'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active orders
    const activeOrders = await Order.countDocuments({
      $or: [
        { client: user._id },
        { freelancer: user._id }
      ],
      status: { $in: ['pending', 'accepted', 'in_progress', 'delivered'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active orders'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};