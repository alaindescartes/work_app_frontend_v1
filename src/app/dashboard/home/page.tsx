'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, store } from '@/redux/store';
import Overlay from '@/_componets/addons/Overlay';
import CustomizeHome from '@/_componets/addons/CustomizeHome';
import HomeScreen from '@/_componets/HomeScreen';
import { getSavedHome } from '@/lib/saveHomeToLocalStorage';
import {
  resetGrouphomeInfo,
  setGroupHomeClients,
  setGrouphomeInfo,
} from '@/redux/slices/groupHomeSlice';
import Loading from '@/_componets/addons/Loading';

function Page() {
  const dispatch = useDispatch();
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    const savedId = getSavedHome(); // null | number
    if (!savedId) {
      setHydrating(false); // no saved home, done hydrating
      return; // nothing to hydrate
    }

    // If a home is already in Redux (e.g., you just came back from Home 11),
    // skip the fetch **and** clear the spinner.
    if (store.getState().grouphome.grouphomeInfo.id) {
      setHydrating(false);
      return;
    }

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
      setHydrating(false);
    })();
  }, [dispatch]);

  /* ------------- normal ready gate ------------- */
  const homeState = useSelector((s: RootState) => s.grouphome);
  const ready = homeState.grouphomeInfo.id !== 0 && homeState.residents.length !== 0;

  if (hydrating) return <Loading />; // prevent initial overlay flash

  return ready ? (
    <HomeScreen />
  ) : (
    <Overlay brightness={0.8}>
      <CustomizeHome />
    </Overlay>
  );
}

export default Page;
