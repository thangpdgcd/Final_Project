import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CreateOrderPayload, Order } from '@/types/index';
import { ordersService } from '@/services/orders/orders.service';

type OrdersStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type OrdersState = {
  items: Order[];
  status: OrdersStatus;
  error: string | null;
  creating: boolean;
  createError: string | null;
  lastCreatedOrderId: number | null;
};

const initialState: OrdersState = {
  items: [],
  status: 'idle',
  error: null,
  creating: false,
  createError: null,
  lastCreatedOrderId: null,
};

export const fetchOrdersThunk = createAsyncThunk<Order[]>('orders/fetchAll', async () => {
  return await ordersService.getAll();
});

export const createOrderThunk = createAsyncThunk<Order, CreateOrderPayload>(
  'orders/create',
  async (payload) => {
    return await ordersService.create(payload);
  },
);

const parseOrderId = (o: unknown): number | null => {
  if (!o || typeof o !== 'object') return null;
  const obj = o as any;
  const id = Number(
    obj.order_ID ?? obj.orderId ?? obj.id ?? obj?.data?.order_ID ?? obj?.data?.orderId ?? obj?.data?.id,
  );
  return Number.isFinite(id) && id > 0 ? id : null;
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
    },
    clearOrders: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
    clearCreateState: (state) => {
      state.creating = false;
      state.createError = null;
      state.lastCreatedOrderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message ?? 'FETCH_ORDERS_FAILED';
      })
      .addCase(createOrderThunk.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.creating = false;
        const createdId = parseOrderId(action.payload);
        state.lastCreatedOrderId = createdId;
        // Best-effort: keep list in sync without forcing a refetch.
        // If server returns only partial order, UI can refetch later.
        state.items = [action.payload, ...state.items];
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.error?.message ?? 'CREATE_ORDER_FAILED';
      });
  },
});

export const { setOrders, clearOrders, clearCreateState } = ordersSlice.actions;
export default ordersSlice.reducer;

