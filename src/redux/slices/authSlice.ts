import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types/index';

type AuthState = {
  user: AuthUser | null;
  accessToken: string;
  isAuthenticated: boolean;
  hydrated: boolean;
};

const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
    return { user, accessToken: token, isAuthenticated: Boolean(token && user), hydrated: true };
  } catch {
    return { user: null, accessToken: '', isAuthenticated: false, hydrated: true };
  }
};

const initialState: AuthState = getInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ accessToken: string; user: AuthUser }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.hydrated = true;
    },
    clearSession: (state) => {
      state.user = null;
      state.accessToken = '';
      state.isAuthenticated = false;
      state.hydrated = true;
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
  },
});

export const { setSession, clearSession, setHydrated } = authSlice.actions;
export default authSlice.reducer;

