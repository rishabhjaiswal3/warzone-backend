const express = require('express');
const router = express.Router();
const { getProfile, saveProfile,getLeaderboard } = require('../controllers/profileController');

router.get('/', getProfile);
router.post('/', saveProfile);
router.get('/leaderboard',getLeaderboard);

module.exports = router;