const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    lastPlayedAt: {
      type: Date,
      default: null,
    },
    lastResult: {
      type: String,
      enum: ['10', '15', '20', 'NO_REWARD'], // ✅ FIXED
      default: null,
    },
    rewardGiven: {
      type: Boolean,
      default: false,
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GameProgress', gameProgressSchema);