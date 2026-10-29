import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

@Injectable()
export class LoginRateLimitService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async check(identifierKey: string): Promise<void> {
    const key = `login-attempts:${identifierKey}`;
    const raw = await this.cache.get<number>(key);
    const attempts = raw ?? 0;

    if (attempts >= MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordFailure(identifierKey: string): Promise<void> {
    const key = `login-attempts:${identifierKey}`;
    const raw = await this.cache.get<number>(key);
    const attempts = (raw ?? 0) + 1;
    await this.cache.set(key, attempts, WINDOW_MS);
  }

  async clear(identifierKey: string): Promise<void> {
    await this.cache.del(`login-attempts:${identifierKey}`);
  }
}
