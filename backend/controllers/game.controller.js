const gameService = require('../services/game.service');
const catchAsync = require('../utils/catchAsync');

exports.getStatus = catchAsync(async (req, res) => {
  const status = await gameService.getStatus(req.user.id);
  res.status(200).json({ success: true, data: status });
});

exports.play = catchAsync(async (req, res) => {
  const result = await gameService.play(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.claim = catchAsync(async (req, res) => {
  const reward = await gameService.claimReward(req.user.id);
  res.status(200).json({ success: true, data: reward });
});

