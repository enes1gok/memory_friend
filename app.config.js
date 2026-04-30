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
    buildNumber: '1',
    config: {
      usesNonExemptEncryption: false,
    },
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
    versionCode: 1,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.POST_NOTIFICATIONS',
    ],
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    './plugins/withAndroidMavenRepos.js',
    './plugins/withFfmpegKitIosMirrorPod.js',
    'expo-dev-client',
    [
      'expo-system-ui',
      {
        userInterfaceStyle: 'dark',
      },
    ],
    'expo-font',
    '@react-native-community/datetimepicker',
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
