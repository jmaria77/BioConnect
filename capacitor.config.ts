import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bioconnect.app',
  appName: 'bioConnectApp',
  webDir: 'www',
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;
