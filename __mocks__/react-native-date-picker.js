const React = require('react');
const { View } = require('react-native');

const DatePicker = (props) => {
  return React.createElement(View, { testID: 'mock-date-picker', ...props });
};

module.exports = DatePicker;
module.exports.default = DatePicker;

