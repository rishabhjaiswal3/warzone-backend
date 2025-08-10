// const jwt = require('jsonwebtoken');
// const PlayerProfile = require('../models/PlayerProfile');
// const WarzoneNameWallet = require('../models/nameWallet');
// const NameCounter = require('../models/nameCounter');

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// const generateDefaultName = async () => {
//   const counter = await NameCounter.findByIdAndUpdate(
//     'default',
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );
//   return `JohnDigger${counter.seq}`;
// };

// const defaultData = {
//   PlayerProfile: { level: 1, exp: 0 },
//   PlayerResources: { coin: 1000, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 },
//   PlayerRambos: { "0": { id: 0, level: 1 } },
//   PlayerRamboSkills: { "0": Object.fromEntries(Array.from({length: 18}, (_, i) => [i.toString(), 0])) },
//   PlayerGuns: { "0": { id: 0, level: 1, ammo: 0, isNew: false } },
//   PlayerGrenades: { "500": { id: 500, level: 1, quantity: 10, isNew: false } },
//   PlayerMeleeWeapons: { "600": { id: 600, level: 1, isNew: false } },
//   PlayerCampaignProgress: {},
//   PlayerCampaignRewardProgress: {},
//   PlayerBoosters: { Hp: 0, Grenade: 0, Damage: 0, CoinMagnet: 0, Speed: 0, Critical: 0 },
//   PlayerSelectingBooster: [],
//   PlayerDailyQuestData: [],
//   PlayerAchievementData: {},
//   PlayerTutorialData: {}
// };

// const getWalletProfile = async (walletAddress) => {
//   try {
//     let profile = await PlayerProfile.findOne({ walletAddress });
//     if (!profile) {
//       profile = new PlayerProfile({ 
//         walletAddress, 
//         // Make sure defaultData is defined in the scope
//         ...(defaultData || {}) 
//       });
//       await profile.save();
//     }
//     return profile;
//   } catch(error) {
//     console.error('Error in getProfile:', error);
//     throw error; // Consider re-throwing to handle it in the route
//   }
// }

// exports.saveProfile = async (req, res) => {

//   try {

//     const { data:shouldUpdate, walletAddress, ...data } = req.body;
   
//     if(shouldUpdate){
//       const profile = await getWalletProfile(walletAddress);
//       return res.json(profile);
//     }

//     if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

//     let profile = await PlayerProfile.findOne({ walletAddress });
//     if (!profile) profile = new PlayerProfile({ walletAddress });

//     Object.assign(profile, data);
//     await profile.save();

//     return res.json(await getWalletProfile(walletAddress));
//   }
//   catch(error) {
//     console.error('Error in saveProfile:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };


// exports.getProfile = async (req, res) => {
//   try {
//     const walletAddress = req.query.walletAddress;
   
//     const profile = await getWalletProfile(walletAddress);
//     return res.json(profile);
//   }
//   catch(error){
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }; 


// exports.getLeaderboard = async (req, res) => {
//   try {
//     const leaderboard = await PlayerProfile.find()
//       .sort({ 'PlayerProfile.exp': -1 })
//       .limit(100)
//       .lean(); 

//     const walletAddresses = leaderboard.map(profile => profile.walletAddress);
    
//     const nameRecords = await WarzoneNameWallet.find({
//       walletAddress: { $in: walletAddresses }
//     });

//     const nameMap = {};
//     nameRecords.forEach(record => {
//       nameMap[record.walletAddress] = record.name;
//     });

//     const leaderboardWithNames = leaderboard.map(profile => ({
//       ...profile,
//       name: nameMap[profile.walletAddress] || `JohnDigger${Math.floor(Math.random() * 1000)}`
//     }));

//     res.json(leaderboardWithNames);
//   } catch (error) {
//     console.error('Error in getLeaderboard:', error);
//     res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
//   }
// };

// exports.checkNameExistance = async (req, res) => {

