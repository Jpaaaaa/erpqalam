export interface RefreshTokenRecord {
  userId: string;
  expiresAt: Date;
}

export interface RefreshTokenStore {
  save(userId: string, token: string, expiresAt: Date): Promise<void>;
  find(token: string): Promise<RefreshTokenRecord | null>;
  revoke(token: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

export const REFRESH_TOKEN_STORE = 'REFRESH_TOKEN_STORE';
