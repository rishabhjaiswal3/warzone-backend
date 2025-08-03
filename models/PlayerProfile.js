const mongoose = require('mongoose');

const PlayerProfileSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  PlayerProfile: Object,
  PlayerResources: Object,
  PlayerRambos: Object,
  PlayerRamboSkills: Object,
  PlayerGuns: Object,
  PlayerGrenades: Object,
  PlayerMeleeWeapons: Object,
  PlayerCampaignProgress: Object,
  PlayerCampaignRewardProgress: Object,
  PlayerBoosters: Object,
  PlayerSelectingBooster: Array,
  PlayerDailyQuestData: Array,
  PlayerAchievementData: Object,
  PlayerTutorialData: Object
}, { timestamps: true });

module.exports = mongoose.model('WarzonePlayerProfile', PlayerProfileSchema);