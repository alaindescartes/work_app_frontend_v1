'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';

const formatISODate = (iso: string | Date | undefined) =>
  iso ? format(new Date(iso), 'yyyy-MM-dd') : 'N/A';

export default function ClientInfo({ clientId }: { clientId: string }) {
  const clients = useSelector((state: RootState) => state.grouphome.residents);
  const router = useRouter();

  const resident = clients.find((client) => client.id === Number(clientId));

  if (!resident) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">Resident not found.</p>
      </div>
    );
  }

  // Parse primaryDiagnosis and allergies safely if needed
  const primaryDiagnosisArray = Array.isArray(resident.primaryDiagnosis)
    ? resident.primaryDiagnosis
    : JSON.parse(resident.primaryDiagnosis || '[]');

  const allergiesArray = Array.isArray(resident.allergies)
    ? resident.allergies
    : JSON.parse(resident.allergies || '[]');

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
          <Image
            src={resident.image_url || '/defaultUser.jpg'}
            alt={`${resident.firstName} ${resident.lastName}`}
            width={128}
            height={128}
            className="object-cover rounded-full border-2 border-purple-400"
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
            <p className="text-gray-700">{formatISODate(resident.dateOfBirth)}</p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-600">Admission Date:</h4>
            <p className="text-gray-700">{formatISODate(resident.admissionDate)}</p>
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
            {primaryDiagnosisArray.map((diagnosis: string, idx: number) => (
              <li key={idx}>{diagnosis}</li>
            ))}
          </ul>

          <h4 className="font-semibold text-purple-600 mt-6 mb-2">Allergies:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {allergiesArray.map((allergy: string, idx: number) => (
              <li key={idx}>{allergy}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
