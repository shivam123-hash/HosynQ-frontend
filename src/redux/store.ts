import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './features/mobileFlow/authSlice';
import emailAuthReducer from './features/emailFlow/authSlice';
import baseProfileReducer from './features/baseProfileSet/baseProfileSlice';
import familyReducer from './features/family/familySlice';
import lifeProfileReducer from './features/lifeProfile/lifeProfileSlice';
import medicineReducer from './features/medicine/medicineSlice';
import tasksReducer from './features/tasks/tasksSlice';
import { setStore } from './storeRegistry';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emailAuth: emailAuthReducer,
    baseProfile: baseProfileReducer,
    family: familyReducer,
    lifeProfile: lifeProfileReducer,
    medicine: medicineReducer,
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => {
  try {
    return useDispatch<AppDispatch>();
  } catch {
    return store.dispatch;
  }
};

export const useAppSelector: TypedUseSelectorHook<RootState> = (selector: any) => {
  try {
    return useSelector(selector);
  } catch {
    return selector(store.getState());
  }
};

export default store;

