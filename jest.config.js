module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-native-google-signin|@react-native-async-storage|@react-native-vector-icons|react-native-responsive-fontsize|react-native-iphone-x-helper|react-native-image-crop-picker|@react-navigation|react-native-screens|react-redux|@reduxjs|immer)/)',
  ],
  moduleNameMapper: {
    '\\.(ttf|otf|png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
