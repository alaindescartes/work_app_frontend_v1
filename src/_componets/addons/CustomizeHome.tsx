'use client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import WelcomeSplash from '@/_componets/addons/WelcomeSplash';
import { useEffect, useState, useMemo } from 'react';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';
import { Button } from '@/components/ui/button';
import { ResidentFetch } from '@/interfaces/clientInterface';
import { setGroupHomeClients, setGrouphomeInfo } from '@/redux/slices/groupHomeSlice';
import { saveCurrentHome } from '@/lib/saveHomeToLocalStorage';

export default function CustomizeHome() {
  const currentStaff = useSelector((state: RootState) => state.user.userInfo);
  const splashElement = useMemo(
    () => <WelcomeSplash userFirstName={currentStaff.firstName} />,
    [currentStaff.firstName]
  );
  const [homes, setHomes] = useState<GroupHomeFetch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedHome, setSelectedHome] = useState<number | ''>('');
  const [residents, setResidents] = useState<ResidentFetch[]>([]);
  const dispatch = useDispatch();
  useEffect(() => {
    const getHomes = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/get-grouphomes`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (res.ok) {
          const data = await res.json();
          setHomes(data.groupHomes);
        }
      } catch (e: unknown) {
        if (process.env.NODE_ENV !== 'production') console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    getHomes();
  }, []);

  const getResidents = async (homeId: number) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/find-residents/${homeId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (res.ok) {
        const data = await res.json();
        setResidents(data.residentsData);
      }
    } catch (e: unknown) {
      if (process.env.NODE_ENV !== 'production') console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHome !== '') {
      getResidents(selectedHome);
      saveCurrentHome(Number(selectedHome), currentStaff.staffId);
    }
  }, [selectedHome]);

  const applyHomeSelection = async () => {
    if (!selectedHome) return;
    /* ensure residents list is fresh before dispatching */
    await getResidents(Number(selectedHome));

    const groupHome = homes.find((h) => h.id === selectedHome);
    if (!groupHome) return;

    dispatch(setGrouphomeInfo(groupHome));
    dispatch(setGroupHomeClients(residents));
  };
  return (
    <div>
      {/*greeting for staff*/}
      <div>{splashElement}</div>
      {/*  home selection*/}
      <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-4 rounded-lg border border-purple-500 bg-gray-900/60 p-6 shadow-lg backdrop-blur-sm">
        {isLoading && <p className="text-center text-sm text-gray-300">Loading…</p>}
        {!isLoading && !homes.length && (
          <p className="text-center text-sm text-red-300">No homes assigned to your account.</p>
        )}
        <select
          value={selectedHome || ''}
          onChange={(e) => setSelectedHome(Number(e.target.value))}
          className="w-full rounded-md border border-purple-400 bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-inner
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="" disabled>
            Choose your group home…
          </option>
          {homes.map((home) => (
            <option key={home.id} value={home.id}>
              {home.name}
            </option>
          ))}
        </select>

        <Button
          disabled={!selectedHome || isLoading}
          className="w-full rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-500 cursor-pointer"
          onClick={applyHomeSelection}
        >
          Jump&nbsp;In
        </Button>
      </div>
    </div>
  );
}
