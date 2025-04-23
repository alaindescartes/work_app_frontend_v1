import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { StaffData } from "@/interfaces/staffINterface";

export interface UserState {
  userInfo: StaffData;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  userInfo: {
    staffId: 0,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "user",
    hireDate: "",
    status: "active",
    created_at: "",
    updated_at: "",
  },
  isLoggedIn: false,
};

export const AdminSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userSignIn: (state, action: PayloadAction<StaffData>) => {
      state.userInfo = action.payload;
      state.isLoggedIn = true;
    },
    userSignOut: (state) => {
      state.userInfo = {
        staffId: 0,
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "user",
        hireDate: "",
        status: "active",
        created_at: "",
        updated_at: "",
      };
      state.isLoggedIn = false;
    },
  },
});

export const { userSignIn, userSignOut } = AdminSlice.actions;

export default AdminSlice.reducer;
