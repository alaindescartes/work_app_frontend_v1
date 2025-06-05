import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from '@/redux/slices/userSlice';
import groupHomeReducer from '@/redux/slices/groupHomeSlice';
import { schedulesApi } from '@/redux/slices/scheduleSlice';
import { financeApi } from '@/redux/slices/financeSlice';

const rootPersistConfig = {
  key: 'root',
  storage: storage,
  version: 1,
  whitelist: ['user'],
};

const rootReducer = combineReducers({
  user: userReducer,
  grouphome: groupHomeReducer,
  [schedulesApi.reducerPath]: schedulesApi.reducer,
  [financeApi.reducerPath]: financeApi.reducer,
});

export const persistedReducer = persistReducer(rootPersistConfig, rootReducer);
