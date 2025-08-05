const express = require('express');
const router = express.Router();
const { getProfile, saveProfile,getLeaderboard,checkNameExistance, saveName, getName,login } = require('../controllers/profileController');
const verifyUser = require('../routes/middleware/verifyUser');
router.get('/', getProfile);
router.post('/', saveProfile);

router.get('/leaderboard',getLeaderboard);
router.get('/name', verifyUser, getName)

router.post('/login',login);
router.post('/user/name', checkNameExistance);
router.post('/user/account/saveName', saveName);

module.exports = router;