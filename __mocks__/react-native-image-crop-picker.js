const ImagePicker = {
  openCamera: jest.fn(() => Promise.resolve({ path: 'mocked-camera-path.jpg' })),
  openPicker: jest.fn(() => Promise.resolve({ path: 'mocked-picker-path.jpg' })),
  clean: jest.fn(() => Promise.resolve()),
  cleanSingle: jest.fn(() => Promise.resolve()),
};

module.exports = ImagePicker;
module.exports.default = ImagePicker;