//   const { name } = req.body;
//   if (!name) return res.status(400).json({ error: 'name is required' });
//   let profile = await WarzoneNameWallet.findOne({ name });
//   if (profile) {
//     return res.json({ success: false, message: 'Name already exists' });
//   }
//   return res.json({ success: true, message: 'Name is available' });

// }

// exports.saveName = async (req, res) => {
//   try {
//     const { name, walletAddress } = req.body;
    
//     if (!walletAddress || !name) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Wallet address and name are required' 
//       });
//     }

//     // Check if name already exists for another wallet
//     const existingName = await WarzoneNameWallet.findOne({ name });
//     if (existingName && existingName.walletAddress !== walletAddress) {
//       return res.status(400).json({
//         success: false,
//         error: 'Name is already taken'
//       });
//     }

//     // Find and update or create new
//     const profile = await WarzoneNameWallet.findOneAndUpdate(
//       { walletAddress },
//       { name, isDefaultName: false },
//       { 
//         new: true,
//         upsert: true,
//         setDefaultsOnInsert: true 
//       }
//     );

//     res.json({ 
//       success: true, 
//       message: 'Name saved successfully',
//       data: profile
//     });

//   } catch (error) {
//     console.error('Error saving name:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Internal server error',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.getName = async (req, res) => {
//   try {
//     const walletAddress = req.walletAddress;
//     if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });
    
//     let nameRecord = await WarzoneNameWallet.findOne({ walletAddress });
    
//     if (!nameRecord) {
//       // Generate a default name if none exists
//       const defaultName = await generateDefaultName();
//       nameRecord = new WarzoneNameWallet({
//         walletAddress,
//         name: defaultName,
//         isDefaultName: true
//       });
//       await nameRecord.save();
//     }
    
//     res.json({ 
//       success: true, 
//       name: nameRecord.name,
//       isDefault: nameRecord.isDefaultName || false
//     });
//   } catch (error) {
//     console.error('Error in getName:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { walletAddress } = req.body;
//     if (!walletAddress) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Wallet address is required' 
//       });
//     }

//     // Find or create user profile
//     let profile = await PlayerProfile.findOne({ walletAddress });
//     const isNewUser = !profile;
    
//     if (isNewUser) {
//       profile = new PlayerProfile({ walletAddress, ...defaultData });
//       await profile.save();
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { walletAddress },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     // Set HTTP-only cookie
//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       domain: process.env.NODE_ENV === 'production' ? '.warzonewarriors.xyz' : 'localhost'
//     });

//     // Send response
//     res.status(isNewUser ? 201 : 200).json({
//       success: true,
//       message: isNewUser ? 'User registered successfully' : 'Login successful',
//       token,
//       user: {
//         walletAddress: profile.walletAddress,
//         isNewUser
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error during authentication' 
//     });
//   }
// };



//NEW 2

// const jwt = require('jsonwebtoken');
// const PlayerProfile = require('../models/PlayerProfile');
// const WarzoneNameWallet = require('../models/nameWallet');
// const NameCounter = require('../models/nameCounter');

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// const generateDefaultName = async () => {
//   const counter = await NameCounter.findByIdAndUpdate(
//     'default',
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );
//   return `JohnDigger${counter.seq}`;
// };

// const defaultData = {
//   PlayerProfile: { level: 1, exp: 0 },
//   PlayerResources: { coin: 1000, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 },
//   PlayerRambos: { "0": { id: 0, level: 1 } },
//   PlayerRamboSkills: { "0": Object.fromEntries(Array.from({length: 18}, (_, i) => [i.toString(), 0])) },
//   PlayerGuns: { "0": { id: 0, level: 1, ammo: 0, isNew: false } },
//   PlayerGrenades: { "500": { id: 500, level: 1, quantity: 10, isNew: false } },
//   PlayerMeleeWeapons: { "600": { id: 600, level: 1, isNew: false } },

//   // keep legacy present but empty to avoid Unity null issues
//   PlayerCampaignProgress: {},
//   PlayerCampaignRewardProgress: {},

