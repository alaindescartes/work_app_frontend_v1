import Image from 'next/image';
import Link from 'next/link';

export default function Client() {
  return (
    <div className="p-4 bg-gray-100 flex justify-start">
      <div className="bg-white border border-gray-200 shadow rounded-lg overflow-hidden w-full max-w-sm">
        <div className="flex items-start justify-start gap-4">
          <Image
            src="https://images.unsplash.com/photo-1745433921735-f5e2450cbec1?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="image of a resident"
            width={96}
            height={96}
            className="w-24 h-24 object-cover"
            unoptimized
          />
          <div className="p-4">
            {/*TODO:remember to make client info view dynamic*/}
            <Link href="/dashboard/client/1">
              <h2 className="text-lg font-semibold text-gray-800 hover:underline hover:text-blue-500">
                John Doe
              </h2>
            </Link>

            <h3 className="text-sm text-gray-500">
              Status: <span className="font-medium text-green-600">Onsite</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
