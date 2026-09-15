import { OAuth2Client } from 'google-auth-library';
import { GoogleOAuthProfile } from './interfaces/google-profile.interface';

export class GoogleIdTokenError extends Error {
  constructor(readonly code: 'invalid' | 'email_not_verified' | 'missing_email') {
    super(code);
    this.name = 'GoogleIdTokenError';
  }
}

export async function verifyGoogleAndroidIdToken(
  idToken: string,
  androidClientId: string,
): Promise<GoogleOAuthProfile> {
  const client = new OAuth2Client(androidClientId);

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: androidClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new GoogleIdTokenError('invalid');
  }

  if (!payload?.email) {
    throw new GoogleIdTokenError('missing_email');
  }

  if (payload.email_verified !== true) {
    throw new GoogleIdTokenError('email_not_verified');
  }

  return {
    email: payload.email.toLowerCase(),
    firstName: payload.given_name ?? '',
    lastName: payload.family_name ?? '',
    googleId: payload.sub ?? '',
  };
}