//   // keep your booster shape (keys by name); if Unity expects 0..5, we can map server-side
//   PlayerBoosters: { Hp: 0, Grenade: 0, Damage: 0, CoinMagnet: 0, Speed: 0, Critical: 0 },
//   PlayerSelectingBooster: [],
//   PlayerDailyQuestData: [],
//   PlayerAchievementData: {},
//   PlayerTutorialData: {}
// };

// // fill missing/null fields with {} / [] / scalar defaults so API never returns nulls
// function normalizeProfile(obj) {
//   if (!obj) return obj;
//   const ensure = (key, defVal) => {
//     if (obj[key] === undefined || obj[key] === null) obj[key] = Array.isArray(defVal) ? [] : (typeof defVal === 'object' ? {} : defVal);
//   };

//   for (const [k, v] of Object.entries(defaultData)) ensure(k, v);

//   // extra hardening for the most fragile fields:
//   if (obj.PlayerCampaignProgress == null) obj.PlayerCampaignProgress = {};
//   if (obj.PlayerSelectingBooster == null) obj.PlayerSelectingBooster = [];
//   if (obj.PlayerDailyQuestData == null) obj.PlayerDailyQuestData = [];
//   if (obj.PlayerAchievementData == null) obj.PlayerAchievementData = {};
//   if (obj.PlayerTutorialData == null) obj.PlayerTutorialData = {};

//   return obj;
// }

// const getWalletProfile = async (walletAddress) => {
//   if (!walletAddress) throw new Error('walletAddress required');
//   try {
//     let profile = await PlayerProfile.findOne({ walletAddress });
//     if (!profile) {
//       profile = new PlayerProfile({ walletAddress, ...defaultData });
//       // ensure no nulls sneak in due to schema minimize, etc.
//       normalizeProfile(profile);
//       await profile.save();
//     } else {
//       normalizeProfile(profile);
//       await profile.save(); // persist normalization for old docs
//     }
//     return profile;
//   } catch (error) {
//     console.error('Error in getWalletProfile:', error);
//     throw error;
//   }
// };

// exports.saveProfile = async (req, res) => {
//   try {
//     const { data: shouldUpdate, walletAddress, ...data } = req.body;

//     if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

//     // if client sent data=true, just fetch-and-return (your existing short-circuit)
//     if (shouldUpdate) {
//       const profile = await getWalletProfile(walletAddress);
//       return res.json(profile);
//     }

//     let profile = await PlayerProfile.findOne({ walletAddress });
//     if (!profile) profile = new PlayerProfile({ walletAddress, ...defaultData });

//     // Shallow merge; prevent null overwrites for fragile objects
//     Object.assign(profile, data);
//     normalizeProfile(profile);

//     await profile.save();

//     const fresh = await getWalletProfile(walletAddress);
//     return res.json(fresh);
//   } catch (error) {
//     console.error('Error in saveProfile:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// exports.getProfile = async (req, res) => {
//   try {
//     const walletAddress = req.query.walletAddress;
//     if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

//     const profile = await getWalletProfile(walletAddress);
//     return res.json(profile);
//   } catch (error) {
//     console.error('Error in getProfile:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// exports.getLeaderboard = async (req, res) => {
//   try {
//     const leaderboard = await PlayerProfile.find()
//       .sort({ 'PlayerProfile.exp': -1 })
//       .limit(100)
//       .lean();

//     const walletAddresses = leaderboard.map(p => p.walletAddress);
//     const nameRecords = await WarzoneNameWallet.find({ walletAddress: { $in: walletAddresses } });
//     const nameMap = {};
//     nameRecords.forEach(r => { nameMap[r.walletAddress] = r.name; });

//     const leaderboardWithNames = leaderboard.map(profile => ({
//       ...normalizeProfile(profile), // make sure response has no nulls
//       name: nameMap[profile.walletAddress] || `JohnDigger${Math.floor(Math.random() * 1000)}`
//     }));

//     res.json(leaderboardWithNames);
//   } catch (error) {
//     console.error('Error in getLeaderboard:', error);
//     res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
//   }
// };

