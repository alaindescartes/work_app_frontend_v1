import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import useAuth from '@/lib/hooks/useAuth';
import { useState } from 'react';

interface clientInfo {
  firstName: string;
  lastName: string;
  clientImage: string;
}
export default function Client(props: clientInfo) {
  const role = useAuth().user.role;
  return (
    <div className="p-4 bg-gray-100 w-full">
      <div className="bg-white border border-gray-200 shadow rounded-lg overflow-hidden w-full flex flex-col sm:flex-row sm:items-center p-6">
        {/* Left: Image and Info */}
        <div className="flex items-center gap-6 w-full sm:w-3/4">
          <Image
            src={props.clientImage}
            alt="image of a resident"
            width={96}
            height={96}
            className="w-24 h-24 object-cover rounded-full"
            unoptimized
          />
          <div className="flex flex-col">
            <Link href="/dashboard/client/1">
              <h2 className="text-xl font-bold text-gray-800 hover:underline hover:text-blue-500">
                {props.firstName} {props.lastName}
              </h2>
            </Link>
            <h3 className="text-sm text-gray-500 mt-1">
              Status: <span className="font-medium text-green-600">Onsite</span>
            </h3>
          </div>
        </div>

        {/* Right: Admin Buttons */}
        {role === 'admin' && (
          <div className="flex justify-end gap-3 mt-4 sm:mt-0 w-full sm:w-1/4">
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm">
              Delete
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
