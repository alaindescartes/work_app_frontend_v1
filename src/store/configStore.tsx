import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from '@/redux/slices/userSlice';
import groupHomeReducer from '@/redux/slices/groupHomeSlice';

const rootPersistConfig = {
  key: 'root',
  storage: storage,
  version: 1,
  whitelist: ['user'],
};

const rootReducer = combineReducers({
  user: userReducer,
  grouphome: groupHomeReducer,
});

export const persistedReducer = persistReducer(rootPersistConfig, rootReducer);
