import { afterEach, describe, expect, it } from 'vitest';
import { tokenStorage } from './tokenStorage';

afterEach(() => localStorage.clear());

describe('tokenStorage', () => {
  it('has no tokens until they are set', () => {
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it('stores and reads both tokens', () => {
    tokenStorage.setTokens('access-1', 'refresh-1');
    expect(tokenStorage.getAccessToken()).toBe('access-1');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-1');
  });

  it('setting again replaces them (refresh rotation)', () => {
    tokenStorage.setTokens('a1', 'r1');
    tokenStorage.setTokens('a2', 'r2');
    expect(tokenStorage.getAccessToken()).toBe('a2');
    expect(tokenStorage.getRefreshToken()).toBe('r2');
  });

  it('clear removes both, and only ours', () => {
    localStorage.setItem('unrelated', 'keep');
    tokenStorage.setTokens('a', 'r');
    tokenStorage.clear();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep');
  });
});
