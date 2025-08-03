const PlayerProfile = require('../models/PlayerProfile');

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

exports.getProfile = async (req, res) => {
  const { walletAddress } = req.query;
  if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

  let profile = await PlayerProfile.findOne({ walletAddress });
  if (!profile) {
    profile = new PlayerProfile({ walletAddress, ...defaultData });
    await profile.save();
  }
  res.json(profile);
};

exports.saveProfile = async (req, res) => {
  const { walletAddress, ...data } = req.body;
  if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

  let profile = await PlayerProfile.findOne({ walletAddress });
  if (!profile) profile = new PlayerProfile({ walletAddress });

  Object.assign(profile, data);
  await profile.save();

  res.json({ success: true, message: 'Profile saved successfully' });
};

exports.getLeaderboard = async (req, res) => {
  const leaderboard = await PlayerProfile.find().sort({ 'PlayerProfile.exp': -1 });
  res.json(leaderboard);
};