'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useParams, useRouter } from 'next/navigation';

import { FaArrowLeft } from 'react-icons/fa';

export default function Page() {
  const clients = useSelector((state: RootState) => state.reducer.grouphome.residents);
  const params = useParams();
  const router = useRouter();

  const resident = clients.find((client) => client.id === Number(params.clientId));

  if (!resident) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">Resident not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-white flex flex-col items-center p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="self-start mb-6 text-purple-700 hover:text-purple-900 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={resident.image_url || '/defaultUser.jpg'}
            alt={`${resident.firstName} ${resident.lastName}`}
            className="w-32 h-32 object-cover rounded-full border-2 border-purple-400"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-purple-700">
              {resident.firstName} {resident.lastName}
            </h1>
            <p className="text-gray-600">
              {resident.gender} • {resident.marital_status}
            </p>
            <p className="text-gray-600 capitalize">{resident.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-purple-600">Date of Birth:</h4>
            <p className="text-gray-700">{resident.dateOfBirth}</p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-600">Admission Date:</h4>
            <p className="text-gray-700">{resident.admissionDate}</p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-600">Healthcare Number:</h4>
            <p className="text-gray-700">{resident.healthcareNumber}</p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-600">Phone Number:</h4>
            <p className="text-gray-700">{resident.phoneNumber || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-purple-600 mb-2">Primary Diagnosis:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {resident.primaryDiagnosis.map((diagnosis, idx) => (
              <li key={idx}>{diagnosis}</li>
            ))}
          </ul>

          <h4 className="font-semibold text-purple-600 mt-6 mb-2">Allergies:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {resident.allergies.map((allergy, idx) => (
              <li key={idx}>{allergy}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
