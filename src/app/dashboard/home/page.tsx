'use client';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, store } from '@/redux/store';
import Overlay from '@/_componets/addons/Overlay';
import CustomizeHome from '@/_componets/addons/CustomizeHome';
import HomeScreen from '@/_componets/HomeScreen';
import { getSavedHome } from '@/lib/saveHomeToLocalStorage';
import { setGroupHomeClients, setGrouphomeInfo } from '@/redux/slices/groupHomeSlice';

function Page() {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedId = getSavedHome(); // null | number
    if (!savedId) return; // nothing to hydrate

    // if slice already has a home (e.g., user switched manually) skip
    if (store.getState().grouphome.grouphomeInfo.id) return;

    // fetch home info + residents, then dispatch
    (async () => {
      const [homeRes, resRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/get-grouphome/${savedId}`,
          { credentials: 'include', method: 'GET' }
        ), //find-residents
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/find-residents/${savedId}`,
          { credentials: 'include', method: 'GET' }
        ),
      ]);

      if (homeRes.ok && resRes.ok) {
        const home = await homeRes.json();
        const residents = await resRes.json();
        dispatch(setGrouphomeInfo(home.groupHome));
        dispatch(setGroupHomeClients(residents.residentsData));
      }
    })();
  }, [dispatch]);

  /* ------------- normal ready gate ------------- */
  const homeState = useSelector((s: RootState) => s.grouphome);
  const ready = homeState.grouphomeInfo.id !== 0 && homeState.residents.length !== 0;

  return ready ? (
    <HomeScreen />
  ) : (
    <Overlay brightness={0.8}>
      <CustomizeHome />
    </Overlay>
  );
}

export default Page;
