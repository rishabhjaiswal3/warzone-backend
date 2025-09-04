// src/controllers/iap.controller.js
const ApiError = require("../utils/ApiError");
const PlayerProfile = require("../models/PlayerProfile");

const COIN_PACKS = new Map([["100",100],["500",500],["1000",1000],["2000",2000]]);
const GEM_PACKS  = new Map([["100",100],["300",300],["500",500],["1000",1000]]);
const GUN_IDS    = new Map([
  ["Shotgun",4],
  ["Bullpup",6],
  ["ScarH",2],
  ["Sniper Rifle",7],
  ["Tesla Mini",8], 
  ["AWP",3],
]);

exports.purchase = async (req, res) => {
  try {
    const wallet = req.wallet?.toLowerCase();
    if (!wallet) throw new ApiError(401, "Unauthorized");

    const { category, product } = req.body || {};
    if (!category || !product) throw new ApiError(400, "category and product are required");

    const player = await PlayerProfile.findOne({ walletAddress: wallet });
    if (!player) throw new ApiError(404, "Player not found");

    let message = "";
    let changed = false;

    if (category === "Coins") {
      const amt = COIN_PACKS.get(String(product));
      if (!amt) throw new ApiError(400, "Invalid coin pack");
      player.PlayerResources = player.PlayerResources || { coin: 0, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 };
      player.PlayerResources.coin = (player.PlayerResources.coin ?? 0) + amt;
      message = `Added +${amt} coins`;
      changed = true;
    } else if (category === "Gems") {
      const amt = GEM_PACKS.get(String(product));
      if (!amt) throw new ApiError(400, "Invalid gem pack");
      player.PlayerResources = player.PlayerResources || { coin: 0, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 };
      player.PlayerResources.gem = (player.PlayerResources.gem ?? 0) + amt;
      message = `Added +${amt} gems`;
      changed = true;
    } else if (category === "Guns") {
      const gunId = GUN_IDS.get(String(product));
      if (gunId === undefined) throw new ApiError(400, "Invalid gun product");

      player.PlayerGuns = player.PlayerGuns || {};

      if (player.PlayerGuns[String(gunId)]) {
        return res.json({
          ok: true,
          message: `Gun already owned: ${product} (id=${gunId})`,
          data: { PlayerGuns: player.PlayerGuns },
        });
      }

      player.PlayerGuns[String(gunId)] = { id: gunId, level: 1, ammo: 0, isNew: false };
      message = `Unlocked gun: ${product} (id=${gunId})`;
      changed = true;
    } else {
      throw new ApiError(400, "Unsupported category. Allowed: Coins, Gems, Guns");
    }

    if (changed) await player.save();

    return res.json({
      ok: true,
      message,
      data: {
        walletAddress: player.walletAddress,
        PlayerResources: player.PlayerResources,
        PlayerGuns: player.PlayerGuns || {},
      },
    });
  } catch (err) {
    return res.status(err?.statusCode || 500).json({ ok: false, message: err?.message || "Internal error" });
  }
};
