'use client';
import { useEffect, useState } from 'react';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Edit_RemoveGroupHome() {
  const [homes, setHomes] = useState<GroupHomeFetch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getAllHomes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/get-grouphomes`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setHomes(data.groupHomes);
      } else {
        console.log(data.message);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllHomes();
  }, []);

  const deleteHome = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/delete-groupHome/${id}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      // const data = await response.json();
      if (response.ok) {
        setHomes(prev => prev.filter(item => item.id !== parseInt(id)));
        toast('GroupHome deleted successfully.', {
          style: { backgroundColor: 'green', color: 'white' },
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast(message || 'Error deleting group home', {
        style: { backgroundColor: 'red', color: 'white' },
      });
      console.log(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="p-4 sm:p-6 space-y-4">
      {isLoading &&
        Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between border rounded-lg p-4 mb-4 shadow-sm animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-300 rounded-md" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-300 rounded" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-4 bg-gray-300 rounded" />
              <div className="w-12 h-4 bg-gray-300 rounded" />
            </div>
          </div>
        ))}
      {homes.length > 0 &&
        homes.map(home => (
          <div
            key={home.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-4 shadow-sm gap-4"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              {home.image_url ? (
                <Image
                  src={home.image_url}
                  alt={home.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-md"
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center rounded-md bg-purple-100 text-purple-500 text-sm">
                  No Image
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{home.name}</h3>
              </div>
            </div>
            <div className="flex flex-row justify-center gap-4 sm:gap-4 sm:justify-end items-center">
              <Link
                href={`${process.env.NEXT_PUBLIC_FRONEND_BASE_URL}/dashboard/edit-home/${home.id}`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild={true}>
                  <Button
                    disabled={isLoading}
                    className="text-red-600 hover:underline p-0 h-auto bg-transparent hover:bg-transparent cursor-pointer"
                  >
                    {isLoading ? 'Deleting' : 'Delete'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the home and remove
                      all its data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteHome(home.id.toString())}
                      className="bg-red-600"
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
    </div>
  );
}
