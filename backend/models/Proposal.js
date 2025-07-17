
const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  proposedBudget: {
    amount: {
      type: Number,
      required: [true, 'Proposed budget is required'],
      min: [1, 'Budget must be at least $1']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  estimatedDuration: {
    type: String,
    required: [true, 'Estimated duration is required']
  },
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  clientMessage: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date
}, {
  timestamps: true
});

// Indexes
proposalSchema.index({ project: 1 });
proposalSchema.index({ freelancer: 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Proposal', proposalSchema);
