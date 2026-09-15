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
  const androidClientId =
    '668282267650-test.apps.googleusercontent.com';
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
      verifyGoogleAndroidIdToken('token', androidClientId),
    ).resolves.toEqual({
      email: 'user@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      googleId: 'google-sub-1',
    });

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: 'token',
      audience: androidClientId,
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
      verifyGoogleAndroidIdToken('token', androidClientId),
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
      verifyGoogleAndroidIdToken('token', androidClientId),
    ).rejects.toMatchObject({ code: 'email_not_verified' });
  });

  it('rejects invalid signatures', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid token'));

    await expect(
      verifyGoogleAndroidIdToken('token', androidClientId),
    ).rejects.toBeInstanceOf(GoogleIdTokenError);
  });
});
