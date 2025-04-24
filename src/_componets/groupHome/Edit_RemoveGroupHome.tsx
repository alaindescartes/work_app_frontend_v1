'use client';
import { useEffect, useState } from 'react';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';
import useAuth from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function Edit_RemoveGroupHome() {
  const [homes, setHomes] = useState<GroupHomeFetch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

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
      console.log(data.groupHomes);
      if (response.ok) {
        setHomes(data.groupHomes);
      } else {
        console.log(data.message);
      }
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllHomes();
  }, []);
  return (
    <div className="p-6">
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
            className="flex items-center justify-between border rounded-lg p-4 mb-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              {home.image_url ? (
                <img
                  src={home.image_url}
                  alt={home.name}
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
            <div className="flex gap-4">
              <Link href={'#'}>
                <span className="text-blue-600 hover:underline">Edit</span>
              </Link>
              <Link href={'#'}>
                <span className="text-red-600 hover:underline">Delete</span>
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
}
