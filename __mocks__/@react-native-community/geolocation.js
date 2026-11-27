module.exports = {
  requestAuthorization: jest.fn(),
  getCurrentPosition: jest.fn((success) =>
    success({
      coords: {
        latitude: 28.6139,
        longitude: 77.209,
      },
    })
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
};
