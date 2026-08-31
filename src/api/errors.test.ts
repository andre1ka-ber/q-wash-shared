import { describe, expect, it } from 'vitest';
import { ApiError, messageForCode } from './errors';

describe('messageForCode', () => {
  it('returns the mapped Russian message for a known code', () => {
    expect(messageForCode('invalid_credentials', 'fallback')).toBe('Неверный логин или пароль');
  });

  it('returns the fallback for an unmapped code', () => {
    expect(messageForCode('some_unmapped_code', 'fallback message')).toBe('fallback message');
  });
});

describe('ApiError', () => {
  it('carries code, message, and status', () => {
    const err = new ApiError('forbidden', 'Недостаточно прав для этого действия', 403);
    expect(err.code).toBe('forbidden');
    expect(err.message).toBe('Недостаточно прав для этого действия');
    expect(err.status).toBe(403);
    expect(err.name).toBe('ApiError');
    expect(err).toBeInstanceOf(Error);
  });
});
