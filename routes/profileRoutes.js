const express = require('express');
const router = express.Router();
const { getProfile, saveProfile,getLeaderboard,checkNameExistance, getDailyQuests, getDailyQuestByType, saveName, getName,login } = require('../controllers/profileController');
const verifyUser = require('../routes/middleware/verifyUser');
router.get('/', getProfile);
router.post('/', saveProfile);
router.get('/dailyQuests', getDailyQuests);
router.get('/dailyQuests/type/:type', getDailyQuestByType);
router.get('/leaderboard',getLeaderboard);
router.post('/name', checkNameExistance);
router.post('/saveName',verifyUser, saveName);
router.get('/name', verifyUser, getName)
router.post('/login',login);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
