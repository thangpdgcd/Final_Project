import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AddToCartPayload, CartItem } from '@/types/index';
import { cartService } from '@/services/cart/cart.service';

type CartStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type CartState = {
  itemsByUserId: Record<number, CartItem[]>;
  statusByUserId: Record<number, CartStatus>;
  errorByUserId: Record<number, string | null>;
};

const initialState: CartState = {
  itemsByUserId: {},
  statusByUserId: {},
  errorByUserId: {},
};

export const fetchCartByUserId = createAsyncThunk<CartItem[], number>(
  'cart/fetchByUserId',
  async (userId) => {
    return await cartService.getByUserId(userId);
  },
);

export const addToCartThunk = createAsyncThunk<
  { userId: number; added?: CartItem; items?: CartItem[] },
  AddToCartPayload
>('cart/addToCart', async (payload) => {
  const userId = Number(payload.user_ID);
  const res = await cartService.addToCart(payload);
  // Refresh cart so UI always matches DB (backend builds orders from server cart).
  const items = await cartService.getByUserId(userId);
  return { userId, added: res?.data, items };
});

export const updateCartItemThunk = createAsyncThunk<
  { userId: number; items: CartItem[] },
  { userId: number; id: number; quantity: number }
>('cart/updateItem', async ({ userId, id, quantity }) => {
  await cartService.updateItem(id, quantity);
  const items = await cartService.getByUserId(userId);
  return { userId, items };
});

export const removeCartItemThunk = createAsyncThunk<
  { userId: number; removedId: number; items: CartItem[] },
  { userId: number; id: number }
>('cart/removeItem', async ({ userId, id }) => {
  await cartService.removeItem(id);
  const items = await cartService.getByUserId(userId);
  return { userId, removedId: id, items };
});

const setUserStatus = (state: CartState, userId: number, status: CartStatus) => {
  state.statusByUserId[userId] = status;
  if (status !== 'failed') state.errorByUserId[userId] = null;
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartForUser: (state, action: PayloadAction<{ userId: number; items: CartItem[] }>) => {
      state.itemsByUserId[action.payload.userId] = action.payload.items;
    },
    clearCartForUser: (state, action: PayloadAction<number>) => {
      const userId = action.payload;
      delete state.itemsByUserId[userId];
      delete state.statusByUserId[userId];
      delete state.errorByUserId[userId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartByUserId.pending, (state, action) => {
        setUserStatus(state, action.meta.arg, 'loading');
      })
      .addCase(fetchCartByUserId.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        state.itemsByUserId[userId] = action.payload;
        setUserStatus(state, userId, 'succeeded');
      })
      .addCase(fetchCartByUserId.rejected, (state, action) => {
        const userId = action.meta.arg;
        setUserStatus(state, userId, 'failed');
        state.errorByUserId[userId] = action.error?.message ?? 'FETCH_CART_FAILED';
      })
      .addCase(addToCartThunk.pending, (state, action) => {
        const userId = Number(action.meta.arg.user_ID);
        if (Number.isFinite(userId) && userId > 0) setUserStatus(state, userId, 'loading');
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        const { userId, items } = action.payload;
        if (items) state.itemsByUserId[userId] = items;
        setUserStatus(state, userId, 'succeeded');
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        const userId = Number(action.meta.arg.user_ID);
        if (!Number.isFinite(userId) || userId <= 0) return;
        setUserStatus(state, userId, 'failed');
        state.errorByUserId[userId] = action.error?.message ?? 'ADD_TO_CART_FAILED';
      })
      .addCase(updateCartItemThunk.pending, (state, action) => {
        setUserStatus(state, action.meta.arg.userId, 'loading');
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.itemsByUserId[action.payload.userId] = action.payload.items;
        setUserStatus(state, action.payload.userId, 'succeeded');
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        const userId = action.meta.arg.userId;
        setUserStatus(state, userId, 'failed');
        state.errorByUserId[userId] = action.error?.message ?? 'UPDATE_CART_ITEM_FAILED';
      })
      .addCase(removeCartItemThunk.pending, (state, action) => {
        setUserStatus(state, action.meta.arg.userId, 'loading');
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        state.itemsByUserId[action.payload.userId] = action.payload.items;
        setUserStatus(state, action.payload.userId, 'succeeded');
      })
      .addCase(removeCartItemThunk.rejected, (state, action) => {
        const userId = action.meta.arg.userId;
        setUserStatus(state, userId, 'failed');
        state.errorByUserId[userId] = action.error?.message ?? 'REMOVE_CART_ITEM_FAILED';
      });
  },
});

export const { setCartForUser, clearCartForUser } = cartSlice.actions;
export default cartSlice.reducer;

