import type { RootState } from '@/redux/store';

export const selectAuth = (s: RootState) => s.auth;
export const selectAuthUser = (s: RootState) => s.auth.user;
export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated;
export const selectAuthHydrated = (s: RootState) => s.auth.hydrated;
export const selectAccessToken = (s: RootState) => s.auth.accessToken;

