import { useState } from 'react';
import Link from 'next/link';

// Placeholder data helpers
type Home = { id: number; name: string };
type Resident = {
  id: number;
  firstName: string;
  lastName: string;
  reports: Array<{ id: number; title: string }>;
};

// NOTE: In the real app you will pull these from Redux, RTK Query, or a fetch.
const homes: Home[] = [
  { id: 1, name: 'Aspen Grove' },
  { id: 2, name: 'Cedar View' },
];

const mockResidentsByHome: Record<number, Resident[]> = {
  1: [
    {
      id: 11,
      firstName: 'Alice',
      lastName: 'Jones',
      reports: [
        { id: 101, title: 'Fall – Bathroom (May 27)' },
        { id: 102, title: 'Medication Error (May 15)' },
      ],
    },
    {
      id: 12,
      firstName: 'Bob',
      lastName: 'Smith',
      reports: [{ id: 103, title: 'Aggression – Dining Room (Apr 12)' }],
    },
  ],
  2: [
    {
      id: 21,
      firstName: 'Carlos',
      lastName: 'Diaz',
      reports: [{ id: 201, title: 'Injury – Kitchen (Mar 03)' }],
    },
  ],
};

export default function IncidentReportList() {
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const residentsToShow = selectedHomeId ? (mockResidentsByHome[selectedHomeId] ?? []) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Incident Reports</h1>
      <hr className="my-4" />
      {/* Home selector */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <label htmlFor="home-select" className="block mb-1 font-medium">
          Select Group Home
        </label>
        <div className="relative">
          <select
            id="home-select"
            className="w-full appearance-none pr-8 rounded-md border-gray-300 focus:border-purple-600 focus:ring-purple-600 text-sm p-2"
            value={selectedHomeId ?? ''}
            onChange={(e) => setSelectedHomeId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— choose a home —</option>
            {homes.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
            ▾
          </span>
        </div>
      </div>

      {/* Residents & reports */}
      {selectedHomeId && (
        <div className="space-y-4">
          {residentsToShow.map((resident) => (
            <div
              key={resident.id}
              className="bg-white rounded-lg border border-gray-100 shadow-md p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-purple-600 text-white font-semibold">
                  {resident.firstName[0]}
                  {resident.lastName[0]}
                </div>
                <h3 className="font-semibold">
                  {resident.firstName} {resident.lastName}
                </h3>
              </div>
              <ul className="flex flex-wrap gap-2">
                {resident.reports.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/reports/${r.id}`}
                      className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {r.title} <span className="text-gray-400">›</span>
                    </Link>
                  </li>
                ))}
                {resident.reports.length === 0 && (
                  <li className="text-sm text-gray-400 italic">No reports yet</li>
                )}
              </ul>
            </div>
          ))}
          {residentsToShow.length === 0 && (
            <p className="text-sm text-gray-400 italic">No residents for this home.</p>
          )}
        </div>
      )}
    </div>
  );
}
