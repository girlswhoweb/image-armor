// api/processing/usage-callback.ts
// POST /api/processing/usage-callback
// Body: { shopId: string, count: number }
export default async function route({ request, reply, api, logger }) {
  try {
    if ((request.method || "").toUpperCase() !== "POST") {
      return reply.status(405).send({ message: "Method Not Allowed" });
    }

    const secret = request.headers["x-usage-secret"];
    if (secret !== process.env.MANTLE_CALLBACK_SECRET) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    // Body parsing (handles either fetch-style .json() or Fastify-style .body)
    const body = (typeof request.json === "function" ? await request.json() : request.body) || {};
    const shopId = String(body.shopId || "");
    const countNum = Number(body.count);

    if (!shopId || !Number.isFinite(countNum) || countNum <= 0) {
      return reply.status(400).send({ message: "Missing or invalid shopId/count" });
    }

    const shopSettings = await api.shopSettings.findByShopId(shopId);
    if (!shopSettings) return reply.status(404).send({ message: "Shop not found" });

    // --- Send usage to Mantle (batched; set your metric to "sum of property 'count'") ---
    const { MantleClient } = await import("@heymantle/client");
    const mantle = new MantleClient({
      appId: process.env.GADGET_PUBLIC_MANTLE_APP_ID,
      apiKey: process.env.MANTLE_API_KEY,
    });

    await mantle.sendUsageEvent({
      eventName: "images_generated",
      properties: { count: countNum },
    });

    // --- Update your local counter for gating/UI ---
    const newTotal = Number(shopSettings.markedImagesCount || 0) + countNum;
    await api.shopSettings.update(shopSettings.id, {
      markedImagesCount: newTotal,
      processStatus: { ...(shopSettings.processStatus || {}), updatedAt: new Date() },
    });

    return reply.send({ ok: true, recorded: countNum });
  } catch (e) {
    logger.error("usage-callback error", e?.message || String(e));
    return reply.status(500).send({ message: "Internal error" });
  }
}
