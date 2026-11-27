const React = require('react');
const { View } = require('react-native');

module.exports = {
  Camera: (props) => React.createElement(View, props),
  CameraType: { Back: 'back', Front: 'front' },
  TorchMode: { Off: 'off', On: 'on' },
};
