'use client';
import ClientList from '@/_componets/clients/ClientList';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGrouphomeInfo } from '@/redux/slices/groupHomeSlice';
import { RootState } from '@/redux/store';

export default function Page() {
  const params = useParams();
  const dispatch = useDispatch();
  const home = useSelector((state: RootState) => state.reducer.grouphome.grouphomeInfo);

  useEffect(() => {
    const getHome = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/get-grouphome/${params.homeId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          dispatch(setGrouphomeInfo(data.groupHome));
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error(e);
        }
        // TODO: send error to monitoring service in production
      }
    };
    getHome();
  }, [params.homeId, dispatch]);
  return (
    <div>
      <h1 className="text-3xl font-bold text-purple-700 mb-4 text-center p-6">{home.name}</h1>
      <ClientList />
    </div>
  );
}
