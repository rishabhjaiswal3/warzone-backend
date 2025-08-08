const express = require('express');
const router = express.Router();
const { getProfile, saveProfile,getLeaderboard,checkNameExistance, saveName, getName,login } = require('../controllers/profileController');
const verifyUser = require('../routes/middleware/verifyUser');
router.post('/', getProfile);
router.post('/', saveProfile);
router.get('/leaderboard',getLeaderboard);
router.post('/name', checkNameExistance);
router.post('/saveName',verifyUser, saveName);
router.get('/name', verifyUser, getName)
router.post('/login',login);

module.exports = router;