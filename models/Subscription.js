const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['free', 'basic', 'premium', 'vip']
  },
  displayName: {
    type: String,
    required: true
  },
  price: {
    monthly: {
      type: Number,
      required: true
    },
    yearly: {
      type: Number,
      required: true
    }
  },
  features: [{
    name: String,
    included: Boolean
  }],
  limits: {
    maxQuality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4k']
    },
    downloadLimit: Number,
    simultaneousStreams: Number,
    adsEnabled: Boolean
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const subscriptionHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'vip'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'VND'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'momo', 'zalopay', 'bank_transfer'],
    required: true
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled', 'pending'],
    default: 'pending'
  },
  autoRenew: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
const SubscriptionHistory = mongoose.model('SubscriptionHistory', subscriptionHistorySchema);

module.exports = { SubscriptionPlan, SubscriptionHistory };
