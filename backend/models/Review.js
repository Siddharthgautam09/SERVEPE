
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  freelancerResponse: {
    type: String,
    maxlength: [500, 'Response cannot exceed 500 characters']
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: { type: Date, default: Date.now }
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
ReviewSchema.index({ service: 1, createdAt: -1 });
ReviewSchema.index({ freelancer: 1, rating: -1 });
ReviewSchema.index({ client: 1 });
ReviewSchema.index({ order: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