// exports.checkNameExistance = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ error: 'name is required' });
//     const profile = await WarzoneNameWallet.findOne({ name });
//     if (profile) return res.json({ success: false, message: 'Name already exists' });
//     return res.json({ success: true, message: 'Name is available' });
//   } catch (error) {
//     console.error('Error in checkNameExistance:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.saveName = async (req, res) => {
//   try {
//     const { name, walletAddress } = req.body;
//     if (!walletAddress || !name) {
//       return res.status(400).json({ success: false, error: 'Wallet address and name are required' });
//     }

//     const existingName = await WarzoneNameWallet.findOne({ name });
//     if (existingName && existingName.walletAddress !== walletAddress) {
//       return res.status(400).json({ success: false, error: 'Name is already taken' });
//     }

//     const profile = await WarzoneNameWallet.findOneAndUpdate(
//       { walletAddress },
//       { name, isDefaultName: false },
//       { new: true, upsert: true, setDefaultsOnInsert: true }
//     );

//     res.json({ success: true, message: 'Name saved successfully', data: profile });
//   } catch (error) {
//     console.error('Error saving name:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };

// exports.getName = async (req, res) => {
//   try {
//     const walletAddress = req.walletAddress;
//     if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

//     let nameRecord = await WarzoneNameWallet.findOne({ walletAddress });
//     if (!nameRecord) {
//       const defaultName = await generateDefaultName();
//       nameRecord = new WarzoneNameWallet({ walletAddress, name: defaultName, isDefaultName: true });
//       await nameRecord.save();
//     }

//     res.json({ success: true, name: nameRecord.name, isDefault: nameRecord.isDefaultName || false });
//   } catch (error) {
//     console.error('Error in getName:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { walletAddress } = req.body;
//     if (!walletAddress) {
//       return res.status(400).json({ success: false, message: 'Wallet address is required' });
//     }

//     let profile = await PlayerProfile.findOne({ walletAddress });
//     const isNewUser = !profile;

//     if (isNewUser) {
//       profile = new PlayerProfile({ walletAddress, ...defaultData });
//       normalizeProfile(profile);
//       await profile.save();
//     } else {
//       normalizeProfile(profile);
//       await profile.save();
//     }

//     const token = jwt.sign({ walletAddress }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       ...(process.env.NODE_ENV === 'production' ? { domain: '.warzonewarriors.xyz' } : {})
//     });

//     res.status(isNewUser ? 201 : 200).json({
//       success: true,
//       message: isNewUser ? 'User registered successfully' : 'Login successful',
//       token,
//       user: { walletAddress: profile.walletAddress, isNewUser }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ success: false, message: 'Server error during authentication' });
//   }
// };


//NEW 2.0

// controllers/warzoneController.js
// const jwt = require('jsonwebtoken');
// const PlayerProfile = require('../models/PlayerProfile');
// const WarzoneNameWallet = require('../models/nameWallet');
// const NameCounter = require('../models/nameCounter');

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// // ---------------- defaults & utils ----------------
// const defaultData = {
//   PlayerProfile: { level: 1, exp: 0 },
//   PlayerResources: { coin: 1000, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 },
//   PlayerRambos: { "0": { id: 0, level: 1 } },
//   PlayerRamboSkills: { "0": Object.fromEntries(Array.from({length: 18}, (_, i) => [i.toString(), 0])) },
//   PlayerGuns: { "0": { id: 0, level: 1, ammo: 0, isNew: false } },
//   PlayerGrenades: { "500": { id: 500, level: 1, quantity: 10, isNew: false } },
//   PlayerMeleeWeapons: { "600": { id: 600, level: 1, isNew: false } },

//   // keep legacy non-null to avoid Unity null issues
//   PlayerCampaignProgress: {},
//   PlayerCampaignRewardProgress: {},

