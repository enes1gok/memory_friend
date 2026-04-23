/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'memory_friend',
  slug: 'memory_friend',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'memoryfriend',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#07070f',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.memoryfriend.app',
    infoPlist: {
      NSCameraUsageDescription:
        'memory_friend needs camera access to capture your journey.',
      NSMicrophoneUsageDescription:
        'memory_friend needs microphone access for voice journal entries.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#07070f',
    },
    package: 'com.memoryfriend.app',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-font',
    [
      'react-native-vision-camera',
      {
        cameraPermissionText:
          'memory_friend needs camera access to capture your journey.',
        microphonePermissionText:
          'memory_friend needs microphone access for voice journal entries.',
        enableCodeScanner: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: false,
  },
};
