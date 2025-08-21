import { MantleClient } from '@heymantle/client';

export function mantleForApp() {
  return new MantleClient({
    appId: process.env.MANTLE_APP_ID,
    apiKey: process.env.MANTLE_API_KEY,
  });
}
