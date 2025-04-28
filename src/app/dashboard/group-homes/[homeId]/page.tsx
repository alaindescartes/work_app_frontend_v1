'use client';
import ClientList from '@/_componets/clients/ClientList';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetGrouphomeInfo,
  setGroupHomeClients,
  setGrouphomeInfo,
} from '@/redux/slices/groupHomeSlice';
import { RootState } from '@/redux/store';
import { ResidentFetch } from '@/interfaces/clientInterface';
import { Button } from '@/components/ui/button';
import useAuth from '@/lib/hooks/useAuth';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';

export default function Page() {
  const params = useParams();
  const dispatch = useDispatch();
  const home = useSelector((state: RootState) => state.reducer.grouphome.grouphomeInfo);
  const [clients, setClients] = useState<ResidentFetch[]>([]);
  const role = useAuth().user.role;
  const [adminView, setAdminView] = useState<boolean>(false);

  useEffect(() => {
    dispatch(resetGrouphomeInfo());
  }, [params.homeId, dispatch]);

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
          dispatch(setGroupHomeClients(data.residentsData));
        }
      } catch (e: any) {
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.error('Error fetching clients...', e.message);
        }
        // TODO: send error to monitoring service in production
      }
    };
    fetchClients();
  }, [params.homeId, dispatch]);

  return (
    <div className="p-6">
      <button
        onClick={() => window.history.back()}
        className="text-purple-700 hover:text-purple-900 flex items-center mb-4"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold text-purple-700 mb-4 text-center">{home?.name}</h1>
      <div className="flex justify-center">
        {role === 'admin' && (
          <Link href={`/dashboard/client/new/${params.homeId}`}>
            <Button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md mb-3 cursor-pointer">
              <FaPlus className="w-4 h-4" />
              Add New Client
            </Button>
          </Link>
        )}
      </div>
      <ClientList clientArray={clients} />
    </div>
  );
}
