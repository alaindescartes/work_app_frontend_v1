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
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/_componets/tasks/TaskList';
import { ScheduleWrapper } from '@/_componets/schedules/ScheduleWrapper';
import IncidentReportForm from '@/_componets/forms/IncidentReportForm';

type TabKey = 'clients' | 'other' | 'client-schedule' | 'logs' | 'reports';

export default function Page() {
  const params = useParams();
  const dispatch = useDispatch();
  const home = useSelector((state: RootState) => state.grouphome.grouphomeInfo);
  const [clients, setClients] = useState<ResidentFetch[]>([]);
  const role = useAuth().user.role;
  //const [adminView, setAdminView] = useState<boolean>(false);
  const [ClientIdToDelete, setClientIdToDelete] = useState<string | null>(null);
  const [isUnsavedChanges, setIsUnsavedChanges] = useState<boolean>(false);

  const handleUnsavedChanges = (unsaved: boolean) => {
    setIsUnsavedChanges(unsaved);
  };

  const [activeTab, setActiveTab] = useState<TabKey>('clients');

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
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.error('Error fetching clients...', message);
        }
        // TODO: send error to monitoring service in production
      }
    };
    fetchClients();
  }, [params.homeId, dispatch]);

  // function that handles deletion of a client
  const handleDeleteClient = async (id: string) => {
    try {
      setClientIdToDelete(id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/delete-resident/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        toast('error deleting client...', {
          style: {
            backgroundColor: 'red',
            color: 'white',
          },
        });
        return;
      }
      const data = await response.json();
      const filteredClients = clients.filter(client => client.id !== data.resident.id);
      setClients(filteredClients);

      //update client redux
      dispatch(setGroupHomeClients(filteredClients));
      toast('Client deleted successfully.', {
        style: {
          backgroundColor: 'green',
          color: 'white',
        },
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
        console.error('Error deleting client...', message);
      }
      // TODO: send error to monitoring service in production
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6">
      <button
        onClick={() => window.history.back()}
        className="text-purple-700 hover:text-purple-900 flex items-center mb-4 text-sm sm:text-base"
      >
        ← Back
      </button>
      <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-4 text-center break-words">
        {home?.name}
      </h1>
      <div className="flex justify-center">
        {role === 'admin' && (
          <Link href={`/dashboard/client/new/${params.homeId}`}>
            <Button className="w-full sm:w-auto flex items-center gap-2 bg-purple-500 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md mb-3 cursor-pointer">
              <FaPlus className="w-4 h-4" />
              Add New Client
            </Button>
          </Link>
        )}
      </div>

      {/* tab for client list */}
      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={value => {
          if (isUnsavedChanges && value !== activeTab) {
            toast('You have unsaved changes. Save or discard them before switching tabs.', {
              style: { backgroundColor: 'orange', color: 'white' },
            });
            return;
          }
          setActiveTab(value as TabKey);
        }}
      >
        <TabsList className="relative z-10 bg-gray-100 rounded-lg p-1 flex flex-wrap gap-2 mb-14 justify-start sm:justify-center">
          <TabsTrigger
            value="clients"
            className="whitespace-nowrap text-sm sm:text-base flex-1 sm:flex-none px-6 py-2 rounded-md border border-gray-300 bg-white data-[state=active]:!bg-purple-700 data-[state=active]:!text-white data-[state=active]:border-purple-700 text-gray-700 hover:bg-purple-200 transition-all"
          >
            Clients
          </TabsTrigger>
          <TabsTrigger
            value="other"
            className="whitespace-nowrap text-sm sm:text-base flex-1 sm:flex-none px-6 py-2 rounded-md border border-gray-300 bg-white data-[state=active]:!bg-purple-700 data-[state=active]:!text-white data-[state=active]:border-purple-700 text-gray-700 hover:bg-purple-200 transition-all"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="client-schedule"
            className="whitespace-nowrap text-sm sm:text-base flex-1 sm:flex-none px-6 py-2 rounded-md border border-gray-300 bg-white data-[state=active]:!bg-purple-700 data-[state=active]:!text-white data-[state=active]:border-purple-700 text-gray-700 hover:bg-purple-200 transition-all"
          >
            Monthly Client Schedule
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="whitespace-nowrap text-sm sm:text-base flex-1 sm:flex-none px-6 py-2 rounded-md border border-gray-300 bg-white data-[state=active]:!bg-purple-700 data-[state=active]:!text-white data-[state=active]:border-purple-700 text-gray-700 hover:bg-purple-200 transition-all"
          >
            Shift Logs
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="whitespace-nowrap text-sm sm:text-base flex-1 sm:flex-none px-6 py-2 rounded-md border border-gray-300 bg-white data-[state=active]:!bg-purple-700 data-[state=active]:!text-white data-[state=active]:border-purple-700 text-gray-700 hover:bg-purple-200 transition-all"
          >
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clients" className="mt-4 z-0">
          <div className="w-full">
            <ClientList
              clientArray={clients}
              onDeleteClient={handleDeleteClient}
              deletingClientId={Number(ClientIdToDelete)}
            />
          </div>
        </TabsContent>
        <TabsContent value="other" className="mt-4 z-0">
          <div className="w-full">
            <TaskList flag={handleUnsavedChanges} />
          </div>
        </TabsContent>
        <TabsContent value="client-schedule" className="mt-4 z-0">
          <div className="w-full">
            <ScheduleWrapper />
          </div>
        </TabsContent>
        <TabsContent value="logs" className="mt-4 z-0">
          <div className="w-full">staff shift logs</div>
        </TabsContent>
        <TabsContent value="reports" className="mt-4 z-0">
          <div className="w-full">
            <IncidentReportForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
