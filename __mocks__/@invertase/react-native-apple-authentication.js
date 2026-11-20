const appleAuth = {
  isSupported: true,
  isSignUpButtonSupported: true,
  performRequest: jest.fn(() =>
    Promise.resolve({
      user: 'mock-apple-user-id-12345',
      email: 'priya.apple@privaterelay.appleid.com',
      fullName: {
        givenName: 'Priya',
        familyName: 'Sharma',
      },
      identityToken: 'mock-apple-identity-token',
      authorizationCode: 'mock-apple-auth-code',
      realUserStatus: 2,
    }),
  ),
  getCredentialStateForUser: jest.fn(() => Promise.resolve(1)), // 1 = AUTHORIZED
  onCredentialRevoked: jest.fn(() => () => {}),
  Operation: {
    LOGIN: 1,
    REFRESH: 2,
    LOGOUT: 3,
    VERIFY: 4,
  },
  Scope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
  State: {
    REVOKED: 0,
    AUTHORIZED: 1,
    NOT_FOUND: 2,
    TRANSFERRED: 3,
  },
  Error: {
    UNKNOWN: '1000',
    CANCELED: '1001',
    INVALID_RESPONSE: '1002',
    NOT_HANDLED: '1003',
    FAILED: '1004',
    NOT_INTERACTIVE: '1005',
  },
};

const AppleButton = () => null;

module.exports = {
  appleAuth,
  AppleButton,
  default: appleAuth,
};

