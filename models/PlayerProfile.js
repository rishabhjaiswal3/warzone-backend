// const mongoose = require('mongoose');

// const PlayerProfileSchema = new mongoose.Schema({
//   walletAddress: { type: String, required: true, unique: true },
//   PlayerProfile: Object,
//   PlayerResources: Object,
//   PlayerRambos: Object,
//   PlayerRamboSkills: Object,
//   PlayerGuns: Object,
//   PlayerGrenades: Object,
//   PlayerMeleeWeapons: Object,
//   PlayerCampaignProgress: Object,
//   PlayerCampaignRewardProgress: Object,
//   PlayerBoosters: Object,
//   PlayerSelectingBooster: Array,
//   PlayerDailyQuestData: Array,
//   PlayerAchievementData: Object,
//   PlayerTutorialData: Object
// }, { timestamps: true });

// module.exports = mongoose.model('WarzonePlayerProfile', PlayerProfileSchema);


//New

const mongoose = require('mongoose');
const { Schema } = mongoose;

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

const PlayerProfileSchema = new Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },

  PlayerProfile: {
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 }
  },

  PlayerResources: {
    coin: { type: Number, default: 1000 },
    gem: { type: Number, default: 0 },
    stamina: { type: Number, default: 0 },
    medal: { type: Number, default: 0 },
    tournamentTicket: { type: Number, default: 0 }
  },

  // Use Map<string, Rambo>
  PlayerRambos: { type: Map, of: new Schema({ id: Number, level: Number }, { _id: false }), default: {} },

  // Map<string, Map<string, number>>
  PlayerRamboSkills: { type: Map, of: { type: Map, of: Number }, default: {} },

  // Maps for inventories
  PlayerGuns: { type: Map, of: GunSchema, default: {} },
  PlayerGrenades: { type: Map, of: GrenadeSchema, default: {} },
  PlayerMeleeWeapons: { type: Map, of: MeleeSchema, default: {} },

  // LEGACY: keep non-null so Unity migration never crashes
  PlayerCampaignProgress: { type: Map, of: Schema.Types.Mixed, default: {} },

  // NEW canonical field — ALWAYS an object, never null
  PlayerCampaignStageProgress: { type: Map, of: [Boolean], default: {} },

  PlayerCampaignRewardProgress: { type: Map, of: Schema.Types.Mixed, default: {} },

  // Boosters as numeric-string keys -> number
  PlayerBoosters: { type: Map, of: Number, default: {} },

  PlayerSelectingBooster: { type: [Number], default: [] },
  PlayerDailyQuestData: {
    type: [{ type: Number, progress: Number, isClaimed: Boolean }],
    default: []
  },
  PlayerAchievementData: { type: Map, of: Schema.Types.Mixed, default: {} },
  PlayerTutorialData: {
    Character: { type: Boolean, default: false },
    Booster: { type: Boolean, default: false },
    ActionInGame: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  minimize: false,      // <-- keep empty {}
  versionKey: false
});

module.exports = mongoose.model('WarzonePlayerProfile', PlayerProfileSchema);
