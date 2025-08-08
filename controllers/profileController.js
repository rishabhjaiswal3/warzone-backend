const jwt = require('jsonwebtoken');
const PlayerProfile = require('../models/PlayerProfile');
const WarzoneNameWallet = require('../models/nameWallet');
const NameCounter = require('../models/nameCounter');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateDefaultName = async () => {
  const counter = await NameCounter.findByIdAndUpdate(
    'default',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `JohnDigger${counter.seq}`;
};

const defaultData = {
  PlayerProfile: { level: 1, exp: 0 },
  PlayerResources: { coin: 1000, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 },
  PlayerRambos: { "0": { id: 0, level: 1 } },
  PlayerRamboSkills: { "0": Object.fromEntries(Array.from({length: 18}, (_, i) => [i.toString(), 0])) },
  PlayerGuns: { "0": { id: 0, level: 1, ammo: 0, isNew: false } },
  PlayerGrenades: { "500": { id: 500, level: 1, quantity: 10, isNew: false } },
  PlayerMeleeWeapons: { "600": { id: 600, level: 1, isNew: false } },
  PlayerCampaignProgress: {},
  PlayerCampaignRewardProgress: {},
  PlayerBoosters: { Hp: 0, Grenade: 0, Damage: 0, CoinMagnet: 0, Speed: 0, Critical: 0 },
  PlayerSelectingBooster: [],
  PlayerDailyQuestData: [],
  PlayerAchievementData: {},
  PlayerTutorialData: {}
};

const getWalletProfile = async (walletAddress) => {
  try {
    let profile = await PlayerProfile.findOne({ walletAddress });
    if (!profile) {
      profile = new PlayerProfile({ 
        walletAddress, 
        // Make sure defaultData is defined in the scope
        ...(defaultData || {}) 
      });
      await profile.save();
    }
    return profile;
  } catch(error) {
    console.error('Error in getProfile:', error);
    throw error; // Consider re-throwing to handle it in the route
  }
}

exports.saveProfile = async (req, res) => {

  try {

    const { data:shouldUpdate, walletAddress, ...data } = req.body;
   
    if(shouldUpdate){
      const profile = await getWalletProfile(walletAddress);
      return res.json(profile);
    }

    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

    let profile = await PlayerProfile.findOne({ walletAddress });
    if (!profile) profile = new PlayerProfile({ walletAddress });

    Object.assign(profile, data);
    await profile.save();

    return res.json(await getWalletProfile(walletAddress));
  }
  catch(error) {
    console.error('Error in saveProfile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const walletAddress = req.query.walletAddress;
   
    const profile = await getWalletProfile(walletAddress);
    return res.json(profile);
  }
  catch(error){
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 


exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await PlayerProfile.find()
      .sort({ 'PlayerProfile.exp': -1 })
      .limit(100)
      .lean(); 

    const walletAddresses = leaderboard.map(profile => profile.walletAddress);
    
    const nameRecords = await WarzoneNameWallet.find({
      walletAddress: { $in: walletAddresses }
    });

    const nameMap = {};
    nameRecords.forEach(record => {
      nameMap[record.walletAddress] = record.name;
    });

    const leaderboardWithNames = leaderboard.map(profile => ({
      ...profile,
      name: nameMap[profile.walletAddress] || `JohnDigger${Math.floor(Math.random() * 1000)}`
    }));

    res.json(leaderboardWithNames);
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
  }
};

exports.checkNameExistance = async (req, res) => {

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  let profile = await WarzoneNameWallet.findOne({ name });
  if (profile) {
    return res.json({ success: false, message: 'Name already exists' });
  }
  return res.json({ success: true, message: 'Name is available' });

}

exports.saveName = async (req, res) => {
  try {
    const { name, walletAddress } = req.body;
    
    if (!walletAddress || !name) {
      return res.status(400).json({ 
        success: false,
        error: 'Wallet address and name are required' 
      });
    }

    // Check if name already exists for another wallet
    const existingName = await WarzoneNameWallet.findOne({ name });
    if (existingName && existingName.walletAddress !== walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Name is already taken'
      });
    }

    // Find and update or create new
    const profile = await WarzoneNameWallet.findOneAndUpdate(
      { walletAddress },
      { name, isDefaultName: false },
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true 
      }
    );

    res.json({ 
      success: true, 
      message: 'Name saved successfully',
      data: profile
    });

  } catch (error) {
    console.error('Error saving name:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getName = async (req, res) => {
  try {
    const walletAddress = req.walletAddress;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });
    
    let nameRecord = await WarzoneNameWallet.findOne({ walletAddress });
    
    if (!nameRecord) {
      // Generate a default name if none exists
      const defaultName = await generateDefaultName();
      nameRecord = new WarzoneNameWallet({
        walletAddress,
        name: defaultName,
        isDefaultName: true
      });
      await nameRecord.save();
    }
    
    res.json({ 
      success: true, 
      name: nameRecord.name,
      isDefault: nameRecord.isDefaultName || false
    });
  } catch (error) {
    console.error('Error in getName:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet address is required' 
      });
    }

    // Find or create user profile
    let profile = await PlayerProfile.findOne({ walletAddress });
    const isNewUser = !profile;
    
    if (isNewUser) {
      profile = new PlayerProfile({ walletAddress, ...defaultData });
      await profile.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { walletAddress },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: process.env.NODE_ENV === 'production' ? '.warzonewarriors.xyz' : 'localhost'
    });

    // Send response
    res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser ? 'User registered successfully' : 'Login successful',
      token,
      user: {
        walletAddress: profile.walletAddress,
        isNewUser
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};
