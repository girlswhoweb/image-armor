import { UpdateStatusGlobalActionContext } from "gadget-server";

/**
 * @param { UpdateStatusGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  // Your logic goes here
  const { shopUrl, status } = params;
  console.log("params", params);
  console.log("shopUrl", shopUrl);
  console.log("status", status);
  const shopSettings = await api.shopSettings.findByShopUrl(shopUrl);
  if (shopSettings){
    await api.shopSettings.update(shopSettings.id,
      {
        processStatus: {
          state: status,
        },
      }
    );
  }
};

// Send email notification when processing is completed
    if (status === "COMPLETED") {
      logger.info({ shopId: shopSettings.shopId }, "Processing completed, sending email notification");
      
      try {
        // Get shop details to send email
        const shop = await api.shopifyShop.findOne(shopSettings.shopId);
        
        if (shop && shop.email) {
          // Get processed images statistics for this shop
          let processedImagesCount = 0;
          let markedImagesCount = 0;
          
          try {
            const processedImages = await api.processedImages.findMany({
              filter: {
                shopId: { equals: shopSettings.shopId }
              }
            });
            
            processedImagesCount = processedImages.length;
            markedImagesCount = processedImages.filter(img => img.isMarked).length;
            
            logger.info({ 
              shopId: shopSettings.shopId, 
              processedImagesCount,
              markedImagesCount 
            }, "Fetched image statistics for email");
          } catch (statsError) {
            logger.warn({ 
              error: statsError, 
              shopId: shopSettings.shopId 
            }, "Could not fetch image statistics for email, continuing without stats");
          }

          // Prepare and send enhanced email
          const emailResult = await emails.sendMail({
            to: shop.email,
            from: "ImageArmor by Girls Who Web",
            replyTo: "appsupport@girlswhoweb.com",
            subject: "Image Processing Completed - ImageArmor",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ImageArmor Processing Complete</title>
                <style>
                  body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                  }
                  .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                  }
                  .header {
                    text-align: center;
                    padding: 20px 0;
                    background-color: #f8f9fa;
                    border-bottom: 3px solid #4a90e2;
                  }
                  .header h1 {
                    color: #4a90e2;
                    margin: 0;
                    font-size: 28px;
                  }
                  .content {
                    padding: 20px;
                    background-color: #ffffff;
                  }
                  .stats-box {
                    background-color: #f2f7ff;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 20px 0;
                    border-left: 4px solid #4a90e2;
                  }
                  .stat-item {
                    margin: 10px 0;
                  }
                  .next-steps {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                  }
                  .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #777;
                    border-top: 1px solid #eee;
                  }
                  .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4a90e2;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    margin: 15px 0;
                  }
                </style>
              </head>
              <body>
                <div class="email-container">
                  <div class="header">
                    <h1>ImageArmor</h1>
                    <p>Image Protection & Optimization</p>
                  </div>
                  
                  <div class="content">
                    <h2>🎉 Image Processing Complete!</h2>
                    <p>Hello ${shop.shopOwner || shop.name || "there"},</p>
                    
                    <p>Great news! We've successfully completed processing your images for <strong>${shop.name || shop.myshopifyDomain || 'your store'}</strong>.</p>
                    
                    <div class="stats-box">
                      <h3>Processing Summary</h3>
                      ${processedImagesCount > 0 ? `
                      <div class="stat-item">
                        <strong>Total Images Processed:</strong> ${processedImagesCount}
                      </div>
                      <div class="stat-item">
                        <strong>Images With Watermarks:</strong> ${markedImagesCount}
                      </div>
                      ` : `
                      <p>Your images have been processed according to your settings.</p>
                      `}
                      <p>All your images are now protected and optimized according to your configuration.</p>
                    </div>
                    
                    <div class="next-steps">
                      <h3>What's Next?</h3>
                      <p>You can now:</p>
                      <ul>
                        <li>View your processed images in your Shopify store</li>
                        <li>Adjust your settings in the ImageArmor app if needed</li>
                        <li>Monitor your store for improved image performance</li>
                      </ul>
                      <a href="https://${shop.myshopifyDomain || shop.domain}/admin/apps" class="button">Go to Shopify Apps</a>
                    </div>
                    
                    <p>Thank you for choosing ImageArmor to protect and optimize your store's images! We love saving you time. </p>
                    
                    <p>Best regards,<br>Giulia & Silvia, The ImageArmor Team</p>
                    
                    <div style="background-color: #fff9e6; border-radius: 5px; padding: 15px; margin: 25px 0; border-left: 4px solid #f5a623; font-size: 15px;">
                      <p><strong>P.S.</strong> Loving ImageArmor? We'd be thrilled if you could leave us a review! It only takes a minute and helps us grow. 💖</p>
                      <a href="https://apps.shopify.com/imagearmor/reviews" style="display: inline-block; padding: 10px 20px; background-color: #f5a623; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; font-weight: bold; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">⭐ Rate ImageArmor on the App Store</a>
                    </div>
                  </div>
                  
                  <div class="footer">
                    <p>Need help? Contact our support team at appsupport@girlswhoweb.com. We speak English, Spanish, Portuguese, Italian and Bahasa Indonesia.</p>
                    <p>&copy; ${new Date().getFullYear()} ImageArmor - All rights reserved</p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          
          logger.info({ 
            shopEmail: shop.email,
            messageId: emailResult?.messageId 
          }, "Notification email sent successfully");
        } else {
          logger.warn({ shopId: shopSettings.shopId }, "Could not send email notification - shop email not found");
        }
      } catch (error) {
        // Enhanced error handling
        const errorDetails = {
          message: error.message,
          stack: error.stack,
          shopId: shopSettings.shopId,
          errorName: error.name,
          errorCode: error.code
        };
        
        logger.error(errorDetails, "Error sending email notification");
        
        // Try to update the shop settings to indicate email failure if possible
        try {
          await api.shopSettings.update(shopSettings.id, {
            processStatus: {
              state: status,
              emailSent: false,
              emailError: error.message
            },
          });
        } catch (secondaryError) {
          logger.error({ error: secondaryError }, "Failed to update shop settings with email error information");
        }
      }
    }
  


export const params = {
  shopUrl: {
    type: "string"
  },
  status: {
    type: "string"
  },
  // status: {
  //   type: ""
  // },
};

export const options = { triggers: { api: true } }