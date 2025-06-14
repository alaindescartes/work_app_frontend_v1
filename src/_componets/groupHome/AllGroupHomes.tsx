'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';

function AllGroupHomes() {
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
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (process.env.NODE_ENV === 'development') {
        console.error(message);
      }
      // TODO: send error to monitoring service in production
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {isLoading
          ? skeletons.map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden border-t-4 border-purple-200 animate-pulse"
              >
                {/* Fixed‑height image placeholder */}
                <div className="h-64 w-full bg-purple-100" />

                {/* Text zone mirrors real card */}
                <div className="flex flex-col flex-1 p-6 space-y-3">
                  <div className="h-4 w-2/3 rounded bg-purple-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  {/* extra placeholder where notes would be */}
                  <div className="mt-auto h-2 w-full rounded bg-gray-100" />
                </div>
              </div>
            ))
          : homes.map((home) => (
              <Link href={`/dashboard/group-homes/${home.id}`} key={home.id}>
                <div className="flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden border-t-4 border-purple-400 cursor-pointer transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
                  {/* Image or Placeholder */}
                  {home.image_url ? (
                    <Image
                      src={home.image_url}
                      alt={`Image of ${home.name}`}
                      width={500}
                      height={256}
                      className="h-64 w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-64 w-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-500 text-sm">No Image Available</span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
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
                    <p className="mt-4 line-clamp-2 text-xs italic text-gray-400">{home.notes}</p>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}

export default AllGroupHomes;
