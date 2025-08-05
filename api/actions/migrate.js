import { MigrateGlobalActionContext } from "gadget-server";
import Shopify from "shopify-api-node";
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb+srv://ocw_prod:kv1oEE5CvVKT1Q74@prodshared.go8yldc.mongodb.net/';
const client = new MongoClient(url);

// Database Name
const dbName = 'ocw_prod';

/**
 * @param { MigrateGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  // Use connect method to connect to the databse server
  await client.connect();
  console.log('Connected successfully to database');
  const db = client.db(dbName);
  const shops = db.collection('shops');
  const shopList = await shops.find({ isDeleted: false, isMigrated: false }).toArray();
  // const shopList = await shops.find({ isDeleted: false, isMigrated: false, $or: [{connectionError: { $exists: false }}, {connectionError: false}] }).toArray();
  // const shopList = await shops.find({ shopUrl: "one-click-watermark.myshopify.com" }).toArray();

  // Loop through all the shops and migrate
  for (const shop of shopList) {
    try {
      const shopSettings = await api.shopSettings.findByShopUrl(shop.shopUrl)
      // await api.shopifySync.run({
      //   domain: shop.shopUrl,
      //   shop: {
      //     _link: shopSettings._shopId
      //   },
      //   syncSince: "1900-01-01T00:00:00.000+00:00"
      // })
      if (!shopSettings) return
      await api.shopSettings.update(shopSettings.id,
        {
          isMigrated: true
        }
      )
      // console.log("Processing shop: ", shop.shopUrl);
      // const imageListDb = db.collection('imageList');
      // const aggregationPipelineCount = [
      //   {
      //     $match: {
      //       shopUrl: shop.shopUrl
      //     }
      //   },
      //   {
      //     $group: {
      //       _id: {
      //         shopUrl: "$shopUrl",
      //         productId: "$productId",
      //       },
      //       imageList: {
      //         $push: {
      //           imageId: "$imageId",
      //           fileKey: "$fileKey",
      //           isMarked: "$isMarked",
      //           mediaId: "$mediaId",
      //           altText: "$altText",
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$_id.shopUrl",
      //       count: { $sum: 1 }, // Count the number of groups
      //     },
      //   }
      // ]
      // // const productCount = await imageListDb.aggregate(aggregationPipelineCount).toArray()
      // // console.log("productCount", productCount[0]?.count);
      // // if (productCount[0]?.count < 5000) continue
      // const aggregationPipeline = [
      //   {
      //     $match: {
      //       shopUrl: shop.shopUrl
      //     }
      //   },
      //   {
      //     $group: {
      //       _id: {
      //         shopUrl: "$shopUrl",
      //         productId: "$productId",
      //       },
      //       imageList: {
      //         $push: {
      //           imageId: "$imageId",
      //           fileKey: "$fileKey",
      //           isMarked: "$isMarked",
      //           mediaId: "$mediaId",
      //           altText: "$altText",
      //         },
      //       },
      //     },
      //   }
      // ]
      // const productList = await imageListDb.aggregate(aggregationPipeline).toArray()
      // const shopify = new Shopify({
      //   shopName: shop.shopUrl,
      //   accessToken:  shop.accessToken,
      // });
      // const shopData = (await shopify.shop.get());
      // const processedProductList = []
      // const shopifyImageList = []
      // const processedImageList = []
      // for (const product of productList) {
      //   try {
      //     const processedProduct = {
      //       id: product._id.productId.replace("gid://shopify/Product/", ""),
      //       shop: {
      //         _link: shopData.id
      //       }
      //     }
      //     const productImageList = product.imageList || []
      //     if (productImageList === 0) continue
      //     for (const image of productImageList) {
      //       // Ckeck if the objecte keys contains the imageId else continue
      //       if (!image.imageId) continue
      //       const shopifyImage = {
      //         id: image.imageId.replace("gid://shopify/ProductImage/", ""),
      //         shop: {
      //           _link: shopData.id
      //         },
      //         product: {
      //           _link: product._id.productId.replace("gid://shopify/Product/", "")
      //         }
      //       }
      //       const processedImage = {
      //         altBackup: image.altText || null,
      //         isMarked: image.isMarked || false,
      //         processedKey: image.fileKey || null,
      //         shop: {
      //           _link: shopData.id
      //         },
      //         product: {
      //           _link: product._id.productId.replace("gid://shopify/Product/", "")
      //         },
      //         productImage: {
      //           _link: image.imageId.replace("gid://shopify/ProductImage/", "")
      //         }
      //       }
      //       processedImageList.push(processedImage)
      //       shopifyImageList.push(shopifyImage)
      //     }
      //     processedProductList.push(processedProduct)
      //   } catch(err) {
      //     console.log(err)
      //   }
      // }
      // if (processedProductList.length === 0) continue
      // try {
      //   function splitArray(originalArray, chunkSize) {
      //     const resultArray = [];
      //     for (let i = 0; i < originalArray.length; i += chunkSize) {
      //       const chunk = originalArray.slice(i, i + chunkSize);
      //       resultArray.push(chunk);
      //     }
      //     return resultArray;
      //   }
      //   const productListChunks = splitArray(processedProductList, 5000)
      //   for (const productListChunk of productListChunks) {
      //     await api.internal.shopifyProduct.bulkCreate(productListChunk)
      //   }
      //   if (shopifyImageList.length > 0) {
      //     const shopifyImageListChunks = splitArray(shopifyImageList, 5000);
      //     const processedImageListChunks = splitArray(processedImageList, 5000);
      //     for (const [index, shopifyImageListChunk] of shopifyImageListChunks.entries()) {
      //       await api.internal.shopifyProductImage.bulkCreate(shopifyImageListChunk)
      //       await api.internal.processedImages.bulkCreate(processedImageListChunks[index])
      //     }
      //     // await api.internal.shopifyProductImage.bulkCreate(shopifyImageList)
      //     // await api.internal.processedImages.bulkCreate(processedImageList)
      //   }
      //   // Mark isMigrated as true
      //   await shops.updateOne(
      //     { _id: shop._id },
      //     { $set: { isMigrated: true } }
      //   )
      //   const shopSettings = await api.shopSettings.findByShopUrl(shop.shopUrl)
      //   await api.shopSettings.up(shopSettings.id,
      //     {
      //       isMigrated: true
      //     }
      //   )
      // } catch(err) {
      //   console.log(err)
      // }

      // const shopify = new Shopify({
      //   shopName: shop.shopUrl,
      //   accessToken:  shop.accessToken,
      // });
      // const shopData = (await shopify.shop.get());
      // console.log("Migration shop: ", shop.shopUrl, shopData.name);
      // await api.internal.shopifyShop.create({
      //   shopifyShop: {
      //     id: shopData.id,
      //     myshopifyDomain: shop.shopUrl,
      //     accessToken: shop.accessToken,
      //     installedViaApiKey: "gsk-Zmzqa9a9pyWGAfaehWw7VNR4LWQiTryA",
      //     grantedScopes: ["read_products", "write_products"],
      //     email: shop.email,
      //     name: shopData.name,
      //     address1: shopData.address1,
      //     city: shopData.city,
      //     country: shopData.country,
      //     countryCode: shopData.country_code,
      //     currency: shopData.currency,
      //     domain: shopData.domain
      //   }
      // }).then(async (res) => {
      //   console.log(res)
      //   await api.shopSettings.create({
      //     shopUrl: shop.shopUrl,
      //     _shopId: `${shopData.id}`,
      //     shop: {
      //       _link: shopData.id
      //     },
      //     isMigrated: false
      //   })
      //   // await api.shopifySync.run({
      //   //   domain: shop.shopUrl,
      //   //   shop: {
      //   //     _link: `${shopData.id}`
      //   //   },
      //   //   syncSince: "1900-01-01T00:00:00.000+00:00"
      //   // })
      //   return {
      //     message: "ok"
      //   }
      // }).catch((err) => {
      //   console.log(err)
      // })
    } catch(err){
      console.log(err)
    }
  };
}

export const options = { triggers: { api: true } }