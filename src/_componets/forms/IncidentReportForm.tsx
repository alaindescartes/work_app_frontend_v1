'use client';

import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { IncidentReportInterface } from '@/interfaces/incidentReportInterface';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

/* -------------------------------------------------------------------------- */
/*  Shared types                                                               */
/* -------------------------------------------------------------------------- */
type Witness = { name: string; contact: string; statement: string };

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function L({ children }: { children: string }) {
  return <Label className="font-medium">{children}</Label>;
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

type UserRole = 'staff' | 'supervisor';
type clientInfo = { name: string; id: number };
/**
 * @param role – if 'staff' (default) the staff sections are enabled, and supervisor
 *               sections are readonly; if 'supervisor' the inverse is true.
 */
export default function IncidentReportForm({ role = 'staff' }: { role?: UserRole }) {
  /* ------------------------------------------------------------------ */
  /*  Role‑based section toggles                                         */
  /* ------------------------------------------------------------------ */
  // If a role is 'supervisor', staff sections are disabled; if 'staff', supervisor sections are disabled
  const staffSectionDisabled = role === 'supervisor';
  const supervisorSectionDisabled = role === 'staff';

  const groupHome = useSelector((state: RootState) => state.grouphome);
  const staffInfo = useSelector((state: RootState) => state.user.userInfo);
  const [selectedClient, setSelectedClient] = useState<clientInfo>({ name: '', id: 0 });

  // Helper to build a fresh empty form
  const buildInitialForm = (): IncidentReportInterface => ({
    /* Identifiers */
    groupHomeId: groupHome?.grouphomeInfo?.id || 0,
    residentId: 0,
    staffId: staffInfo?.staffId || 0,
    incidentDateTime: '',
    incidentType: 'Injury',
    severityLevel: 'Minor',
    workflowStatus: 'Draft',

    /* Descriptions */
    description: '',
    preIncidentContext: '',
    postIncidentContext: '',
    nearMissDescription: '',

    /* Immediate / follow‑up */
    immediateActions: '',
    followUpRequired: false,
    followUpDueDate: '',
    followUpCompletedAt: '',
    supervisorReviewedAt: '',

    /* Supervisor review */
    supervisorNotes: '',
    correctiveActions: '',

    /* Fall‑specific */
    fallLocation: '',
    fallWitnessed: false,
    previousFall: false,
    injuriesSustained: false,
    injuriesDescription: '',
    firstAidProvided: false,
    firstAidDetails: '',
    emergencyServicesContacted: false,
    mobilityAidsInUse: false,
    properFootwear: false,
    fallContributingFactors: '',

    /* Medication incident */
    medicationScheduledDateTime: '',
    medicationIncidentType: '',
    medicationIncidentDescription: '',
    clientReceivedMedication: false,
    pharmacistName: '',
    pharmacistConversationTime: '',
    pharmacistInstructions: '',

    /* Notifications */
    emergencyServicesNotified: false,
    familyGuardianNotified: false,
    siteSupervisorNotified: false,
    onCallSupervisorNotified: false,
    crisisTeamNotified: false,
    emergencyContactNotified: false,
    notificationName: '',
    notificationTime: '',
    notificationNotes: '',
    emergencyServiceType: 'Ambulance',
    emergencyServiceResponderName: '',
    emergencyServiceBadgeNumber: '',
    emergencyServiceFileNumber: '',

    /* Witnesses */
    witnesses: [{ name: '', contact: '', statement: '' }],

    /* Staff completion */
    staffName: staffInfo?.firstName + ' ' + staffInfo?.lastName,
    staffPosition: '',
    reportDate: '',
  });

  /* ---------------------------------------------------------------------- */
  /*  State                                                                  */
  /* ---------------------------------------------------------------------- */
  const [form, setForm] = useState<IncidentReportInterface>(buildInitialForm());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateField = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateWitnessField = (index: number, field: keyof Witness, value: string) =>
    setForm((prev) => {
      const witnesses = [...(prev.witnesses ?? [])];
      witnesses[index] = { ...witnesses[index], [field]: value };
      return { ...prev, witnesses };
    });

  const addWitness = () =>
    setForm((prev) => ({
      ...prev,
      witnesses: [...(prev.witnesses ?? []), { name: '', contact: '', statement: '' }],
    }));

  /* ------------------------------------------------------------------ */
  /*  handles selection of clients                                       */
  /* ------------------------------------------------------------------ */
  const handleClientSelect = (id: number) => {
    const client = groupHome.residents.find((r) => r.id === id);
    setSelectedClient({
      name: client ? `${client.firstName} ${client.lastName}` : '',
      id: client?.id || 0,
    });
  };

  /* ------------------------------------------------------------------ */
  /*  Submit handler                                                     */
  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /*  Submit handler – sends *only* staff‑editable fields               */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      /* Identifiers */
      groupHomeId,
      residentId,
      staffId,

      /* Core incident info */
      incidentDateTime,
      incidentType,
      severityLevel,

      /* Descriptions & context */
      description,
      preIncidentContext,
      postIncidentContext,
      nearMissDescription,

      /* Immediate actions */
      immediateActions,

      /* Follow‑up flag (manager adds dates later) */
      followUpRequired,

      /* Fall‑specific */
      fallLocation,
      fallWitnessed,
      previousFall,
      injuriesSustained,
      injuriesDescription,
      firstAidProvided,
      firstAidDetails,
      emergencyServicesContacted,
      mobilityAidsInUse,
      properFootwear,
      fallContributingFactors,

      /* Medication incident */
      medicationScheduledDateTime,
      medicationIncidentType,
      medicationIncidentDescription,
      clientReceivedMedication,
      pharmacistName,
      pharmacistConversationTime,
      pharmacistInstructions,

      /* Notifications */
      emergencyServicesNotified,
      familyGuardianNotified,
      siteSupervisorNotified,
      onCallSupervisorNotified,
      crisisTeamNotified,
      emergencyContactNotified,
      notificationName,
      notificationTime,
      notificationNotes,
      emergencyServiceType,
      emergencyServiceResponderName,
      emergencyServiceBadgeNumber,
      emergencyServiceFileNumber,

      /* Witnesses & staff completion */
      witnesses,
      staffName,
      staffPosition,
      reportDate,
    } = form;

    const staffPayload = {
      groupHomeId,
      residentId,
      staffId,
      incidentDateTime,
      incidentType,
      severityLevel,
      description,
      preIncidentContext,
      postIncidentContext,
      nearMissDescription,
      immediateActions,
      followUpRequired,
      fallLocation,
      fallWitnessed,
      previousFall,
      injuriesSustained,
      injuriesDescription,
      firstAidProvided,
      firstAidDetails,
      emergencyServicesContacted,
      mobilityAidsInUse,
      properFootwear,
      fallContributingFactors,
      medicationScheduledDateTime,
      medicationIncidentType,
      medicationIncidentDescription,
      clientReceivedMedication,
      pharmacistName,
      pharmacistConversationTime,
      pharmacistInstructions,
      emergencyServicesNotified,
      familyGuardianNotified,
      siteSupervisorNotified,
      onCallSupervisorNotified,
      crisisTeamNotified,
      emergencyContactNotified,
      notificationName,
      notificationTime,
      notificationNotes,
      emergencyServiceType,
      emergencyServiceResponderName,
      emergencyServiceBadgeNumber,
      emergencyServiceFileNumber,
      witnesses,
      staffName,
      staffPosition,
      reportDate,
    };

    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/save-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffPayload),
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok) {
        toast(json.message || 'Failed to save incident report', {
          style: { backgroundColor: 'red', color: 'white' },
        });
        return;
      }

      toast('Incident report saved successfully', {
        style: { backgroundColor: 'green', color: 'white' },
      });
      setForm(buildInitialForm());
      setSelectedClient({ name: '', id: 0 });
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') console.error(err);
      toast('Failed to save incident report', {
        style: { backgroundColor: 'red', color: 'white' },
      });
    } finally {
      setIsLoading(false);
    }
  };
  console.log(isLoading);
  /* ---------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <form
      className="space-y-10 w-full p-6 rounded-lg bg-white shadow-sm border"
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-semibold">Incident Report</h2>
      {selectedClient.name && (
        <p className="text-sm text-gray-500">Selected Resident: {selectedClient.name}</p>
      )}
      {/* ╔════════ Staff‑editable part (disabled for supervisors) ════════╗ */}
      <fieldset
        disabled={staffSectionDisabled}
        className={staffSectionDisabled ? 'opacity-50 cursor-not-allowed' : undefined}
      >
        {/* =======================  SECTION A  ============================== */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold">A. Incident Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <L>Group Home ID</L>
              <Input
                type="number"
                value={form.groupHomeId}
                onChange={(e) => updateField('groupHomeId', Number(e.target.value))}
                placeholder={groupHome.grouphomeInfo.name}
                disabled={true}
              />
            </div>
            <div>
              <L>Resident</L>
              <Select
                value={form.residentId ? form.residentId.toString() : ''}
                onValueChange={(val) => {
                  const id = Number(val);
                  handleClientSelect(id); // keep the UI selection state
                  updateField('residentId', id); // sync with form state
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Resident" />
                </SelectTrigger>

                <SelectContent>
                  {groupHome.residents.map((resident) => (
                    <SelectItem key={resident.id} value={resident.id.toString()}>
                      {resident.firstName} {resident.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <L>Reporter (Staff) ID</L>
              <Input
                type="number"
                value={form.staffId}
                onChange={(e) => updateField('staffId', Number(e.target.value))}
                placeholder={staffInfo.firstName + ' ' + staffInfo.lastName}
                disabled={true}
              />
            </div>
            <div>
              <L>Date &amp; Time of Incident</L>
              <Input
                type="datetime-local"
                value={form.incidentDateTime}
                onChange={(e) => updateField('incidentDateTime', e.target.value)}
              />
            </div>
            <div>
              <L>Incident Type</L>
              <Select
                value={form.incidentType}
                onValueChange={(v) => updateField('incidentType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Injury">Injury</SelectItem>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Aggression">Aggression</SelectItem>
                  <SelectItem value="Medication">Medication Error</SelectItem>
                  <SelectItem value="Property">Property Damage</SelectItem>
                  <SelectItem value="NearMiss">Near Miss</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <L>Severity Level</L>
              <Select
                value={form.severityLevel}
                onValueChange={(v) => updateField('severityLevel', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minor">Minor</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Severe">Severe</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generic descriptions */}
          <div className="grid gap-4">
            <div>
              <L>Description (Detailed)</L>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe what happened..."
              />
            </div>
            <div>
              <L>What was happening immediately before?</L>
              <Textarea
                rows={3}
                value={form.preIncidentContext}
                onChange={(e) => updateField('preIncidentContext', e.target.value)}
              />
            </div>
            <div>
              <L>What happened immediately after?</L>
              <Textarea
                rows={3}
                value={form.postIncidentContext}
                onChange={(e) => updateField('postIncidentContext', e.target.value)}
              />
            </div>
            {form.incidentType === 'NearMiss' && (
              <div>
                <L>Near Miss Description</L>
                <Textarea
                  rows={3}
                  value={form.nearMissDescription}
                  onChange={(e) => updateField('nearMissDescription', e.target.value)}
                  placeholder="Describe the near miss..."
                />
              </div>
            )}
          </div>
        </section>

        {/* =======================  FALL DETAILS ============================ */}
        {form.incidentType === 'Fall' && (
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Fall‑Specific Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <L>Location of Fall</L>
                <Input
                  value={form.fallLocation}
                  onChange={(e) => updateField('fallLocation', e.target.value)}
                  placeholder="Bedroom, bathroom, etc."
                />
              </div>

              <SwitchField
                label="Fall Witnessed by Staff"
                value={form.fallWitnessed}
                onChange={(v) => updateField('fallWitnessed', v)}
              />

              <SwitchField
                label="Previous Fall within 30 Days"
                value={form.previousFall}
                onChange={(v) => updateField('previousFall', v)}
              />

              <SwitchField
                label="Client Sustained Injuries"
                value={form.injuriesSustained}
                onChange={(v) => updateField('injuriesSustained', v)}
              />

              {form.injuriesSustained && (
                <div className="sm:col-span-2">
                  <L>Describe Injuries</L>
                  <Textarea
                    rows={2}
                    value={form.injuriesDescription}
                    onChange={(e) => updateField('injuriesDescription', e.target.value)}
                  />
                </div>
              )}

              <SwitchField
                label="First Aid Provided"
                value={form.firstAidProvided}
                onChange={(v) => updateField('firstAidProvided', v)}
              />

              {form.firstAidProvided && (
                <div className="sm:col-span-2">
                  <L>What First Aid was Done?</L>
                  <Textarea
                    rows={2}
                    value={form.firstAidDetails}
                    onChange={(e) => updateField('firstAidDetails', e.target.value)}
                  />
                </div>
              )}

              <SwitchField
                label="Emergency Services Contacted"
                value={form.emergencyServicesContacted}
                onChange={(v) => updateField('emergencyServicesContacted', v)}
              />

              <SwitchField
                label="Mobility Aids in Use"
                value={form.mobilityAidsInUse}
                onChange={(v) => updateField('mobilityAidsInUse', v)}
              />

              <SwitchField
                label="Proper Footwear Worn"
                value={form.properFootwear}
                onChange={(v) => updateField('properFootwear', v)}
              />

              <div className="sm:col-span-2">
                <L>Contributing Factors / Comments</L>
                <Textarea
                  rows={3}
                  value={form.fallContributingFactors}
                  onChange={(e) => updateField('fallContributingFactors', e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ====================  MEDICATION INCIDENT  ====================== */}
        {form.incidentType === 'Medication' && (
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Medication Incident</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <L>Scheduled Date &amp; Time</L>
                <Input
                  type="datetime-local"
                  value={form.medicationScheduledDateTime}
                  onChange={(e) => updateField('medicationScheduledDateTime', e.target.value)}
                />
              </div>

              <div>
                <L>Type of Medication Incident</L>
                <Select
                  value={form.medicationIncidentType}
                  onValueChange={(v) => updateField('medicationIncidentType', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'MissedDose',
                      'WrongTime',
                      'WrongDose',
                      'WrongRoute',
                      'WrongMedication',
                      'WrongClient',
                      'StorageError',
                      'ProcessingError',
                      'DocumentationError',
                      'MedicationRefusal',
                      'NearMiss',
                      'SupplyNotAvailable',
                      'Other',
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <L>Description of Medication Incident</L>
                <Textarea
                  rows={4}
                  value={form.medicationIncidentDescription}
                  onChange={(e) => updateField('medicationIncidentDescription', e.target.value)}
                />
              </div>

              <SwitchField
                label="Did the Client Receive Medications?"
                value={form.clientReceivedMedication}
                onChange={(v) => updateField('clientReceivedMedication', v)}
              />

              <div>
                <L>Pharmacist Name</L>
                <Input
                  value={form.pharmacistName}
                  onChange={(e) => updateField('pharmacistName', e.target.value)}
                />
              </div>

              <div>
                <L>Pharmacist Conversation Time</L>
                <Input
                  type="time"
                  value={form.pharmacistConversationTime}
                  onChange={(e) => updateField('pharmacistConversationTime', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <L>Instructions Given by Pharmacist</L>
                <Textarea
                  rows={3}
                  value={form.pharmacistInstructions}
                  onChange={(e) => updateField('pharmacistInstructions', e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ========================= Notifications ========================= */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Persons Notified</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SwitchField
              label="Emergency Services"
              value={form.emergencyServicesNotified}
              onChange={(v) => updateField('emergencyServicesNotified', v)}
            />
            <SwitchField
              label="Family / Guardian"
              value={form.familyGuardianNotified}
              onChange={(v) => updateField('familyGuardianNotified', v)}
            />
            <SwitchField
              label="Site Supervisor"
              value={form.siteSupervisorNotified}
              onChange={(v) => updateField('siteSupervisorNotified', v)}
            />
            <SwitchField
              label="On‑Call Supervisor"
              value={form.onCallSupervisorNotified}
              onChange={(v) => updateField('onCallSupervisorNotified', v)}
            />
            <SwitchField
              label="Crisis Team"
              value={form.crisisTeamNotified}
              onChange={(v) => updateField('crisisTeamNotified', v)}
            />
            <SwitchField
              label="Emergency Contact on File"
              value={form.emergencyContactNotified}
              onChange={(v) => updateField('emergencyContactNotified', v)}
            />
          </div>

          {form.emergencyServicesNotified && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
              <div>
                <L>Service Type</L>
                <Select
                  value={form.emergencyServiceType}
                  onValueChange={(v) => updateField('emergencyServiceType', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Police">Police</SelectItem>
                    <SelectItem value="Ambulance">Ambulance</SelectItem>
                    <SelectItem value="Fire">Fire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <L>Responder Name</L>
                <Input
                  value={form.emergencyServiceResponderName}
                  onChange={(e) => updateField('emergencyServiceResponderName', e.target.value)}
                  placeholder="Officer / Paramedic"
                />
              </div>

              <div>
                <L>Badge / ID Number</L>
                <Input
                  value={form.emergencyServiceBadgeNumber}
                  onChange={(e) => updateField('emergencyServiceBadgeNumber', e.target.value)}
                  placeholder="Badge #"
                />
              </div>

              <div>
                <L>File / Case Number</L>
                <Input
                  value={form.emergencyServiceFileNumber}
                  onChange={(e) => updateField('emergencyServiceFileNumber', e.target.value)}
                  placeholder="Case #"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <L>Name of Person Spoken To / Message Left</L>
              <Input
                value={form.notificationName}
                onChange={(e) => updateField('notificationName', e.target.value)}
              />
            </div>
            <div>
              <L>Time of Conversation</L>
              <Input
                type="time"
                value={form.notificationTime}
                onChange={(e) => updateField('notificationTime', e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <L>Notes from Conversation</L>
              <Textarea
                rows={3}
                value={form.notificationNotes}
                onChange={(e) => updateField('notificationNotes', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* =================== Staff Signature ============================ */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Report Completion</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <L>Staff Name</L>
              <Input
                value={form.staffName}
                onChange={(e) => updateField('staffName', e.target.value)}
              />
            </div>
            <div>
              <L>Position</L>
              <Input
                value={form.staffPosition}
                onChange={(e) => updateField('staffPosition', e.target.value)}
              />
            </div>
            <div>
              <L>Date</L>
              <Input
                type="date"
                value={form.reportDate}
                onChange={(e) => updateField('reportDate', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ======================  WITNESSES  ============================= */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Witnesses</h3>

          {(form.witnesses ?? []).map((w, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 border p-4 rounded-md">
              <div>
                <L>Witness Name</L>
                <Input
                  value={w.name}
                  onChange={(e) => updateWitnessField(idx, 'name', e.target.value)}
                />
              </div>
              <div>
                <L>Contact Info</L>
                <Input
                  value={w.contact}
                  onChange={(e) => updateWitnessField(idx, 'contact', e.target.value)}
                />
              </div>
              <div className="sm:col-span-3">
                <L>Statement / Notes</L>
                <Textarea
                  rows={2}
                  value={w.statement}
                  onChange={(e) => updateWitnessField(idx, 'statement', e.target.value)}
                />
              </div>
            </div>
          ))}

          <Button type="button" onClick={addWitness} variant="outline">
            + Add Witness
          </Button>
        </section>

        {/* ================= Supervisor Review ======================== */}
      </fieldset>
      {/* ╚════════ End of staff‑editable part ════════════════════════════╝ */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Supervisor Review</h3>
        <fieldset
          disabled={supervisorSectionDisabled}
          className={supervisorSectionDisabled ? 'opacity-50 cursor-not-allowed' : undefined}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Workflow Status selects */}
            <div>
              <L>Workflow Status</L>
              <Select
                value={form.workflowStatus}
                onValueChange={(v) => updateField('workflowStatus', v)}
                disabled={supervisorSectionDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="InReview">In Review</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reviewed‑at timestamp */}
            <div>
              <L>Supervisor Reviewed At</L>
              <Input
                type="datetime-local"
                value={form.supervisorReviewedAt}
                onChange={(e) => updateField('supervisorReviewedAt', e.target.value)}
              />
            </div>
          </div>

          {/* Notes & corrective actions */}
          <div className="grid gap-4 mt-4">
            <div>
              <L>Supervisor Notes</L>
              <Textarea
                rows={3}
                value={form.supervisorNotes}
                onChange={(e) => updateField('supervisorNotes', e.target.value)}
              />
            </div>
            <div>
              <L>Corrective / Follow‑up Actions</L>
              <Textarea
                rows={3}
                value={form.correctiveActions}
                onChange={(e) => updateField('correctiveActions', e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <SwitchField
                label="Follow‑Up Required"
                value={form.followUpRequired}
                onChange={(v) => updateField('followUpRequired', v)}
                disabled={supervisorSectionDisabled}
              />
            </div>
          </div>

          {/* Follow‑up scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <L>Follow‑Up Due Date</L>
              <Input
                type="date"
                value={form.followUpDueDate}
                onChange={(e) => updateField('followUpDueDate', e.target.value)}
              />
            </div>

            <div>
              <L>Follow‑Up Completed At</L>
              <Input
                type="datetime-local"
                value={form.followUpCompletedAt}
                onChange={(e) => updateField('followUpCompletedAt', e.target.value)}
              />
            </div>
          </div>
        </fieldset>
      </section>

      {/* ======================= Submit placeholder ===================== */}
      <div className="pt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Report'}
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reusable sub‑component                                                     */
/* -------------------------------------------------------------------------- */

type SwitchFieldProps = {
  label: string;
  value?: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
};

function SwitchField({ label, value, onChange, disabled = false }: SwitchFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={!!value} onCheckedChange={onChange} id={label} disabled={disabled} />
      <Label htmlFor={label} className={disabled ? 'opacity-50 cursor-not-allowed' : undefined}>
        {label}
      </Label>
    </div>
  );
}
