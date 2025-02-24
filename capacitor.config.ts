import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {

  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "775859610688-ttbj6hmihbfuid1ahvskg4fd0tu4epen.apps.googleusercontent.com",
      forceCodeForRefreshToken: false
    }
  },

  appId: 'nomadamuebles-c2c81',
  appName: 'NomadaMuebles',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000'
    }
  }
};

export default config;
