'use client';
import ClientList from '@/_componets/clients/ClientList';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGrouphomeInfo } from '@/redux/slices/groupHomeSlice';
import { RootState } from '@/redux/store';
import { ResidentFetch } from '@/interfaces/clientInterface';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';
import { useGroupHome } from '@/lib/hooks/useGroupHome';

export default function Page() {
  const params = useParams();
  const dispatch = useDispatch();
  const home = useSelector((state: RootState) => state.reducer.grouphome.grouphomeInfo);
  const [clients, setClients] = useState<ResidentFetch[]>([]);

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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const residentsData = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/find-residents/${params.homeId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (residentsData.ok) {
          const data = await residentsData.json();
          setClients(data.residentsData);
          console.log(data);
        }
      } catch (e: any) {
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.error('Error fetching clients...', e.message);
        }
        // TODO: send error to monitoring service in production
      }
    };
    fetchClients();
  }, [params.homeId]);
  return (
    <div>
      <h1 className="text-3xl font-bold text-purple-700 mb-4 text-center p-6">{home.name}</h1>
      <ClientList clientArray={clients} />
    </div>
  );
}
