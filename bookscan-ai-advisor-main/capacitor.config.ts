
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a91b0ce369f74deaa25005c2c0f49277',
  appName: 'bookscan-ai-advisor',
  webDir: 'dist',
  server: {
    url: 'https://a91b0ce3-69f7-4dea-a250-05c2c0f49277.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BarcodeScanner: {
      cameraDirection: 'back'
    }
  }
};

export default config;