//   // boosters default
//   PlayerBoosters: { Hp: 0, Grenade: 0, Damage: 0, CoinMagnet: 0, Speed: 0, Critical: 0 },
//   PlayerSelectingBooster: [],
//   PlayerDailyQuestData: [],
//   PlayerAchievementData: {},
//   PlayerTutorialData: {}
// };

// const generateDefaultName = async () => {
//   const counter = await NameCounter.findByIdAndUpdate(
//     'default',
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );
//   return `JohnDigger${counter.seq}`;
// };

// // Prevent nulls making it to client
// function normalizeProfile(obj) {
//   if (!obj) return obj;
//   const ensure = (key, defVal) => {
//     if (obj[key] === undefined || obj[key] === null) {
//       obj[key] = Array.isArray(defVal) ? [] : (typeof defVal === 'object' ? {} : defVal);
//     }
//   };
//   for (const [k, v] of Object.entries(defaultData)) ensure(k, v);

//   if (obj.PlayerCampaignProgress == null) obj.PlayerCampaignProgress = {};
//   if (obj.PlayerSelectingBooster == null) obj.PlayerSelectingBooster = [];
//   if (obj.PlayerDailyQuestData == null) obj.PlayerDailyQuestData = [];
//   if (obj.PlayerAchievementData == null) obj.PlayerAchievementData = {};
//   if (obj.PlayerTutorialData == null) obj.PlayerTutorialData = {};
//   return obj;
// }

// const getWalletProfile = async (walletAddress) => {
//   if (!walletAddress) throw new Error('walletAddress required');
//   let profile = await PlayerProfile.findOne({ walletAddress });
//   if (!profile) {
//     profile = new PlayerProfile({ walletAddress, ...defaultData });
//     normalizeProfile(profile);
//     await profile.save();
//   } else {
//     normalizeProfile(profile);
//     await profile.save(); // persist normalization for old docs
//   }
//   return profile;
// };

// // ---------------- controllers ----------------
// exports.saveProfile = async (req, res) => {
//   try {
//     const { data: shouldUpdate, walletAddress, ...data } = req.body;

//     if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

//     // If client sent data=true, just fetch-and-return (no changes)
//     if (shouldUpdate) {
//       const profile = await getWalletProfile(walletAddress);
//       return res.json(profile); // model getters decode CampaignProgress
//     }

//     let profile = await PlayerProfile.findOne({ walletAddress });
//     if (!profile) profile = new PlayerProfile({ walletAddress, ...defaultData });

//     // Shallow merge user payload into doc (schema setters handle CampaignProgress encoding)
//     Object.assign(profile, data);
//     normalizeProfile(profile);

//     await profile.save();

//     const fresh = await getWalletProfile(walletAddress); // includes decoded CampaignProgress via getters
//     return res.json(fresh);
//   } catch (error) {
//     console.error('Error in saveProfile:', error);
//     if (error?.name === 'ValidationError' || error?.name === 'CastError') {
//       return res.status(400).json({ error: error.message, details: error.errors });
//     }
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// exports.getProfile = async (req, res) => {
//   try {
//     const walletAddress = req.query.walletAddress;
//     if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

//     const profile = await getWalletProfile(walletAddress); // getters decode automatically
//     return res.json(profile);
//   } catch (error) {
//     console.error('Error in getProfile:', error);
//     if (error?.name === 'ValidationError' || error?.name === 'CastError') {
//       return res.status(400).json({ error: error.message, details: error.errors });
//     }
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// exports.getLeaderboard = async (req, res) => {
//   try {
//     // Avoid .lean() so schema getters (decode) run automatically
//     const leaderboard = await PlayerProfile.find()
//       .sort({ 'PlayerProfile.exp': -1 })
//       .limit(100);

//     const walletAddresses = leaderboard.map(p => p.walletAddress);
//     const nameRecords = await WarzoneNameWallet.find({ walletAddress: { $in: walletAddresses } });
//     const nameMap = {};
//     nameRecords.forEach(r => { nameMap[r.walletAddress] = r.name; });

