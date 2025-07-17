const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    validate: {
      validator: function (value) {
        // Block phone numbers (Indian-style 10 digits) and links/social handles
        const hasPhone = /\b\d{10}\b/.test(value);
        const hasLinkOrSocial = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|\b(?:facebook|instagram|linkedin|t\.me|telegram|wa\.me|twitter|youtube|snapchat|discord|onlyfans|reddit)\b/i.test(value);

        return !hasPhone && !hasLinkOrSocial;
      },
      message: 'Messages cannot contain phone numbers, links, or social media handles.'
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text'
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String
  }],
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isFiltered: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save hook for deep validation (optional)
messageSchema.pre('save', function (next) {
  const content = this.content;

  const hasPhone = /\b\d{10}\b/.test(content);
  const hasLinkOrSocial = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|\b(?:facebook|instagram|linkedin|t\.me|telegram|wa\.me|twitter|youtube|snapchat|discord|onlyfans|reddit)\b/i.test(content);

  if (hasPhone || hasLinkOrSocial) {
    return next(new Error('Message content violates platform policy.'));
  }

  next();
});

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ participants: 1 });

module.exports = mongoose.model('Message', messageSchema);
