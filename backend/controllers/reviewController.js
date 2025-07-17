
const Review = require('../models/Review');
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, comment, isPublic = true } = req.body;

    // Get order details
    const order = await Order.findById(orderId)
      .populate('client freelancer service');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed orders'
      });
    }

    // Check if user is part of this order
    const isClient = order.client._id.toString() === req.user.id;
    const isFreelancer = order.freelancer._id.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this order'
      });
    }

    // Create review
    const review = await Review.create({
      order: orderId,
      client: order.client._id,
      freelancer: order.freelancer._id,
      service: order.service._id,
      rating,
      comment,
      isPublic,
      isVerified: true // Auto-verify since it's from actual order
    });

    // Update order with rating
    if (isClient) {
      order.rating.clientRating = {
        score: rating,
        comment,
        ratedAt: new Date()
      };
    } else {
      order.rating.freelancerRating = {
        score: rating,
        comment,
        ratedAt: new Date()
      };
    }

    await order.save();

    // Update service average rating
    await updateServiceRating(order.service._id);

    // Update freelancer average rating
    await updateFreelancerRating(order.freelancer._id);

    const populatedReview = await Review.findById(review._id)
      .populate('client', 'firstName lastName profilePicture')
      .populate('freelancer', 'firstName lastName profilePicture')
      .populate('service', 'title');

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review'
    });
  }
};

// Get review for specific order
exports.getOrderReview = async (req, res) => {
  try {
    const review = await Review.findOne({ order: req.params.orderId })
      .populate('client', 'firstName lastName profilePicture')
      .populate('freelancer', 'firstName lastName profilePicture')
      .populate('service', 'title');

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get order review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review'
    });
  }
};

// Get reviews for a service
exports.getServiceReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find({ 
      service: req.params.serviceId,
      isPublic: true 
    })
      .populate('client', 'firstName lastName profilePicture')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ 
      service: req.params.serviceId,
      isPublic: true 
    });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get service reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service reviews'
    });
  }
};

// Get reviews for a freelancer
exports.getFreelancerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find({ 
      freelancer: req.params.freelancerId,
      isPublic: true 
    })
      .populate('client', 'firstName lastName profilePicture')
      .populate('service', 'title')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ 
      freelancer: req.params.freelancerId,
      isPublic: true 
    });

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      {
        $match: { 
          freelancer: require('mongoose').Types.ObjectId(req.params.freelancerId),
          isPublic: true 
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const stats = ratingStats[0] || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: []
    };

    res.status(200).json({
      success: true,
      data: reviews,
      stats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get freelancer reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching freelancer reviews'
    });
  }
};

// Respond to a review (freelancer response)
exports.respondToReview = async (req, res) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only freelancer can respond
    if (review.freelancer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the freelancer can respond to this review'
      });
    }

    review.freelancerResponse = response;
    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('client', 'firstName lastName profilePicture')
      .populate('freelancer', 'firstName lastName profilePicture')
      .populate('service', 'title');

    res.status(200).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to review'
    });
  }
};

// Get review analytics
exports.getReviewAnalytics = async (req, res) => {
  try {
    const freelancerId = req.user.id;

    const analytics = await Review.aggregate([
      {
        $match: { freelancer: require('mongoose').Types.ObjectId(freelancerId) }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    const result = analytics[0] || {
      totalReviews: 0,
      averageRating: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get review analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review analytics'
    });
  }
};

// Helper function to update service average rating
const updateServiceRating = async (serviceId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { service: serviceId, isPublic: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Service.findByIdAndUpdate(serviceId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating service rating:', error);
  }
};

// Helper function to update freelancer average rating
const updateFreelancerRating = async (freelancerId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { freelancer: freelancerId, isPublic: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(freelancerId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating freelancer rating:', error);
  }
};
