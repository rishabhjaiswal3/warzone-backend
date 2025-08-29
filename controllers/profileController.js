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

// controllers/warzoneController.js
const jwt = require('jsonwebtoken');
const PlayerProfile = require('../models/PlayerProfile');
const WarzoneNameWallet = require('../models/nameWallet');
const NameCounter = require('../models/nameCounter');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/* ---------------- defaults & utils ---------------- */
const defaultData = {
  PlayerProfile: { level: 1, exp: 0 },
  PlayerResources: { coin: 1000, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 },
  PlayerRambos: { "0": { id: 0, level: 1 } },
  PlayerRamboSkills: { "0": Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i.toString(), 0])) },
  PlayerGuns: { "0": { id: 0, level: 1, ammo: 0, isNew: false } },
  PlayerGrenades: { "500": { id: 500, level: 1, quantity: 10, isNew: false } },
  PlayerMeleeWeapons: { "600": { id: 600, level: 1, isNew: false } },

  // Legacy kept non-null but unused
  PlayerCampaignProgress: {},
  // Canonical progress used by game
  PlayerCampaignStageProgress: {},
  PlayerCampaignRewardProgress: {},

  // Boosters
  PlayerBoosters: { Hp: 0, Grenade: 0, Damage: 0, CoinMagnet: 0, Speed: 0, Critical: 0 },

  PlayerSelectingBooster: [],
  PlayerDailyQuestData: [],
  PlayerAchievementData: {},
  PlayerTutorialData: {}
};

