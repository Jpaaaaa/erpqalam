import { OAuth2Client } from 'google-auth-library';
import {
  GoogleIdTokenError,
  verifyGoogleAndroidIdToken,
} from './google-id-token';

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(),
}));

const MockOAuth2Client = OAuth2Client as jest.MockedClass<typeof OAuth2Client>;

describe('verifyGoogleAndroidIdToken', () => {
  const debugClientId =
    '668282267650-debug.apps.googleusercontent.com';
  const releaseClientId =
    '668282267650-release.apps.googleusercontent.com';
  let verifyIdToken: jest.Mock;

  beforeEach(() => {
    verifyIdToken = jest.fn();
    MockOAuth2Client.mockImplementation(
      () =>
        ({
          verifyIdToken,
        }) as unknown as OAuth2Client,
    );
  });

  it('returns profile when token is valid and email is verified', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'User@Example.com',
        email_verified: true,
        given_name: 'Jane',
        family_name: 'Doe',
        sub: 'google-sub-1',
      }),
    });

    await expect(
      verifyGoogleAndroidIdToken('token', [debugClientId]),
    ).resolves.toEqual({
      email: 'user@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      googleId: 'google-sub-1',
    });

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: 'token',
      audience: debugClientId,
    });
  });

  it('accepts any configured Android client ID as audience', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'user@example.com',
        email_verified: true,
        sub: 'google-sub-1',
      }),
    });

    await verifyGoogleAndroidIdToken('token', [
      debugClientId,
      releaseClientId,
    ]);

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: 'token',
      audience: [debugClientId, releaseClientId],
    });
  });

  it('rejects when email_verified is false', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'user@example.com',
        email_verified: false,
        sub: 'google-sub-1',
      }),
    });

    await expect(
      verifyGoogleAndroidIdToken('token', [debugClientId]),
    ).rejects.toMatchObject({ code: 'email_not_verified' });
  });

  it('rejects when email_verified is missing', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'user@example.com',
        sub: 'google-sub-1',
      }),
    });

    await expect(
      verifyGoogleAndroidIdToken('token', [debugClientId]),
    ).rejects.toMatchObject({ code: 'email_not_verified' });
  });

  it('rejects invalid signatures', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid token'));

    await expect(
      verifyGoogleAndroidIdToken('token', [debugClientId]),
    ).rejects.toBeInstanceOf(GoogleIdTokenError);
  });

  it('rejects empty client ID list', async () => {
    await expect(
      verifyGoogleAndroidIdToken('token', []),
    ).rejects.toMatchObject({ code: 'invalid' });
  });
});
