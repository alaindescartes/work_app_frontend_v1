'use client';
import React from 'react';
import Overlay from '@/_componets/addons/Overlay';
import CustomizeHome from '@/_componets/addons/CustomizeHome';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import HomeScreen from '@/_componets/HomeScreen';

function Page() {
  const homeState = useSelector((state: RootState) => state.grouphome);
  const ready =
    homeState.grouphomeInfo.id !== 0 && // id is safer than name !== ''
    homeState.residents.length !== 0; // boolean you set after fetch
  return (
    <>
      {ready ? (
        <HomeScreen />
      ) : (
        <Overlay brightness={0.8}>
          <CustomizeHome />
        </Overlay>
      )}
    </>
  );
}

export default Page;
