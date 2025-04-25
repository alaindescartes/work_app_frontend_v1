import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';

export interface GroupHomeState {
  grouphomeInfo: GroupHomeFetch;
}

const initialState: GroupHomeState = {
  grouphomeInfo: {
    name: '',
    address: '',
    phone: '',
    image_url: '',
    status: '',
    managerName: '',
    supervisorName: '',
    type: '',
    notes: '',
    id: 0,
    createdAt: new Date().toISOString(),
  },
};

export const GrouphomeSlice = createSlice({
  name: 'grouphome',
  initialState,
  reducers: {
    setGrouphomeInfo: (state, action: PayloadAction<GroupHomeFetch>) => {
      state.grouphomeInfo = action.payload;
    },
    resetGrouphomeInfo: (state) => {
      state.grouphomeInfo = {
        name: '',
        address: '',
        phone: '',
        image_url: '',
        status: '',
        managerName: '',
        supervisorName: '',
        type: '',
        notes: '',
        id: 0,
        createdAt: new Date().toISOString(),
      };
    },
  },
});

export const { setGrouphomeInfo, resetGrouphomeInfo } = GrouphomeSlice.actions;

export default GrouphomeSlice.reducer;
