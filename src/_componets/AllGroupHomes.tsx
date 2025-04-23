'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';
import useAuth from '@/lib/hooks/useAuth';

function AllGroupHomes() {
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

  const skeletons = Array(6).fill(0);

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-purple-700 text-center">Group Homes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? skeletons.map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-md overflow-hidden border-t-4 border-purple-200 animate-pulse"
              >
                <div className="w-full h-40 bg-purple-100" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-purple-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-2 bg-gray-100 rounded w-full mt-4" />
                </div>
              </div>
            ))
          : homes.map((home) => (
              <Link href={`/homes/${home.id}`} key={home.id}>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border-t-4 border-purple-400 cursor-pointer transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
                  {/* Image or Placeholder */}
                  {home.image_url ? (
                    <img
                      src={home.image_url}
                      alt={`Image of ${home.name}`}
                      className="block w-full max-h-64 object-cover bg-white"
                    />
                  ) : (
                    <div className="w-full h-64 bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-500 text-sm">No Image Available</span>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-purple-800 mb-1">{home.name}</h3>
                    <p className="text-sm text-gray-600">{home.address}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-gray-500">
                        <span className="font-medium text-gray-700">Type:</span> {home.type}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-medium text-gray-700">Phone:</span> {home.phone}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Status:</span>{' '}
                        <span
                          className={
                            home.status === 'active'
                              ? 'text-green-600 font-medium'
                              : 'text-red-500 font-medium'
                          }
                        >
                          {home.status}
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 italic">{home.notes}</p>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}

export default AllGroupHomes;
