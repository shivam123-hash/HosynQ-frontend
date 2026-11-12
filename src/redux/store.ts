import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './features/mobileFlow/authSlice';
import emailAuthReducer from './features/emailFlow/authSlice';
import baseProfileReducer from './features/baseProfileSet/baseProfileSlice';
import familyReducer from './features/family/familySlice';
import { setStore } from './storeRegistry';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emailAuth: emailAuthReducer,
    baseProfile: baseProfileReducer,
    family: familyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;

