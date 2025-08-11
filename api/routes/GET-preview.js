import { RouteContext } from "gadget-server";
import generateImage from "../../sharp/process";

const GET_PRODUCT_IMAGE = `
  query getProductImage($id: ID!) {
    product(id: $id) {
      images(first: 1) {
        edges {
          node {
            url
          }
        }
      }
    }
  }
`;

export default async function route({ request, reply, api, logger, connections }) {
  if (!connections.shopify.current) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
  const shopify = connections.shopify.current;

  const {
    productId,
    text, type, watermark, layout, rotated,
    opacity, width, position, quality,
    style, size, textColor
  } = request.query;

  // See if we’ve already processed this one
  const processedImage = await api.processedImages.maybeFindFirst({
    search: productId.replace("gid://shopify/Product/", "")
  });

  let imageUrl;
  if (processedImage) {
    // Use the already-staged S3 URL
    imageUrl = `https://watermark-app.s3.amazonaws.com/${processedImage.originalKey}`;
  } else {
    // GraphQL fetch of the product’s primary image URL
    const { product } = await shopify.graphql(GET_PRODUCT_IMAGE, {
      id: productId   // full "gid://shopify/Product/…" string
    });
    imageUrl = product.images.edges[0]?.node.url || "";
    logger.debug("Fetched product image via GraphQL:", imageUrl);
  }

  const image = await generateImage({
    source:    imageUrl,
    text, type, watermark, layout, rotated,
    opacity, width, textColor, position,
    quality: parseInt(quality, 10), style, size
  });

  await reply
    .status(200)
    .header("original-image", imageUrl)
    .type("image/png")
    .send(image);
}
