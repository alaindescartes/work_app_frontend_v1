import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';
import { ResidentFetch } from '@/interfaces/clientInterface';

interface GroupHomeState {
  grouphomeInfo: GroupHomeFetch;
  residents: ResidentFetch[];
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
  residents: [],
};

export const GrouphomeSlice = createSlice({
  name: 'grouphome',
  initialState,
  reducers: {
    setGrouphomeInfo: (state, action: PayloadAction<GroupHomeFetch>) => {
      state.grouphomeInfo = action.payload;
    },
    setGroupHomeClients: (state, action: PayloadAction<ResidentFetch[]>) => {
      state.residents = action.payload;
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
      state.residents = [];
    },
  },
});

export const { setGrouphomeInfo, resetGrouphomeInfo, setGroupHomeClients } = GrouphomeSlice.actions;

export default GrouphomeSlice.reducer;
