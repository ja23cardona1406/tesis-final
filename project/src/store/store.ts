import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import farmReducer from './slices/farmSlice';
import cowReducer from './slices/cowSlice';
import recordReducer from './slices/recordSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    farm: farmReducer,
    cow: cowReducer,
    record: recordReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;