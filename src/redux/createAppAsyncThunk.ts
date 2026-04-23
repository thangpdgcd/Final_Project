import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/redux/store';

/**
 * Project-wide asyncThunk helper with typed `state` and `dispatch`.
 * Add `rejectValue` typing later if you standardize API errors.
 */
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

