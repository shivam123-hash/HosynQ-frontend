const storage = {};

const mockAsyncStorage = {
  getItem: jest.fn(async (key) => storage[key] || null),
  setItem: jest.fn(async (key, value) => {
    storage[key] = value;
  }),
  removeItem: jest.fn(async (key) => {
    delete storage[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  }),
  getAllKeys: jest.fn(async () => Object.keys(storage)),
};

module.exports = mockAsyncStorage;
module.exports.default = mockAsyncStorage;
