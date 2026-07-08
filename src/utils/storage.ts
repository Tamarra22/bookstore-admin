// Wrapping localStorage in one module means if we ever change how the token
// is persisted (e.g. to a cookie), only this file changes.
const TOKEN_KEY = 'auth_token';

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clearToken: (): void => localStorage.removeItem(TOKEN_KEY),
};
