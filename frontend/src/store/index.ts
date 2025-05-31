import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import droneReducer from './slices/droneSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    drones: droneReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
