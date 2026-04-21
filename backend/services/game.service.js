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

const SPIN_OUTCOMES = [
  { label: '10% OFF', discount: 10, probability: 0.3 },
  { label: '15% OFF', discount: 15, probability: 0.2 },
  { label: '20% OFF', discount: 20, probability: 0.1 },
  { label: 'NO_REWARD', discount: 0, probability: 0.4 },
];

function pickSpinOutcome() {
  const roll = Math.random();
  let cumulative = 0;
  for (const item of SPIN_OUTCOMES) {
    cumulative += item.probability;
    if (roll <= cumulative) {
      if (item.label === 'NO_REWARD') {
        const text = Math.random() < 0.5 ? 'Better Luck Next Time' : 'No Reward';
        return { label: text, discount: 0, rewardGiven: false };
      }
      return { label: item.label, discount: item.discount, rewardGiven: true };
    }
  }
  return { label: 'No Reward', discount: 0, rewardGiven: false };
}

function extractDiscountFromResult(resultText) {
  const match = String(resultText || '').match(/(\d+)\s*%/);
  if (!match) return 0;
  const value = Number(match[1]);
  return [10, 15, 20].includes(value) ? value : 0;
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
        lastResult: outcome.label,
        rewardGiven: outcome.rewardGiven,
        rewardClaimed: !outcome.rewardGiven,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return {
    result: progress.lastResult,
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
  if (!progress.rewardGiven) throw new AppError('No reward earned this round', 400);
  if (progress.rewardClaimed) throw new AppError('Reward already claimed', 400);

  const discount = extractDiscountFromResult(progress.lastResult);
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

