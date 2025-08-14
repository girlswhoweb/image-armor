/**
 * Route handler for GET /confirm-charge
 * Managed Pricing: DO NOT call the Billing API.
 * Returns the Shopify Admin pricing page URL for this app.
 *
 * Accepts optional ?plan=starter|pro (we store intent only).
 */
export default async function route({ request, reply, api, logger, connections }) {
  // Must be an embedded, authenticated Shopify session
  if (!connections.shopify.current) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const plan = String(request.query?.plan ?? "starter").toLowerCase();
    const shopId = connections.shopify.currentShopId?.toString();

    const shopSettings = await api.shopSettings.findByShopId(shopId);
    if (!shopSettings?.shopUrl) {
      return reply.status(400).send({ message: "Shop not found" });
    }
    const myshopify = shopSettings?.shopUrl;
    const storeHandle = myshopify.replace(".myshopify.com", "");

    // Your app handle as it appears in Admin (matches your TOML / app settings)
    const appHandle = "imagearmor"; // <-- change if your production handle differs

    // Shopify Admin pricing page for your app (Shopify-managed checkout)
    const pricingUrl = `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;
    

    logger?.info?.("Managed Pricing redirect", {
      shop: shopSettings.shopUrl,
      planIntent: plan,
      pricingUrl,
    });

    return reply.send({ pricingUrl, plan });
  } catch (err) {
    const msg = err?.message || String(err);
    logger?.error?.("confirm-charge error", msg);
    return reply.status(500).send({ message: "Internal error", error: msg });
  }
}
