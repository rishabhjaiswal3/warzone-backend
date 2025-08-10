// // models/PlayerProfile.js
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// /* -------- inventories -------- */
// const GunSchema = new Schema({
//   id: { type: Number, required: true },
//   level: { type: Number, default: 1 },
//   ammo: { type: Number, default: 0 },
//   isNew: { type: Boolean, default: false }
// }, { _id: false });

// const GrenadeSchema = new Schema({
//   id: { type: Number, required: true },
//   level: { type: Number, default: 1 },
//   quantity: { type: Number, default: 0 },
//   isNew: { type: Boolean, default: false }
// }, { _id: false });

// const MeleeSchema = new Schema({
//   id: { type: Number, required: true },
//   level: { type: Number, default: 1 },
//   isNew: { type: Boolean, default: false }
// }, { _id: false });

// /* -------- ONLY this sub-schema uses a custom typeKey so a field named "type" is allowed -------- */
// const DailyQuestSchema = new Schema({
//   type:      { $type: Number, required: true, min: 0 },
//   progress:  { $type: Number, required: true, min: 0 },
//   isClaimed: { $type: Boolean, required: true }
// }, { _id: false, typeKey: '$type' });

// /* -------- main schema (keep default "type") -------- */
// const PlayerProfileSchema = new Schema({
//   walletAddress: { type: String, required: true, unique: true, index: true },

//   PlayerProfile: {
//     level: { type: Number, default: 1 },
//     exp:   { type: Number, default: 0 }
//   },

//   PlayerResources: {
//     coin: { type: Number, default: 1000 },
//     gem:  { type: Number, default: 0 },
//     stamina: { type: Number, default: 0 },
//     medal:   { type: Number, default: 0 },
//     tournamentTicket: { type: Number, default: 0 }
//   },

//   // Map<string, {id, level}>
//   PlayerRambos: { type: Map, of: new Schema({ id: Number, level: Number }, { _id: false }), default: {} },

//   // Map<string, Map<string, number>>
//   PlayerRamboSkills: { type: Map, of: { type: Map, of: Number }, default: {} },

//   // inventories as Map<string, subdoc>
//   PlayerGuns:        { type: Map, of: GunSchema,     default: {} },
//   PlayerGrenades:    { type: Map, of: GrenadeSchema, default: {} },
//   PlayerMeleeWeapons:{ type: Map, of: MeleeSchema,   default: {} },

//   PlayerCampaignProgress:       { type: Map, of: Schema.Types.Mixed, default: {} },
//   PlayerCampaignStageProgress:  { type: Map, of: [Boolean],           default: {} },
//   PlayerCampaignRewardProgress: { type: Map, of: Schema.Types.Mixed,  default: {} },

//   PlayerBoosters: { type: Map, of: Number, default: {} },

//   PlayerSelectingBooster: { type: [Number], default: [] },

//   // IMPORTANT: parent uses normal "type", inner schema uses $type – so this is fine
//   PlayerDailyQuestData: { type: [DailyQuestSchema], default: [] },

//   PlayerAchievementData: { type: Map, of: Schema.Types.Mixed, default: {} },
//   PlayerTutorialData: {
//     Character: { type: Boolean, default: false },
//     Booster:   { type: Boolean, default: false },
//     ActionInGame: { type: Boolean, default: false }
//   }
// }, {
//   timestamps: true,
//   minimize: false,
//   versionKey: false
// });

// module.exports = mongoose.model('WarzonePlayerProfile', PlayerProfileSchema);


// models/PlayerProfile.js


//New

// models/PlayerProfile.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ---------- helpers for dot-keys in PlayerCampaignProgress ---------- */
const DOT_ENC = '__dot__';

function encodeCampaignProgress(input) {
  // Accept Map or plain object; return Map with encoded keys
  const m = new Map();
  if (!input) return m;
  const entries = input instanceof Map ? input.entries() : Object.entries(input);
  for (const [k, v] of entries) {
    m.set(String(k).replace(/\./g, DOT_ENC), v);
  }
  return m;
}

function decodeCampaignProgress(mapOrObj) {
  // Accept Map or plain object; return plain object with decoded keys
  const out = {};
  if (!mapOrObj) return out;
  const entries = mapOrObj instanceof Map ? mapOrObj.entries() : Object.entries(mapOrObj);
  for (const [k, v] of entries) {
    out[String(k).replace(new RegExp(DOT_ENC, 'g'), '.')] = v;
  }
  return out;
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

  // Campaign progress with dot-key encoding/decoding (no client change)
  PlayerCampaignProgress: {
    type: Map,
    of: [Boolean],
    default: {},
    set: encodeCampaignProgress,
    get: decodeCampaignProgress
  },

  PlayerCampaignStageProgress:  { type: Map, of: [Boolean],           default: {} },
  PlayerCampaignRewardProgress: { type: Map, of: Schema.Types.Mixed,  default: {} },

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
  minimize: false,
  versionKey: false,
  toJSON:   { getters: true },   // ensure decode getter runs in API responses
  toObject: { getters: true }
});

module.exports = mongoose.model('WarzonePlayerProfile', PlayerProfileSchema);

