import { RouteContext } from "gadget-server";
// import { Client } from "@gadget-client/imagearmor";
import generateImage from "../../sharp/process";

/**
 * Route handler for GET hello
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
export default async function route({ request, reply, api, logger, connections }) {
  if (typeof connections.shopify.current === "undefined") {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const shopify = connections.shopify.current

  const { productId, text, type, watermark, layout, rotated, opacity, width, position, quality, style, size, altTextEnabled, altFormat, textColor } = request.query;
  let imageUrl = "";
  // Check if image is already processed
  const processedImage = await api.processedImages.maybeFindFirst({
    search: productId.replace("gid://shopify/Product/", "")
  })
  let product = false;
  if (processedImage) {
    const BUCKET_URL = "https://watermark-app.s3.amazonaws.com/";
    imageUrl = BUCKET_URL + processedImage.originalKey;
  } else {
    product = await shopify.product.get(productId.replace("gid://shopify/Product/", ""))
    imageUrl = product.image.src
  } 
  // if(altTextEnabled?.toString() === "true") {
  //   if (!product) {
  //     product = await shopify.product.get(productId.replace("gid://shopify/Product/", ""))
  //   }
  //   // [product_name] - [product_type] by [vendor] - [tags] (limit to 512 chars)
  //   altText = altFormat.replace("[product_name]", product.title).replace("[product_type]", product.product_type).replace("[vendor]", product.vendor).replace("[tags]", product.tags.join(", ")).substring(0, 512)
  // }
  const image = await generateImage({ source: imageUrl, text: text, type: type, watermark: watermark, layout: layout, rotated: rotated, opacity: opacity, width: width, textColor: textColor, position: position, quality: parseInt(quality, 10), style: style, size: size })
  await reply.status(200)
  .header("original-image", imageUrl)
  .type("image/png")
  .send(image)
}
