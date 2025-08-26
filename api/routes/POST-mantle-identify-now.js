// api/routes/POST-mantle-identify-now.js
import { identifyShop } from "../services/mantle.js";

export default async function route({ reply, api, connections, logger }) {
  try {
    const shopId = connections?.shopify?.currentShopId;
    if (!shopId) return reply.status(401).send({ ok: false, reason: "no-shop-session" });

    const out = await identifyShop({ shopId, api, logger });

    // Re-read to show the latest token value
    const fresh = await api.internal.shopifyShop.findOne(String(shopId), {
      select: { mantleApiToken: true },
    });

    return reply.send({
      ...out,
      mantleApiToken: fresh?.mantleApiToken ?? null,
    });
  } catch (e) {
    logger?.error?.("mantle-identify-now route exception", { message: e?.message, stack: e?.stack });
    return reply.status(500).send({ ok: false, reason: "route-exception", error: e?.message });
  }
}
