import axios from 'axios';
import apiClient from '../src/services/apiClient';
import { tokenService } from '../src/units/tokenServices';

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  const mockAxiosInstance: any = {
    create: jest.fn(() => mockAxiosInstance),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
    post: jest.fn(),
    get: jest.fn(),
  };

  return {
    ...actualAxios,
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(),
    get: jest.fn(),
  };
});

describe('Token Refresh Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies tokenService stores and retrieves access and refresh tokens', async () => {
    await tokenService.setTokens('access-token-123', 'refresh-token-456');

    const accessToken = await tokenService.getAccessToken();
    const refreshToken = await tokenService.getRefreshToken();

    expect(accessToken).toBe('access-token-123');
    expect(refreshToken).toBe('refresh-token-456');

    await tokenService.clearTokens();

    expect(await tokenService.getAccessToken()).toBeNull();
    expect(await tokenService.getRefreshToken()).toBeNull();
  });
});