//     const leaderboardWithNames = leaderboard.map(doc => {
//       const profile = doc.toObject(); // getters already applied by toObject
//       const normalized = normalizeProfile(profile);
//       return {
//         ...normalized,
//         name: nameMap[profile.walletAddress] || `JohnDigger${Math.floor(Math.random() * 1000)}`
//       };
//     });

//     res.json(leaderboardWithNames);
//   } catch (error) {
//     console.error('Error in getLeaderboard:', error);
//     res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
//   }
// };

// exports.checkNameExistance = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ error: 'name is required' });
//     const profile = await WarzoneNameWallet.findOne({ name });
//     if (profile) return res.json({ success: false, message: 'Name already exists' });
//     return res.json({ success: true, message: 'Name is available' });
//   } catch (error) {
//     console.error('Error in checkNameExistance:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.saveName = async (req, res) => {
//   try {
//     const { name, walletAddress } = req.body;
//     if (!walletAddress || !name) {
//       return res.status(400).json({ success: false, error: 'Wallet address and name are required' });
//     }

//     const existingName = await WarzoneNameWallet.findOne({ name });
//     if (existingName && existingName.walletAddress !== walletAddress) {
//       return res.status(400).json({ success: false, error: 'Name is already taken' });
//     }

//     const profile = await WarzoneNameWallet.findOneAndUpdate(
//       { walletAddress },
//       { name, isDefaultName: false },
//       { new: true, upsert: true, setDefaultsOnInsert: true }
//     );

//     res.json({ success: true, message: 'Name saved successfully', data: profile });
//   } catch (error) {
//     console.error('Error saving name:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };

// exports.getName = async (req, res) => {
//   try {
//     const walletAddress = req.walletAddress;
//     if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

//     let nameRecord = await WarzoneNameWallet.findOne({ walletAddress });
//     if (!nameRecord) {
//       const defaultName = await generateDefaultName();
//       nameRecord = new WarzoneNameWallet({ walletAddress, name: defaultName, isDefaultName: true });
//       await nameRecord.save();
//     }

//     res.json({ success: true, name: nameRecord.name, isDefault: nameRecord.isDefaultName || false });
//   } catch (error) {
//     console.error('Error in getName:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { walletAddress } = req.body;
//     if (!walletAddress) {
//       return res.status(400).json({ success: false, message: 'Wallet address is required' });
//     }

//     let profile = await PlayerProfile.findOne({ walletAddress });
//     const isNewUser = !profile;

//     if (isNewUser) {
//       profile = new PlayerProfile({ walletAddress, ...defaultData });
//       normalizeProfile(profile);
//       await profile.save();
//     } else {
//       normalizeProfile(profile);
//       await profile.save();
//     }

//     const token = jwt.sign({ walletAddress }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       ...(process.env.NODE_ENV === 'production' ? { domain: '.warzonewarriors.xyz' } : {})
//     });

//     res.status(isNewUser ? 201 : 200).json({
//       success: true,
//       message: isNewUser ? 'User registered successfully' : 'Login successful',
//       token,
//       user: { walletAddress: profile.walletAddress, isNewUser }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ success: false, message: 'Server error during authentication' });
//   }
// };

//Final

const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ---------------- dot-key helpers (for keys like "1.1") ---------------- */
const DOT_ENC = '__dot__';

function encodeObjKeys(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    out[String(k).replace(/\./g, DOT_ENC)] = v;
  }
  return out;
}
function decodeObjKeys(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[String(k).replace(new RegExp(DOT_ENC, 'g'), '.')] = v;
  }
  return out;
}

/* ---- Legacy CampaignProgress (object-of-objects) ---- */
function encodeCampaignProgressObj(input) { return encodeObjKeys(input); }
function decodeCampaignProgressObj(obj)   { return decodeObjKeys(obj); }

