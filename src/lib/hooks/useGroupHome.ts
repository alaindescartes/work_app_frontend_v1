import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export const useGroupHome = () => {
  return useSelector((state: RootState) => state.reducer.grouphome.grouphomeInfo);
};
