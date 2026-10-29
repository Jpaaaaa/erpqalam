const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const isLocalRelease = process.env.LOCAL_RELEASE_APK === '1';
  const expo = { ...appJson.expo };

  expo.plugins = [
    ...(appJson.expo.plugins ?? []),
    '@react-native-community/datetimepicker',
    './plugins/withReleaseSigning',
    'expo-sharing',
  ];

  if (isLocalRelease) {
    expo.updates = {
      enabled: false,
      checkAutomatically: 'ON_ERROR_RECOVERY',
    };
  }

  return { expo };
};
