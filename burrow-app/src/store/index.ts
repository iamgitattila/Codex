import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import assetsReducer from './slices/assetsSlice';
import locationsReducer from './slices/locationsSlice';
import kitsReducer from './slices/kitsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [], // We don't persist Redux state since data is in SQLite
};

const rootReducer = combineReducers({
  assets: assetsReducer,
  locations: locationsReducer,
  kits: kitsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
