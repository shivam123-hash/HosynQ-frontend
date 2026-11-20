import {
  signInWithApple,
  isAppleAuthSupported,
  checkAppleCredentialState,
} from '../src/services/appleAuthService';
import { appleAuth } from '@invertase/react-native-apple-authentication';

describe('appleAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks if apple auth is supported', () => {
    expect(isAppleAuthSupported()).toBe(true);
  });

  it('signs in with Apple successfully and formats user info', async () => {
    const result = await signInWithApple();

    expect(appleAuth.performRequest).toHaveBeenCalledWith({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    expect(appleAuth.getCredentialStateForUser).toHaveBeenCalledWith(
      'mock-apple-user-id-12345',
    );

    expect(result.success).toBe(true);
    expect(result.user).toEqual({
      id: 'mock-apple-user-id-12345',
      email: 'priya.apple@privaterelay.appleid.com',
      name: 'Priya Sharma',
      givenName: 'Priya',
      familyName: 'Sharma',
    });
    expect(result.identityToken).toBe('mock-apple-identity-token');
    expect(result.authorizationCode).toBe('mock-apple-auth-code');
  });

  it('handles user cancellation gracefully', async () => {
    (appleAuth.performRequest as jest.Mock).mockRejectedValueOnce({
      code: appleAuth.Error.CANCELED,
      message: 'User cancelled',
    });

    const result = await signInWithApple();

    expect(result.success).toBe(false);
    expect(result.cancelled).toBe(true);
  });

  it('handles general errors gracefully', async () => {
    (appleAuth.performRequest as jest.Mock).mockRejectedValueOnce(
      new Error('Apple service unavailable'),
    );

    const result = await signInWithApple();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Apple service unavailable');
  });

  it('checks Apple credential state', async () => {
    const state = await checkAppleCredentialState('test-user-id');
    expect(state).toBe(appleAuth.State.AUTHORIZED);
    expect(appleAuth.getCredentialStateForUser).toHaveBeenCalledWith('test-user-id');
  });
});

