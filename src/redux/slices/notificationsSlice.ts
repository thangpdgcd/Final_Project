import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppNotification } from '@/features/notifications/types';
import { notificationsApi } from '@/features/notifications/notifications.api';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

type NotificationsState = {
  items: AppNotification[];
  status: Status;
  error: string | null;
  hydratedForUserId: number | null;
  lastReceivedAt: number;
};

const dedupeById = (items: AppNotification[]): AppNotification[] => {
  const map = new Map<string, AppNotification>();
  for (const it of items) map.set(it.id, it);
  return Array.from(map.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
};

const initialState: NotificationsState = {
  items: [],
  status: 'idle',
  error: null,
  hydratedForUserId: null,
  lastReceivedAt: 0,
};

export const fetchNotificationsThunk = createAsyncThunk<AppNotification[]>(
  'notifications/fetch',
  async () => {
    return await notificationsApi.fetch();
  },
);

export const markNotificationReadThunk = createAsyncThunk<string, string>(
  'notifications/markRead',
  async (id) => {
    await notificationsApi.markRead(id);
    return id;
  },
);

export const markAllNotificationsReadThunk = createAsyncThunk<void>(
  'notifications/markAllRead',
  async () => {
    await notificationsApi.markAllRead();
  },
);

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setHydratedForUserId: (state, action: PayloadAction<number | null>) => {
      state.hydratedForUserId = action.payload;
    },
    setNotifications: (state, action: PayloadAction<AppNotification[]>) => {
      state.items = dedupeById(action.payload);
      state.status = 'succeeded';
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      state.items = dedupeById([action.payload, ...state.items]);
      state.lastReceivedAt = Date.now();
    },
    markReadOptimistic: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.map((n) => (n.id === id ? { ...n, read: true } : n));
    },
    markAllReadOptimistic: (state) => {
      state.items = state.items.map((n) => ({ ...n, read: true }));
    },
    clearNotifications: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.hydratedForUserId = null;
      state.lastReceivedAt = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = dedupeById(action.payload);
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message ?? 'FETCH_NOTIFICATIONS_FAILED';
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.map((n) => (n.id === id ? { ...n, read: true } : n));
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true }));
      });
  },
});

export const {
  setHydratedForUserId,
  setNotifications,
  addNotification,
  markReadOptimistic,
  markAllReadOptimistic,
  clearNotifications,
} = notificationsSlice.actions;

export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.items.reduce((sum, n) => sum + (n.read ? 0 : 1), 0);

export default notificationsSlice.reducer;

