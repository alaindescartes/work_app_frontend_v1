import Link from 'next/link';
import { ResidentFetch } from '@/interfaces/clientInterface';
import { IncidentReportFetch } from '@/interfaces/incidentReportInterface';

interface Props {
  residents: ResidentFetch[];
  reports: IncidentReportFetch[];
}

export default function IncidentReportSubList({ residents, reports }: Props) {
  if (residents.length === 0) {
    return <p className="text-sm text-gray-400 italic">No residents for this home.</p>;
  }

  return (
    <div className="space-y-4">
      {residents.map((resident) => (
        <div key={resident.id} className="bg-white rounded-lg border border-gray-100 shadow-md p-5">
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
            {(() => {
              const residentReports = reports.filter((r) => Number(r.residentId) === resident.id);

              return residentReports.length > 0 ? (
                residentReports.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/reports/${r.id}`}
                      className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {r.incidentType}
                      <span className="text-gray-400 ml-1">
                        ({new Date(r.incidentDateTime).toLocaleDateString()})
                      </span>
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.workflowStatus === 'Closed'
                            ? 'bg-green-100 text-green-700'
                            : r.workflowStatus === 'InReview'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {r.workflowStatus}
                      </span>
                      <span className="text-gray-400">›</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-400 italic">No reports yet</li>
              );
            })()}
          </ul>
        </div>
      ))}
    </div>
  );
}
