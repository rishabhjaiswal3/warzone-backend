// controllers/iapController.js
const PlayerProfile = require("../models/PlayerProfile");

const COIN_PACKS = new Map([["100",100],["500",500],["1000",1000],["2000",2000]]);
const GEM_PACKS  = new Map([["100",100],["300",300],["500",500],["1000",1000]]);
// Per your spec (Tesla Mini shares id=7 with Sniper Rifle)
const GUN_IDS    = new Map([
  ["Shotgun",4],
  ["Bullpup",6],
  ["ScarH",2],
  ["Sniper Rifle",7],
  ["Tesla Mini",8],
  ["AWP",3],
]);

// POST /api/v1/player/iap/purchase
// Body: { category: "Coins"|"Gems"|"Guns", product: "100"|"500"|...|"ScarH"|... }
exports.purchase = async (req, res) => {
  try {
    // Get wallet from auth middleware (verifyUser sets req.walletAddress)
    const wallet = (req.walletAddress || req.user?.wallet || req.wallet || "").toLowerCase();
    if (!wallet) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const { category, product } = req.body || {};
    if (!category || !product) {
      return res.status(400).json({ ok: false, message: "category and product are required" });
    }

    const player = await PlayerProfile.findOne({ 
      walletAddress: { $regex: new RegExp(`^${wallet}$`, 'i') } 
  });
    if (!player) return res.status(404).json({ ok: false, message: "Player not found" });

    let message = "";
    let changed = false;

    if (category === "Coins") {
      const amt = COIN_PACKS.get(String(product));
      if (!amt) return res.status(400).json({ ok: false, message: "Invalid coin pack" });
      player.PlayerResources = player.PlayerResources || { coin: 0, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 };
      player.PlayerResources.coin = (player.PlayerResources.coin ?? 0) + amt;
      message = `Added +${amt} coins`;
      changed = true;
    } else if (category === "Gems") {
      const amt = GEM_PACKS.get(String(product));
      if (!amt) return res.status(400).json({ ok: false, message: "Invalid gem pack" });
      player.PlayerResources = player.PlayerResources || { coin: 0, gem: 0, stamina: 0, medal: 0, tournamentTicket: 0 };
      player.PlayerResources.gem = (player.PlayerResources.gem ?? 0) + amt;
      message = `Added +${amt} gems`;
      changed = true;
    } else if (category === "Guns") {
      const gunId = GUN_IDS.get(String(product));
      if (gunId === undefined) return res.status(400).json({ ok: false, message: "Invalid gun product" });

      player.PlayerGuns = player.PlayerGuns || {};

      if (player.PlayerGuns[String(gunId)]) {
        // Already owned → no-op
        return res.json({
          ok: true,
          message: `Gun already owned: ${product} (id=${gunId})`,
          data: { walletAddress: player.walletAddress, PlayerGuns: player.PlayerGuns }
        });
      }

      player.PlayerGuns[String(gunId)] = { id: gunId, level: 1, ammo: 0, isNew: false };
      message = `Unlocked gun: ${product} (id=${gunId})`;
      changed = true;
    } else {
      return res.status(400).json({ ok: false, message: "Unsupported category. Allowed: Coins, Gems, Guns" });
    }

    if (changed) await player.save();

    return res.json({
      ok: true,
      message,
      data: {
        walletAddress: player.walletAddress,
        PlayerResources: player.PlayerResources,
        PlayerGuns: player.PlayerGuns || {}
      }
    });
  } catch (err) {
    const status = err?.statusCode || 500;
    return res.status(status).json({ ok: false, message: err?.message || "Internal error" });
  }
};
