import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "@/redux/slices/userSlice";

const rootPersistConfig = {
  key: "root",
  storage: storage,
  version: 1,
  whitelist: ["user"],
};

const rootReducer = combineReducers({
  user: userReducer,
});

export const persistedReducer = persistReducer(rootPersistConfig, rootReducer);
