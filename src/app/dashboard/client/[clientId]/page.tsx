'use client';

import Image from 'next/image';
import { ResidentFetch } from '@/interfaces/clientInterface';
import { formatDistanceToNow } from 'date-fns';

const dummyResident: ResidentFetch = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-05-15',
  gender: 'Male',
  primaryDiagnosis: ['Asthma', 'Hypertension'],
  allergies: ['Peanuts', 'Latex'],
  admissionDate: '2023-01-10',
  status: 'Active',
  image_url:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fHww',
  guardianId: 5,
  groupHomeId: 2,
  marital_status: 'single',
  healthcareNumber: 'AB-1234567',
  phoneNumber: '123-456-7890',
  isSelfGuardian: true,
  funderID: 3,
};

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
      <p className={highlight ? 'text-green-600 font-medium' : 'text-gray-600'}>{value}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-md font-semibold text-gray-700 mb-2">{title}</h4>
      <ul className="list-disc list-inside text-gray-600 space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-white flex flex-col p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-1/3 h-72 md:h-auto">
          <Image
            src={dummyResident.image_url}
            alt={`Photo of ${dummyResident.firstName} ${dummyResident.lastName}`}
            layout="fill"
            objectFit="cover"
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Info */}
        <div className="flex-1 p-8 flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold text-purple-800">
                {dummyResident.firstName} {dummyResident.lastName}
              </h1>
              <p className="text-gray-500 mt-1">Resident ID: #{dummyResident.id}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 text-sm">
                Edit
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">
                Delete
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Field label="Date of Birth" value={dummyResident.dateOfBirth} />
            <Field label="Gender" value={dummyResident.gender} />
            <Field label="Marital Status" value={dummyResident.marital_status} />
            <Field label="Healthcare Number" value={dummyResident.healthcareNumber} />
            <Field label="Phone Number" value={dummyResident.phoneNumber ?? 'N/A'} />
            <Field
              label="Admitted"
              value={`${formatDistanceToNow(new Date(dummyResident.admissionDate))} ago`}
            />
            <Field label="Status" value={dummyResident.status} highlight />
            <Field label="Self Guardian" value={dummyResident.isSelfGuardian ? 'Yes' : 'No'} />
            <Field
              label="Guardian ID"
              value={dummyResident.guardianId ? dummyResident.guardianId.toString() : 'N/A'}
            />
          </div>

          {/* Diagnosis and Allergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <List title="Primary Diagnosis" items={dummyResident.primaryDiagnosis} />
            <List title="Allergies" items={dummyResident.allergies} />
          </div>
        </div>
      </div>
    </div>
  );
}
