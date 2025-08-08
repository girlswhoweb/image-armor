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

  // Loop through all the shops and migrate
  for (const shop of shopList) {
    try {
      const shopSettings = await api.shopSettings.findByShopUrl(shop.shopUrl)
      if (!shopSettings) return
      await api.shopSettings.update(shopSettings.id,
        {
          isMigrated: true
        }
      )
    } catch(err){
      console.log(err)
    }
  };
}

export const options = { triggers: { api: true } }