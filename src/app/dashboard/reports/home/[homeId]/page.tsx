'use client';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
import { IncidentFollowUpFetch } from '@/interfaces/followUp';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import FollowUpForm from '@/_componets/reports/FollowUpForm';

function KpiTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-md p-4 text-white ${color}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function Page() {
  /** Number of reports appended on each “Show more” click. Change once here. */
  const PAGE_SIZE = 10;
  const { homeId } = useParams();
  const [reports, setReports] = useState<IncidentReportFetch[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [currentHome, setCurrentHome] = useState<GroupHomeFetch | null>(null);
  const [residentMap, setResidentMap] = useState<Record<number, string>>({});
  const [followUps, setFollowUps] = useState<IncidentFollowUpFetch[]>([]);

  /** Number of follow‑ups whose dueDate has passed and are not closed */
  const overdueFollowUps = useMemo(() => {
    const today = new Date();
    return followUps.filter(
      (f) => f.status !== 'Closed' && f.dueDate != null && new Date(f.dueDate) < today
    ).length;
  }, [followUps]);
  /**
   * ───────────────────────────────────────────
   *  Client‑side filter state
   *  You can later plumb these into query‑string
   *  params and fetch filtered data from the API.
   * ───────────────────────────────────────────
   */
  const initialFilters = {
    from: '',
    to: '',
    type: '',
    severity: '',
    status: new Set<string>(),
    search: '',
  };
  const [filters, setFilters] = useState<typeof initialFilters>(initialFilters);
  /** How many items are currently rendered */
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  /** Normalise strings for fuzzy match */
  const normal = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/\s+/g, ' ')
      .trim();

  /** Levenshtein distance for 2 short strings; O(a*b) but fine for names */
  const levenshtein = (a: string, b: string) => {
    const al = a.length,
      bl = b.length;
    if (!al) return bl;
    if (!bl) return al;
    const dp = Array.from({ length: al + 1 }, (_, i) => i);
    for (let j = 1; j <= bl; j++) {
      let prev = dp[0]++;
      for (let i = 1; i <= al; i++) {
        const temp = dp[i];
        dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = temp;
      }
    }
    return dp[al];
  };

  /**
   * Fuzzy name matching:
   * - accent‑insensitive
   * - ignores case & extra spaces
   * - substrings match directly
   * - otherwise allows Levenshtein distance ≤1 per token
   *   e.g. "Joel Philips" matches "joe philips"
   */
  /** Does resident name match the search term loosely? */
  const fuzzyMatch = (nameRaw: string, queryRaw: string) => {
    const name = normal(nameRaw);
    const query = normal(queryRaw);
    if (name.includes(query)) return true;

    const nameParts = name.split(' ');
    const queryParts = query.split(' ');

    // every query token must be close to at least one name token
    return queryParts.every((qp) =>
      nameParts.some((np) => {
        if (np.startsWith(qp)) return true;
        return levenshtein(np, qp) <= 1; // allow 1‑char difference
      })
    );
  };

  /** Helper to update a single filter key */
  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // whenever any filter changes, reset pagination
    setVisibleCount(PAGE_SIZE);
  };
  const router = useRouter();

  /**
   * ───────────────────────────────────────────
   *  Visibility‑aware polling for reports
   *  • Changes POLL_MS or swaps out this effect
   *    if you migrate to SSE/WebSocket later.
   * ───────────────────────────────────────────
   */
  const POLL_MS = 30_000; // 30 s; adjust or externalise

  useEffect(() => {
    if (!homeId) return;

    const fetchReports = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[poll] fetching reports …');
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/get-reports/${homeId}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[poll] error:', err);
        }
      }
    };

    let intervalId: NodeJS.Timeout | undefined;

    const startPolling = () => {
      fetchReports(); // immediate
      intervalId = setInterval(fetchReports, POLL_MS);
    };
    const stopPolling = () => {
      if (intervalId) clearInterval(intervalId);
    };

    // decide initial state
    if (document.visibilityState === 'visible') startPolling();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        stopPolling();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // cleanup
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
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

    //fetch all followups by group home
    const fetchFollowUps = async (homeId: number) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/getAll-follow-up/${homeId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setFollowUps(data.followUps);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.error('Error fetching reports...', message);
        }
        // TODO: send error to monitoring service in production
      }
    };

    fetchFollowUps(Number(homeId));
  }, [homeId]);

  const inReviewCount = reports.filter((r) => r.workflowStatus === 'InReview').length;
  const closedCount = reports.filter((r) => r.workflowStatus === 'Closed').length;

  /**
   * Memoised filtered array. When you move filtering
   * logic server‑side, replace this with the API response.
   */
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Date range
      if (filters.from && new Date(r.incidentDateTime) < new Date(filters.from)) return false;
      if (filters.to && new Date(r.incidentDateTime) > new Date(filters.to + 'T23:59:59'))
        return false;

      // Incident type / severity
      if (filters.type && r.incidentType !== filters.type) return false;
      if (filters.severity && r.severityLevel !== filters.severity) return false;

      // Status chips
      if (filters.status.size && !filters.status.has(r.workflowStatus)) return false;

      // Fuzzy text search on resident name
      if (filters.search && !fuzzyMatch(residentMap[r.residentId] ?? '', filters.search))
        return false;

      return true;
    });
  }, [reports, filters, residentMap]);

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

  // Stronger contrast badge colour for workflow status
  const badgeColor = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'bg-red-600 text-white';
      case 'InReview':
        return 'bg-green-600 text-white';
      case 'Submitted':
        return 'bg-blue-600 text-white';
      default: // Draft or other
        return 'bg-gray-600 text-white';
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
            <Input
              type="date"
              value={filters.from}
              onChange={(e) => updateFilter('from', e.target.value)}
            />
          </div>
          <div>
            <Label>Date Range (to)</Label>
            <Input
              type="date"
              value={filters.to}
              onChange={(e) => updateFilter('to', e.target.value)}
            />
          </div>
          <div>
            <Label>Incident Type</Label>
            <Select onValueChange={(v) => updateFilter('type', v)}>
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
            <Select onValueChange={(v) => updateFilter('severity', v)}>
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

          {/* Workflow status chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {['Draft', 'Submitted', 'InReview', 'Closed'].map((st) => {
              const active = filters.status.has(st);
              return (
                <Badge
                  key={st}
                  variant={active ? 'default' : 'outline'}
                  className="cursor-pointer select-none"
                  onClick={() =>
                    setFilters((prev) => {
                      const next = new Set(prev.status);
                      if (active) {
                        next.delete(st);
                      } else {
                        next.add(st);
                      }
                      return { ...prev, status: next };
                    })
                  }
                >
                  {st}
                </Badge>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Search by Resident Name"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          {/*<Button variant="outline" disabled>*/}
          {/*  Search /!* Placeholder: filters run instantly client‑side *!/*/}
          {/*</Button>*/}
          {/* Reset filters to initial state */}
          <Button variant="secondary" onClick={() => setFilters(initialFilters)}>
            Reset Filters
          </Button>
        </div>
      </section>

      {/* ────────── Report list (card view) ────────── */}
      <section className="space-y-4">
        {filteredReports.slice(0, visibleCount).map((r) => (
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
                <Badge className={`ml-2 ${badgeColor(r.workflowStatus)}`}>{r.workflowStatus}</Badge>
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
                  {/* Follow‑up notes */}
                  {r.followUpRequired && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className={btnColor(r.workflowStatus)}>
                          Add&nbsp;Follow‑up&nbsp;Notes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        {(() => {
                          /* find existing FU once per render */
                          const existingFU =
                            r.initialFollowUpId != null
                              ? followUps.find((f) => f.id === r.initialFollowUpId)
                              : followUps.find((f) => f.incidentId === r.id);

                          return existingFU ? (
                            <FollowUpForm incidentId={Number(r.id)} initial={existingFU} />
                          ) : (
                            <p className="p-4 text-sm text-red-600">
                              No follow‑up task has been created for this report yet.
                            </p>
                          );
                        })()}
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <p className="text-center text-gray-500">No reports match your filters.</p>
        )}
      </section>

      {/* Pagination – show more */}
      {visibleCount < filteredReports.length && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Show more
          </Button>
        </div>
      )}

      {/* ────────── Audit footer ────────── */}
      <footer className="text-xs text-gray-500 text-right">
        Generated on {new Date().toLocaleString()}
      </footer>
    </div>
  );
}
