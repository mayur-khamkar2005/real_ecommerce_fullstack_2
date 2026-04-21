const express = require('express');
const gameController = require('../controllers/game.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);
router.get('/status', gameController.getStatus);
router.post('/play', gameController.play);
router.post('/claim', gameController.claim);

module.exports = router;

