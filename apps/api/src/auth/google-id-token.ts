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
  androidClientIds: string[],
): Promise<GoogleOAuthProfile> {
  const audiences = androidClientIds.map((id) => id.trim()).filter(Boolean);
  if (audiences.length === 0) {
    throw new GoogleIdTokenError('invalid');
  }

  const client = new OAuth2Client();

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: audiences.length === 1 ? audiences[0] : audiences,
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
