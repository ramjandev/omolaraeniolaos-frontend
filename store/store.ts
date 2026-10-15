import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { baseAPI } from "./BaseApi/baseAPI";
import authReducer from "./Auth/authSlice";
import eventReducer from "./eventSlice/eventSlice";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : {
        getItem() {
          return Promise.resolve(null);
        },
        setItem(_key: string, value: string) {
          return Promise.resolve(value);
        },
        removeItem() {
          return Promise.resolve();
        },
      };

const persistedEventReducer = persistReducer(
  { key: "mcenies-event-wizard", storage },
  eventReducer,
);

export const store = configureStore({
  reducer: {
    [baseAPI.reducerPath]: baseAPI.reducer,
    auth: authReducer,
    event: persistedEventReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseAPI.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
