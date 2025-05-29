'use client';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IncidentReportFetch } from '@/interfaces/incidentReportInterface';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, Share2, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import usePrint from '@/lib/hooks/usePrint';

function PaperField({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | undefined | null;
}) {
  if (value === undefined || value === null || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div>
      <Label className="text-gray-500">{label}</Label>
      <p className="border-b border-dashed pb-0.5">{display}</p>
    </div>
  );
}

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [report, setReport] = useState<IncidentReportFetch | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  /**
   * Fetches the generated PDF and either opens it in a new tab
   * or forces a download.
   */
  const getPdfUrl = async (id: number, download = false) => {
    try {
      setGeneratingPdf(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/get-pdf/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      // --> Convert the response to a Blob
      const blob = await res.blob();

      // --> Create a temporary object-URL
      const url = URL.createObjectURL(blob);

      if (download) {
        // Force a download
        const a = document.createElement('a');
        a.href = url;
        a.download = `incident-${id}.pdf`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Open a new tab / viewer
        window.open(url, '_blank');
        // Do *not* revoke immediately, or the tab will get an empty file.
        // Revoke when the tab unloads if you wish.
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Error fetching PDF:', msg);
      // TODO: toast or monitoring
    } finally {
      setGeneratingPdf(false);
    }
  };

  useEffect(() => {
    const getReports = async (IdField: number) => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/get-reportById/${IdField}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.error('Error fetching reports...', message);
        }
        // TODO: send error to monitoring service in production
      } finally {
        setLoading(false);
      }
    };
    getReports(Number(id));
  }, [id]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (!report) return <p className="p-6 text-red-600">Report not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="icon"
          className="self-start sm:self-auto print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          Incident Report&nbsp;#{report.id}
          <Badge variant="outline" className="capitalize">
            {report.workflowStatus}
          </Badge>
        </h1>
        {/* Action buttons (functionality added later) */}
        <div className="flex gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            disabled={generatingPdf}
            onClick={() => getPdfUrl(Number(id), false)}
          >
            {generatingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-1" /> Get PDF
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Incident details */}
      <section className="bg-slate-50 border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Incident Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
          <PaperField
            label="Date & Time"
            value={new Date(report.incidentDateTime).toLocaleString()}
          />
          <PaperField label="Group Home ID" value={report.groupHomeId} />
          <PaperField label="Resident ID" value={report.residentId} />
          <PaperField label="Staff ID" value={report.staffId} />
          <PaperField label="Incident Type" value={report.incidentType} />
          <PaperField label="Severity" value={report.severityLevel} />
          <PaperField label="Description" value={report.description} />
          <PaperField label="Pre‑Incident Context" value={report.preIncidentContext} />
          <PaperField label="Post‑Incident Context" value={report.postIncidentContext} />
          <PaperField label="Near Miss Description" value={report.nearMissDescription} />
          <PaperField label="Immediate Actions" value={report.immediateActions} />
        </div>
      </section>

      {/* Fall details */}
      {report.incidentType === 'Fall' && (
        <section className="bg-slate-50 border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-lg">Fall Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
            <PaperField label="Location" value={report.fallLocation} />
            <PaperField label="Witnessed" value={report.fallWitnessed} />
            <PaperField label="Previous Fall" value={report.previousFall} />
            <PaperField label="Injuries Sustained" value={report.injuriesSustained} />
            <PaperField label="Injuries Description" value={report.injuriesDescription} />
            <PaperField label="First Aid Provided" value={report.firstAidProvided} />
            <PaperField label="First Aid Details" value={report.firstAidDetails} />
            <PaperField
              label="Emergency Services Contacted"
              value={report.emergencyServicesContacted}
            />
            <PaperField label="Mobility Aids In Use" value={report.mobilityAidsInUse} />
            <PaperField label="Proper Footwear" value={report.properFootwear} />
            <PaperField label="Contributing Factors" value={report.fallContributingFactors} />
          </div>
        </section>
      )}

      {/* Medication details */}
      {report.incidentType === 'Medication' && (
        <section className="bg-slate-50 border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-lg">Medication Incident</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
            <PaperField label="Scheduled Date & Time" value={report.medicationScheduledDateTime} />
            <PaperField label="Incident Type" value={report.medicationIncidentType} />
            <PaperField label="Incident Description" value={report.medicationIncidentDescription} />
            <PaperField
              label="Client Received Medication"
              value={report.clientReceivedMedication}
            />
            <PaperField label="Pharmacist Name" value={report.pharmacistName} />
            <PaperField
              label="Pharmacist Conversation Time"
              value={report.pharmacistConversationTime}
            />
            <PaperField label="Pharmacist Instructions" value={report.pharmacistInstructions} />
          </div>
        </section>
      )}

      {/* Notifications */}
      <section className="bg-slate-50 border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Notifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
          <PaperField
            label="Emergency Services Notified"
            value={report.emergencyServicesNotified}
          />
          <PaperField label="Family / Guardian Notified" value={report.familyGuardianNotified} />
          <PaperField label="Site Supervisor Notified" value={report.siteSupervisorNotified} />
          <PaperField label="On‑Call Supervisor Notified" value={report.onCallSupervisorNotified} />
          <PaperField label="Crisis Team Notified" value={report.crisisTeamNotified} />
          <PaperField label="Emergency Contact Notified" value={report.emergencyContactNotified} />
          <PaperField label="Person Spoken To" value={report.notificationName} />
          <PaperField label="Notification Time" value={report.notificationTime} />
          <PaperField label="Notification Notes" value={report.notificationNotes} />
          <PaperField label="Emergency Service Type" value={report.emergencyServiceType} />
          <PaperField label="Responder Name" value={report.emergencyServiceResponderName} />
          <PaperField label="Badge / ID" value={report.emergencyServiceBadgeNumber} />
          <PaperField label="File / Case #" value={report.emergencyServiceFileNumber} />
        </div>
      </section>

      {/* Witnesses */}
      <section className="bg-slate-50 border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Witnesses</h2>
        {report.witnesses && report.witnesses.length > 0 ? (
          <ul className="list-disc pl-6 text-[13px] space-y-1">
            {report.witnesses.map((w, idx) => (
              <li key={idx}>
                <span className="font-medium">{w.name}</span>
                {w.contact && ` — ${w.contact}`}: {w.statement}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] italic text-gray-500">None</p>
        )}
      </section>

      {/* Supervisor review */}
      <section className="bg-slate-50 border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Supervisor Review</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
          <PaperField label="Reviewed At" value={report.supervisorReviewedAt} />
          <PaperField label="Follow‑Up Required" value={report.followUpRequired} />
        </div>
        <PaperField label="Supervisor Notes" value={report.supervisorNotes} />
        <PaperField label="Corrective Actions" value={report.correctiveActions} />
      </section>

      {/* Audit footer */}
      <footer className="text-xs text-gray-500 text-right">
        Created: {report.createdAt ?? '—'} &nbsp;|&nbsp; Updated: {report.updatedAt ?? '—'}
      </footer>
    </div>
  );
}
