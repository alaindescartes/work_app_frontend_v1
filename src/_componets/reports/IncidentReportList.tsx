import { useEffect, useState } from 'react';
import IncidentReportSubList from './IncidentReportSubList';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';
import { ResidentFetch } from '@/interfaces/clientInterface';
import { IncidentReportFetch } from '@/interfaces/incidentReportInterface';
import { useRouter } from 'next/navigation';

export default function IncidentReportList() {
  const [groupHomes, setGroupHomes] = useState<GroupHomeFetch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [clients, setClients] = useState<ResidentFetch[]>([]);
  const [reports, setReports] = useState<IncidentReportFetch[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const router = useRouter();

  // Skeleton loader for homes
  const HomeSkeleton = () => <div className="h-14 bg-gray-200 rounded-md animate-pulse" />;

  //------------------get residents from a home-------------
  const getResidents = async (homeId: number) => {
    try {
      setLoading(true);
      const residentsData = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/find-residents/${homeId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (residentsData.ok) {
        const data = await residentsData.json();
        setClients(data.residentsData);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
        console.error('Error fetching clients...', message);
      }
      // TODO: send error to monitoring service in production
    } finally {
      setLoading(false);
    }
  };
  //-----------get reports by home-------------
  const getReports = async (homeId: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/get-reports/${homeId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
        console.error('Error fetching clients...', message);
      }
      // TODO: send error to monitoring service in production
    }
  };
  //--------------fetch group homes--------------
  useEffect(() => {
    const getHomes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/get-grouphomes`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setGroupHomes(data.groupHomes);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV === 'development') {
          console.error(message);
        }
        // TODO: send error to monitoring service in production
      } finally {
        setLoading(false);
      }
    };
    getHomes();
  }, []);

  // Fetch residents and reports whenever a new home is selected
  useEffect(() => {
    if (selectedHomeId !== null) {
      getResidents(selectedHomeId);
      getReports(selectedHomeId);
    } else {
      setClients([]);
    }
  }, [selectedHomeId]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Incident Reports</h1>
      <hr className="my-4" />
      {/* Home selector or skeleton */}
      {loading && groupHomes.length === 0 ? (
        <div className="space-y-3">
          <HomeSkeleton />
          <HomeSkeleton />
          <HomeSkeleton />
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <label htmlFor="home-select" className="block mb-1 font-medium">
            Select Group Home
          </label>
          <div className="relative">
            <select
              id="home-select"
              className="w-full appearance-none pr-8 rounded-md border-gray-300 focus:border-purple-600 focus:ring-purple-600 text-sm p-2"
              value={selectedHomeId ?? ''}
              disabled={loading}
              onChange={(e) => setSelectedHomeId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— choose a home —</option>
              {groupHomes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
              ▾
            </span>
          </div>
        </div>
      )}

      {/* Residents & reports */}
      {selectedHomeId && <IncidentReportSubList residents={clients} reports={reports} />}
    </div>
  );
}
