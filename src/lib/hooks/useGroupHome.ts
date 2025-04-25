import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export const useGroupHome = () => {
  const groupHome = useSelector((state: RootState) => state.reducer.grouphome.grouphomeInfo);
  return { groupHome };
};