const generateDefaultName = async () => {
  const counter = await NameCounter.findByIdAndUpdate(
    'default',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `JohnDigger${counter.seq}`;
};

// Ensure non-null containers before sending to client
function normalizeProfile(obj) {
  if (!obj) return obj;
  const ensure = (key, defVal) => {
    if (obj[key] === undefined || obj[key] === null) {
      obj[key] = Array.isArray(defVal) ? [] : (typeof defVal === 'object' ? {} : defVal);
    }
  };
  for (const [k, v] of Object.entries(defaultData)) ensure(k, v);

  if (obj.PlayerCampaignProgress == null) obj.PlayerCampaignProgress = {};
  if (obj.PlayerCampaignStageProgress == null) obj.PlayerCampaignStageProgress = {};
  if (obj.PlayerCampaignRewardProgress == null) obj.PlayerCampaignRewardProgress = {};
  if (obj.PlayerSelectingBooster == null) obj.PlayerSelectingBooster = [];
  if (obj.PlayerDailyQuestData == null) obj.PlayerDailyQuestData = [];
  if (obj.PlayerAchievementData == null) obj.PlayerAchievementData = {};
  if (obj.PlayerTutorialData == null) obj.PlayerTutorialData = {};

  return obj;
}

const getWalletProfile = async (walletAddress) => {
  if (!walletAddress) throw new Error('walletAddress required');

  // Avoid .lean() so schema getters (e.g., dot-key decode) run
  let profile = await PlayerProfile.findOne({ walletAddress });

  if (!profile) {
    profile = new PlayerProfile({ walletAddress, ...defaultData });
    normalizeProfile(profile);
    await profile.save();
  } else {
    // Keep legacy empty and ensure stage progress exists
    if (profile.PlayerCampaignProgress == null) profile.PlayerCampaignProgress = {};
    if (profile.PlayerCampaignStageProgress == null) profile.PlayerCampaignStageProgress = {};
    normalizeProfile(profile);
    await profile.save(); // persist normalization for old docs
  }
  return profile;
};

/* ---------------- controllers ---------------- */
exports.saveProfile = async (req, res) => {
  try {
    const { data: shouldUpdate, walletAddress, ...data } = req.body;

    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

    // If client sent data=true, just fetch-and-return (no changes)
    if (shouldUpdate) {
      const profile = await getWalletProfile(walletAddress);
      return res.json(profile); // getters decode automatically
    }

    let profile = await PlayerProfile.findOne({ walletAddress });
    if (!profile) profile = new PlayerProfile({ walletAddress, ...defaultData });

    // Always keep legacy empty
    data.PlayerCampaignProgress = {};

    // Canonical field Unity now sends/reads
    if (data.PlayerCampaignStageProgress == null) {
      data.PlayerCampaignStageProgress = {};
    }

    // Shallow merge user payload into doc
    // NOTE: Model setters (dot-key encode/normalize) run on save.
    Object.assign(profile, data);
    normalizeProfile(profile);

    await profile.save();

    const fresh = await getWalletProfile(walletAddress); // decoded + normalized
    return res.json(fresh);
  } catch (error) {
    console.error('Error in saveProfile:', error);
    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
      return res.status(400).json({ error: error.message, details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//Daily Quest
exports.getDailyQuests = async (req, res) => {
  try {
    const { walletAddress } = req.query;
    if (!walletAddress) {
      return res.status(400).json({ success: false, error: "walletAddress is required" });
    }

    // fetch profile with normalization
    const profile = await getWalletProfile(walletAddress);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }

    return res.json({
      wallet: walletAddress,
      PlayerDailyQuestData: profile.PlayerDailyQuestData || []
    });
  } catch (error) {
    console.error("Error in getDailyQuests:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const walletAddress = req.query.walletAddress;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

    const profile = await getWalletProfile(walletAddress); // getters decode automatically
    return res.json(profile);
  } catch (error) {
    console.error('Error in getProfile:', error);
    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
      return res.status(400).json({ error: error.message, details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /dailyQuests/type/:type?walletAddress=0x...
exports.getDailyQuestByType = async (req, res) => {
  try {
    const { walletAddress } = req.query;
    const type = Number(req.params.type);

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: "walletAddress is required" });
    }
    if (!Number.isFinite(type)) {
      return res.status(400).json({ success: false, error: "type must be a number" });
    }

    const profile = await getWalletProfile(walletAddress);
    const all = Array.isArray(profile.PlayerDailyQuestData) ? profile.PlayerDailyQuestData : [];

    // Return ALL quests matching this type (in case multiples exist)
    const matches = all.filter(q => Number(q.type) === type);

    return res.json({
      success: true,
      wallet: walletAddress,
      type,
      quests: matches   // [] if none
    });
  } catch (error) {
    console.error("Error in getDailyQuestByType:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    // Avoid .lean() so schema getters (decode) run automatically
    const leaderboard = await PlayerProfile.find()
      .sort({ 'PlayerResources.coin': -1 }) // Coin se sort kr rha abb kyuki exp 0 rahegi jab tk player award nahi win krleta
      .limit(100);

    const walletAddresses = leaderboard.map(p => p.walletAddress);
    const nameRecords = await WarzoneNameWallet.find({ walletAddress: { $in: walletAddresses } });
    const nameMap = {};
    nameRecords.forEach(r => { nameMap[r.walletAddress] = r.name; });

    const leaderboardWithNames = leaderboard.map(doc => {
      const profile = doc.toObject(); // getters already applied by toObject()
      const normalized = normalizeProfile(profile);
      return {
        ...normalized,
        name: nameMap[profile.walletAddress] || `JohnDigger${Math.floor(Math.random() * 1000)}`
      };
    });

    res.json(leaderboardWithNames);
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
  }
};

exports.checkNameExistance = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const profile = await WarzoneNameWallet.findOne({ name });
    if (profile) return res.json({ success: false, message: 'Name already exists' });
    return res.json({ success: true, message: 'Name is available' });
  } catch (error) {
    console.error('Error in checkNameExistance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.saveName = async (req, res) => {
  try {
    const { name, walletAddress } = req.body;
    if (!walletAddress || !name) {
      return res.status(400).json({ success: false, error: 'Wallet address and name are required' });
    }

    const existingName = await WarzoneNameWallet.findOne({ name });
    if (existingName && existingName.walletAddress !== walletAddress) {
      return res.status(400).json({ success: false, error: 'Name is already taken' });
    }

    const profile = await WarzoneNameWallet.findOneAndUpdate(
      { walletAddress },
      { name, isDefaultName: false },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Name saved successfully', data: profile });
  } catch (error) {
    console.error('Error saving name:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.getName = async (req, res) => {
  try {
    const walletAddress = req.walletAddress;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

    let nameRecord = await WarzoneNameWallet.findOne({ walletAddress });
    if (!nameRecord) {
      const defaultName = await generateDefaultName();
      nameRecord = new WarzoneNameWallet({ walletAddress, name: defaultName, isDefaultName: true });
      await nameRecord.save();
    }

    res.json({ success: true, name: nameRecord.name, isDefault: nameRecord.isDefaultName || false });
  } catch (error) {
    console.error('Error in getName:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: 'Wallet address is required' });
    }

    let profile = await PlayerProfile.findOne({ walletAddress });
    const isNewUser = !profile;

    if (isNewUser) {
      profile = new PlayerProfile({ walletAddress, ...defaultData });
      normalizeProfile(profile);
      await profile.save();
    } else {
      normalizeProfile(profile);
      await profile.save();
    }

    const token = jwt.sign({ walletAddress }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...(process.env.NODE_ENV === 'production' ? { domain: '.warzonewarriors.xyz' } : {})
    });

    res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser ? 'User registered successfully' : 'Login successful',
      token,
      user: { walletAddress: profile.walletAddress, isNewUser }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};



