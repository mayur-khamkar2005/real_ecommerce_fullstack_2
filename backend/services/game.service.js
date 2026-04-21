const GameProgress = require('../models/gameProgress.model');
const couponService = require('./coupon.service');
const AppError = require('../utils/AppError');

const GAME_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function getNow() {
  return new Date();
}

function hoursLeft(nextPlayableAt) {
  return Math.max(0, nextPlayableAt.getTime() - Date.now());
}

// ✅ CLEAN STRUCTURE
const SPIN_OUTCOMES = [
  { value: "10", label: '10% OFF', discount: 10, probability: 0.3 },
  { value: "15", label: '15% OFF', discount: 15, probability: 0.2 },
  { value: "20", label: '20% OFF', discount: 20, probability: 0.1 },
  { value: "NO_REWARD", label: 'Better Luck', discount: 0, probability: 0.4 },
];

// ✅ FIXED: value bhi return karega
function pickSpinOutcome() {
  const roll = Math.random();
  let cumulative = 0;

  for (const item of SPIN_OUTCOMES) {
    cumulative += item.probability;

    if (roll <= cumulative) {
      if (item.value === 'NO_REWARD') {
        return {
          value: "NO_REWARD",
          label: "Better Luck",
          discount: 0,
          rewardGiven: false,
        };
      }

      return {
        value: item.value,
        label: item.label,
        discount: item.discount,
        rewardGiven: true,
      };
    }
  }

  return {
    value: "NO_REWARD",
    label: "Better Luck",
    discount: 0,
    rewardGiven: false,
  };
}

exports.getStatus = async (userId) => {
  const progress = await GameProgress.findOne({ userId });

  if (!progress || !progress.lastPlayedAt) {
    return {
      canSpin: true,
      nextSpinIn: 0,
      nextPlayableAt: null,
      lastResult: null,
      rewardGiven: false,
      rewardClaimed: false,
    };
  }

  const nextPlayableAt = new Date(progress.lastPlayedAt.getTime() + GAME_COOLDOWN_MS);
  const msRemaining = hoursLeft(nextPlayableAt);

  return {
    canSpin: msRemaining === 0,
    nextSpinIn: msRemaining,
    nextPlayableAt,
    lastResult: progress.lastResult,
    rewardGiven: progress.rewardGiven,
    rewardClaimed: progress.rewardClaimed,
  };
};

exports.play = async (userId) => {
  const status = await exports.getStatus(userId);

  if (!status.canSpin) {
    throw new AppError('You can spin only once every 24 hours', 429);
  }

  const outcome = pickSpinOutcome();

  const progress = await GameProgress.findOneAndUpdate(
    { userId },
    {
      $set: {
        lastPlayedAt: getNow(),
        lastResult: outcome.value, // ✅ MAIN FIX
        rewardGiven: outcome.rewardGiven,
        rewardClaimed: !outcome.rewardGiven,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return {
    result: progress.lastResult, // returns "10", "15", etc.
    rewardGiven: progress.rewardGiven,
    canClaim: progress.rewardGiven && !progress.rewardClaimed,
    nextPlayableAt: new Date(progress.lastPlayedAt.getTime() + GAME_COOLDOWN_MS),
    nextSpinIn: GAME_COOLDOWN_MS,
  };
};

exports.claimReward = async (userId) => {
  const progress = await GameProgress.findOne({ userId });

  if (!progress || !progress.lastPlayedAt) {
    throw new AppError('Spin the wheel first', 400);
  }

  if (!progress.rewardGiven) {
    throw new AppError('No reward earned this round', 400);
  }

  if (progress.rewardClaimed) {
    throw new AppError('Reward already claimed', 400);
  }

  // ✅ SIMPLE & CLEAN (no regex)
  const discount = Number(progress.lastResult);

  if (![10, 15, 20].includes(discount)) {
    throw new AppError('Invalid reward result for claim', 400);
  }

  const coupon = await couponService.createCouponForUser(userId, discount);

  progress.rewardClaimed = true;
  await progress.save();

  return {
    code: coupon.code,
    discount: coupon.discount,
    couponId: coupon._id,
  };
};