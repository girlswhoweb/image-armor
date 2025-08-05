import { GetObjectCommand, PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { RouteContext } from "gadget-server";

/**
 * Route handler for GET hello
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
export default async function route({ request, reply, api, logger, connections }) {
  // This route file will respond to an http request -- feel free to edit or change it!
  // For more information on HTTP routes in Gadget applications, see https://docs.gadget.dev/guides/http-routes

  try{
    const shop = request.query.shop
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
      },
    });
    const command = new PutObjectCommand({
      Bucket: "watermark-app",
      Key: shop + "/uploads/logo.png"
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("url", url);
    await reply.type("application/json").send({"url": url})
  } catch(err){
    console.log("err", err);
    await reply.status(500).send(err)
  }

}
