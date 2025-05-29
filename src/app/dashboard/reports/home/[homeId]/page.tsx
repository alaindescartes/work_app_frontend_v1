'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IncidentReportFetch } from '@/interfaces/incidentReportInterface';
import { GroupHomeFetch } from '@/interfaces/groupHomeInterface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function KpiTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-md p-4 text-white ${color}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function Page() {
  const { homeId } = useParams();
  const [reports, setReports] = useState<IncidentReportFetch[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [currentHome, setCurrentHome] = useState<GroupHomeFetch | null>(null);
  const [residentMap, setResidentMap] = useState<Record<number, string>>({});
  const [overdueFollowUps, setOverdueFollowUps] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const getAllReports = async (homeId: number) => {
      try {
        // setLoading(true); // Removed stray setLoading(true)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/get-reports/${homeId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.error('Error fetching clients...', message);
        }
        // TODO: send error to monitoring service in production
      }
    };
    getAllReports(Number(homeId));
  }, [homeId]);

  //--------------fetch group home--------------
  useEffect(() => {
    const getHome = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/get-grouphome/${homeId}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentHome(data.groupHome);
          if (Array.isArray(data.residents)) {
            const map: Record<number, string> = {};
            data.residents.forEach((r: { id: number; firstName: string; lastName: string }) => {
              map[r.id] = `${r.firstName} ${r.lastName}`;
            });
            setResidentMap(map);
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV === 'development') {
          console.error(message);
        }
        // TODO: send error to monitoring service in production
      } finally {
        setLoading(false);
      }
    };
    const getResidents = async (homeId: number) => {
      try {
        setLoading(true);
        const residentsData = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/find-residents/${homeId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (residentsData.ok) {
          const data = await residentsData.json();
          const map: Record<number, string> = {};
          data.residentsData.forEach((r: { id: number; firstName: string; lastName: string }) => {
            map[r.id] = `${r.firstName} ${r.lastName}`;
          });
          setResidentMap((prev) => ({ ...prev, ...map }));
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.error('Error fetching clients...', message);
        }
        // TODO: send error to monitoring service in production
      } finally {
        setLoading(false);
      }
    };
    getResidents(Number(homeId));
    getHome();

    // ---------- fetch overdue follow‑ups KPI ----------
    const fetchOverdue = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/follow-ups/overdue-count?homeId=${homeId}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const { count } = await res.json();
          setOverdueFollowUps(count);
        }
      } catch {
        // leave as 0 if request fails
      }
    };
    fetchOverdue();
  }, [homeId]);

  const inReviewCount = reports.filter((r) => r.workflowStatus === 'InReview').length;
  const closedCount = reports.filter((r) => r.workflowStatus === 'Closed').length;

  // choose a subtle background based on workflow status
  const statusBg = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'bg-red-100'; // light grey
      case 'InReview':
        return 'bg-green-100'; // pale yellow
      case 'Submitted':
        return 'bg-blue-50'; // light blue
      default: // Draft or other
        return 'bg-white';
    }
  };

  // choose button colour set to complement the card's background
  const btnColor = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'bg-red-200 text-red-800 hover:bg-red-300';
      case 'InReview':
        return 'bg-green-200 text-green-800 hover:bg-green-300';
      case 'Submitted':
        return 'bg-blue-200 text-blue-800 hover:bg-blue-300';
      default: // Draft or other
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    }
  };

  if (isLoading) return <p className="p-6">Loading …</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* ────────── Header ────────── */}
      {currentHome && (
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentHome.image_url && (
              <Image
                src={currentHome.image_url}
                alt={currentHome.name}
                width={64}
                height={64}
                className="rounded-md object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold">{currentHome.name}</h1>
              <p className="text-sm text-gray-500">{currentHome.address}</p>
            </div>
          </div>
        </header>
      )}

      {/* ────────── KPI tiles ────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiTile label="In Review" value={inReviewCount} color="bg-yellow-500" />
        <KpiTile label="Closed" value={closedCount} color="bg-gray-600" />
        <KpiTile label="Overdue Follow‑Ups" value={overdueFollowUps} color="bg-red-600" />
      </section>

      {/* ────────── Filter bar ────────── */}
      <section className="bg-white border rounded-lg shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-lg">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <Label>Date Range (from)</Label>
            <Input type="date" />
          </div>
          <div>
            <Label>Date Range (to)</Label>
            <Input type="date" />
          </div>
          <div>
            <Label>Incident Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {[
                  'Injury',
                  'Fall',
                  'Aggression',
                  'Medication',
                  'Property',
                  'NearMiss',
                  'Other',
                ].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Severity</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {['Minor', 'Moderate', 'Severe', 'Critical'].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* status chips placeholders */}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Input placeholder="Search by ID or text" />
          <Button variant="outline">Search</Button>
        </div>
      </section>

      {/* ────────── Report list (card view) ────────── */}
      <section className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className={`${statusBg(r.workflowStatus)} border rounded-lg shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
          >
            {/* Left column: core info */}
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg">
                <a href={`/dashboard/reports/${r.id}`} className="text-blue-600 hover:underline">
                  Report #{r.id}
                </a>
                <span className="ml-2 text-sm text-gray-600">
                  — {residentMap[r.residentId] ?? 'Unknown Resident'}
                </span>
                <Badge variant="outline" className="ml-2">
                  {r.workflowStatus}
                </Badge>
              </h3>

              <p className="text-sm text-gray-500">
                {new Date(r.incidentDateTime).toLocaleString()} &mdash;{' '}
                <span className="capitalize">{r.incidentType}</span> ({r.severityLevel})
              </p>

              <p className="text-sm">
                Resident:{' '}
                <span className="font-medium">{residentMap[r.residentId] ?? 'Unknown'}</span>
              </p>

              <p className="text-sm">
                Follow‑up Required:{' '}
                {r.followUpRequired ? (
                  <Badge className="bg-purple-100 text-purple-700">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
                {r.followUpRequired && r.initialFollowUpId && (
                  <span className="ml-2 text-xs text-gray-600">
                    Follow‑up&nbsp;Task&nbsp;#{r.initialFollowUpId}
                  </span>
                )}
              </p>

              {r.supervisorReviewedAt && (
                <p className="text-sm text-gray-500">
                  Reviewed: {new Date(r.supervisorReviewedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Right column: actions */}
            <div className="flex gap-2 self-start sm:self-auto">
              {/* Review is always available */}
              <Button
                size="sm"
                className={btnColor(r.workflowStatus)}
                onClick={() => router.push(`/dashboard/reports/review/${r.id}`)}
              >
                Review
              </Button>

              {/* Actions only for non‑closed reports */}
              {r.workflowStatus !== 'Closed' && (
                <>
                  <Button size="sm" className={btnColor(r.workflowStatus)}>
                    Close
                  </Button>
                  {r.followUpRequired && (
                    <Button size="sm" className={btnColor(r.workflowStatus)}>
                      Add Follow‑up Notes
                    </Button>
                  )}
                </>
              )}

              {/* Print is always available */}
              <Button size="sm" className={btnColor(r.workflowStatus)}>
                Print
              </Button>
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <p className="text-center text-gray-500">No reports found for this home.</p>
        )}
      </section>

      {/* ────────── Audit footer ────────── */}
      <footer className="text-xs text-gray-500 text-right">
        Generated on {new Date().toLocaleString()}
      </footer>
    </div>
  );
}