/* ---- StageProgress (Map<string, [bool,bool,bool]>) ---- */
function normalizeStageArray(val) {
  if (!Array.isArray(val)) return [false, false, false];
  const out = [false, false, false];
  for (let i = 0; i < 3; i++) out[i] = Boolean(val[i]);
  return out;
}
function encodeStageProgressObj(input) {
  const encoded = encodeObjKeys(input);
  for (const k of Object.keys(encoded)) {
    encoded[k] = normalizeStageArray(encoded[k]);
  }
  return encoded;
}
function decodeStageProgressObj(obj) {
  const decoded = decodeObjKeys(obj);
  for (const k of Object.keys(decoded)) {
    decoded[k] = normalizeStageArray(decoded[k]);
  }
  return decoded;
}

/* ---------------- inventories ---------------- */
const GunSchema = new Schema({
  id: { type: Number, required: true },
  level: { type: Number, default: 1 },
  ammo: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false }
}, { _id: false });

const GrenadeSchema = new Schema({
  id: { type: Number, required: true },
  level: { type: Number, default: 1 },
  quantity: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false }
}, { _id: false });

const MeleeSchema = new Schema({
  id: { type: Number, required: true },
  level: { type: Number, default: 1 },
  isNew: { type: Boolean, default: false }
}, { _id: false });

/* ---- ONLY this sub-schema needs a literal field named "type" ---- */
const DailyQuestSchema = new Schema({
  type:      { $type: Number, required: true, min: 0 },
  progress:  { $type: Number, required: true, min: 0 },
  isClaimed: { $type: Boolean, required: true }
}, { _id: false, typeKey: '$type' });

/* ---------------- main schema ---------------- */
const PlayerProfileSchema = new Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },

  PlayerProfile: {
    level: { type: Number, default: 1 },
    exp:   { type: Number, default: 0 }
  },

  PlayerResources: {
    coin: { type: Number, default: 1000 },
    gem:  { type: Number, default: 0 },
    stamina: { type: Number, default: 0 },
    medal:   { type: Number, default: 0 },
    tournamentTicket: { type: Number, default: 0 }
  },

  // Map<string, {id, level}>
  PlayerRambos: { type: Map, of: new Schema({ id: Number, level: Number }, { _id: false }), default: {} },

  // Map<string, Map<string, number>>
  PlayerRamboSkills: { type: Map, of: { type: Map, of: Number }, default: {} },

  // inventories as Map<string, subdoc>
  PlayerGuns:        { type: Map, of: GunSchema,     default: {} },
  PlayerGrenades:    { type: Map, of: GrenadeSchema, default: {} },
  PlayerMeleeWeapons:{ type: Map, of: MeleeSchema,   default: {} },

  // Legacy Campaign progress (object): accept dotted keys, store encoded, return decoded
  PlayerCampaignProgress: {
    type: Schema.Types.Mixed,
    default: {},
    set: encodeCampaignProgressObj,
    get: decodeCampaignProgressObj
  },

  // Stage progress: Map<string, [bool,bool,bool]>, dot-safe keys + normalization
  PlayerCampaignStageProgress: {
    type: Map,
    of: {
      type: [Boolean],
      validate: v => Array.isArray(v) && v.length === 3
    },
    default: {},
    set: encodeStageProgressObj,
    get: decodeStageProgressObj
  },

  PlayerCampaignRewardProgress: { type: Map, of: Schema.Types.Mixed, default: {} },

  PlayerBoosters: { type: Map, of: Number, default: {} },

  PlayerSelectingBooster: { type: [Number], default: [] },

  // Daily quests keep "type" as a data field via sub-schema typeKey
  PlayerDailyQuestData: { type: [DailyQuestSchema], default: [] },

  PlayerAchievementData: { type: Map, of: Schema.Types.Mixed, default: {} },
  PlayerTutorialData: {
    Character: { type: Boolean, default: false },
    Booster:   { type: Boolean, default: false },
    ActionInGame: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  minimize: false,         // keep empty objects
  versionKey: false,
  toJSON:   { getters: true },  // decode getters in API responses
  toObject: { getters: true }
});

// Safe export for hot reloads
module.exports = mongoose.models.WarzonePlayerProfile
  || mongoose.model('WarzonePlayerProfile', PlayerProfileSchema);
