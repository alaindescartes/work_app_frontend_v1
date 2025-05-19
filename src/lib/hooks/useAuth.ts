import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

function useAuth() {
  const user = useSelector((state: RootState) => state.user.userInfo);
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  return { user, isLoggedIn };
}

export default useAuth;
