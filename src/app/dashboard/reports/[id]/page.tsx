'use client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  IncidentReportFetch,
  IncidentReportSupervisorUpdate,
} from '@/interfaces/incidentReportInterface';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function PaperSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      {children}
    </section>
  );
}

function PaperField({
  label,
  value,
  span = false,
}: {
  label: string;
  value?: string | number | boolean | null;
  span?: boolean;
}) {
  const isEmpty = value === undefined || value === null || value === '';
  const display = isEmpty
    ? 'None'
    : typeof value === 'boolean'
      ? value
        ? 'Yes'
        : 'No'
      : String(value);

  return (
    <div className={span ? 'sm:col-span-3' : undefined}>
      <Label className="text-gray-500">{label}</Label>
      <p className={`border-b border-dashed pb-1 ${isEmpty ? 'italic text-gray-400' : undefined}`}>
        {display}
      </p>
    </div>
  );
}

function SupervisorForm({
  initial,
  onSaved,
}: {
  initial: IncidentReportFetch;
  onSaved: (r: IncidentReportFetch) => void;
}) {
  const [form, setForm] = useState<IncidentReportSupervisorUpdate>({
    id: initial.id,
    workflowStatus: initial.workflowStatus,
    supervisorReviewedAt: initial.supervisorReviewedAt ?? '',
    supervisorNotes: initial.supervisorNotes ?? '',
    correctiveActions: initial.correctiveActions ?? '',
    followUpRequired: initial.followUpRequired,
  });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const update = <K extends keyof IncidentReportSupervisorUpdate>(
    field: K,
    value: IncidentReportSupervisorUpdate[K]
  ) => setForm((p) => ({ ...p, [field]: value }));

  const isValid =
    (form.workflowStatus ?? '') !== '' &&
    (form.supervisorReviewedAt ?? '') !== '' &&
    (form.supervisorNotes ?? '').trim() !== '' &&
    (form.correctiveActions ?? '').trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/edit-report/${initial.id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        const { report } = await res.json();
        onSaved(report);
        // show toast first
        toast("Report's supervisor review has been updated", {
          style: { backgroundColor: 'green', color: 'white' },
        });
        // then navigate (no await – we don't block UI)
        router.push(`/dashboard/reports/home/${initial.groupHomeId}`);
        return;
      } else {
        const { message } = await res.json().catch(() => ({ message: 'Update failed' }));
        toast(message, { style: { backgroundColor: 'red', color: 'white' } });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
        console.error('Error fetching clients...', message);
      }
      // TODO: send error to monitoring service in production
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border shadow-sm rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-semibold">Supervisor Review</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Workflow Status</Label>
          <Select
            value={form.workflowStatus ?? ''}
            onValueChange={(v) =>
              update('workflowStatus', v as IncidentReportSupervisorUpdate['workflowStatus'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {['Draft', 'Submitted', 'InReview', 'Closed'].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Reviewed At</Label>
          <Input
            type="datetime-local"
            value={form.supervisorReviewedAt ?? ''}
            onChange={(e) => update('supervisorReviewedAt', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <Label>Supervisor Notes</Label>
          <Textarea
            rows={3}
            value={form.supervisorNotes ?? ''}
            onChange={(e) => update('supervisorNotes', e.target.value)}
          />
        </div>
        <div>
          <Label>Corrective / Follow-up Actions</Label>
          <Textarea
            rows={3}
            value={form.correctiveActions ?? ''}
            onChange={(e) => update('correctiveActions', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Follow-Up Required</Label>
          <input
            type="checkbox"
            checked={form.followUpRequired ?? false}
            onChange={(e) => update('followUpRequired', e.target.checked)}
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting || !isValid}>
        {submitting ? 'Saving…' : 'Save Supervisor Review'}
      </Button>
      {!isValid && (
        <p className="text-sm text-red-500">Please complete all supervisor fields before saving.</p>
      )}
    </form>
  );
}

export default function Page() {
  const [currentReport, setCurrentReport] = useState<IncidentReportFetch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams();

  //---------get current report data--------------------------------
  useEffect(() => {
    const getReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/get-reportById/${id}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (res.ok) {
          const data = await res.json();
          setCurrentReport(data.report);
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
    getReport();
  }, [id]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!currentReport) return <p className="p-4 text-red-600">Report not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 p-6">
      {/* ────────── Read‑only “paper” view ────────── */}
      <section className="bg-white border shadow-sm rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold mb-2">Incident Report #{currentReport.id}</h2>

        {/* === CORE DETAILS === */}
        <PaperSection title="Incident Details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <PaperField label="Incident Type" value={currentReport.incidentType} />
            <PaperField
              label="Date & Time"
              value={new Date(currentReport.incidentDateTime).toLocaleString()}
            />
            <PaperField label="Severity" value={currentReport.severityLevel} />

            <PaperField label="Description" value={currentReport.description} span />
            <PaperField
              label="Pre‑Incident Context"
              value={currentReport.preIncidentContext}
              span
            />
            <PaperField
              label="Post‑Incident Context"
              value={currentReport.postIncidentContext}
              span
            />
            <PaperField label="Near Miss" value={currentReport.nearMissDescription} span />
            <PaperField
              label="Immediate Actions Taken"
              value={currentReport.immediateActions}
              span
            />
            <PaperField label="Follow‑Up Required" value={currentReport.followUpRequired} />
          </div>
        </PaperSection>

        {/* === FALL‑SPECIFIC === */}
        <PaperSection title="Fall Details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <PaperField label="Location of Fall" value={currentReport.fallLocation} />
            <PaperField label="Fall Witnessed" value={currentReport.fallWitnessed} />
            <PaperField label="Previous Fall (≤30 days)" value={currentReport.previousFall} />
            <PaperField label="Injuries Sustained" value={currentReport.injuriesSustained} />
            <PaperField
              label="Injuries Description"
              value={currentReport.injuriesDescription}
              span
            />
            <PaperField label="First Aid Provided" value={currentReport.firstAidProvided} />
            <PaperField label="First Aid Details" value={currentReport.firstAidDetails} span />
            <PaperField
              label="Emergency Services Contacted"
              value={currentReport.emergencyServicesContacted}
            />
            <PaperField label="Mobility Aids In Use" value={currentReport.mobilityAidsInUse} />
            <PaperField label="Proper Footwear" value={currentReport.properFootwear} />
            <PaperField
              label="Contributing Factors / Comments"
              value={currentReport.fallContributingFactors}
              span
            />
          </div>
        </PaperSection>

        {/* === MEDICATION INCIDENT === */}
        <PaperSection title="Medication Incident">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <PaperField
              label="Scheduled Date & Time"
              value={currentReport.medicationScheduledDateTime}
            />
            <PaperField label="Incident Type" value={currentReport.medicationIncidentType} />
            <PaperField
              label="Client Received Medication?"
              value={currentReport.clientReceivedMedication}
            />
            <PaperField
              label="Incident Description"
              value={currentReport.medicationIncidentDescription}
              span
            />
            <PaperField label="Pharmacist Name" value={currentReport.pharmacistName} />
            <PaperField
              label="Pharmacist Conversation Time"
              value={currentReport.pharmacistConversationTime}
            />
            <PaperField
              label="Pharmacist Instructions"
              value={currentReport.pharmacistInstructions}
              span
            />
          </div>
        </PaperSection>

        {/* === NOTIFICATIONS === */}
        <PaperSection title="Persons Notified">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <PaperField
              label="Emergency Services"
              value={currentReport.emergencyServicesNotified}
            />
            <PaperField label="Family / Guardian" value={currentReport.familyGuardianNotified} />
            <PaperField label="Site Supervisor" value={currentReport.siteSupervisorNotified} />
            <PaperField label="On‑Call Supervisor" value={currentReport.onCallSupervisorNotified} />
            <PaperField label="Crisis Team" value={currentReport.crisisTeamNotified} />
            <PaperField label="Emergency Contact" value={currentReport.emergencyContactNotified} />

            {/* Emergency‑service detail (shown if present) */}
            <PaperField label="Emergency Service Type" value={currentReport.emergencyServiceType} />
            <PaperField
              label="Responder Name"
              value={currentReport.emergencyServiceResponderName}
            />
            <PaperField
              label="Badge / ID Number"
              value={currentReport.emergencyServiceBadgeNumber}
            />
            <PaperField
              label="File / Case Number"
              value={currentReport.emergencyServiceFileNumber}
            />

            <PaperField label="Notified Person" value={currentReport.notificationName} />
            <PaperField label="Notification Time" value={currentReport.notificationTime} />
            <PaperField label="Notification Notes" value={currentReport.notificationNotes} span />
          </div>
        </PaperSection>

        {/* === WITNESSES === */}
        <PaperSection title="Witnesses">
          {currentReport.witnesses && currentReport.witnesses.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {currentReport.witnesses.map((w, idx) => (
                <li key={idx}>
                  <span className="font-medium">{w.name}</span>
                  {w.contact && ` — ${w.contact}`}: {w.statement}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-gray-500">None</p>
          )}
        </PaperSection>
      </section>

      {/* ────────── Supervisor edit form ────────── */}
      <SupervisorForm initial={currentReport} onSaved={(updated) => setCurrentReport(updated)} />
    </div>
  );
}
