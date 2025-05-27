/**
 * Canonical shape of an Incident Report as stored / retrieved from the backend.
 *
 * Naming follows the same camelCase keys used in the React form so that data can
 * be passed back‑and‑forth without additional mapping.
 *
 * Required fields (non‑optional) are the minimum dataset needed to satisfy:
 *   • Referential integrity (link to resident, staff, group home)
 *   • Regulatory “critical information” for an occurrence (what / when / severity)
 *   • Basic workflow handling (draft → closed)
 *
 * Everything else is optional because it may be added later in the lifecycle
 * (e.g., fall details, witnesses, supervisor review).
 */
export interface IncidentReportInterface {
  /* ---------- core identifiers (required) ---------- */
  groupHomeId: number; // which site the incident occurred in
  residentId: number; // primary person affected
  staffId: number; // reporter / author of the form
  incidentDateTime: string; // ISO‑8601 timestamp
  incidentType: 'Injury' | 'Fall' | 'Aggression' | 'Medication' | 'Property' | 'NearMiss' | 'Other';
  severityLevel: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  description: string; // objective narrative
  followUpRequired: boolean; // drives workflow & SLA tracking
  workflowStatus: 'Draft' | 'Submitted' | 'InReview' | 'Closed';

  /* ---------- generic fields ---------- */
  id?: string; // DB‑generated UUID
  preIncidentContext?: string;
  postIncidentContext?: string;
  nearMissDescription?: string;
  immediateActions?: string;

  followUpDueDate?: string; // YYYY‑MM‑DD
  followUpCompletedAt?: string; // ISO‑8601
  supervisorReviewedAt?: string; // ISO‑8601

  /* ---------- fall‑specific ---------- */
  fallLocation?: string;
  fallWitnessed?: boolean;
  previousFall?: boolean;
  injuriesSustained?: boolean;
  injuriesDescription?: string;
  firstAidProvided?: boolean;
  firstAidDetails?: string;
  emergencyServicesContacted?: boolean;
  mobilityAidsInUse?: boolean;
  properFootwear?: boolean;
  fallContributingFactors?: string;

  /* ---------- medication incident ---------- */
  medicationScheduledDateTime?: string;
  medicationIncidentType?: string;
  medicationIncidentDescription?: string;
  clientReceivedMedication?: boolean;
  pharmacistName?: string;
  pharmacistConversationTime?: string;
  pharmacistInstructions?: string;

  /* ---------- notifications ---------- */
  emergencyServicesNotified?: boolean;
  familyGuardianNotified?: boolean;
  siteSupervisorNotified?: boolean;
  onCallSupervisorNotified?: boolean;
  crisisTeamNotified?: boolean;
  emergencyContactNotified?: boolean;
  notificationName?: string;
  notificationTime?: string;
  notificationNotes?: string;

  /* --- emergency services detail (if notified) --- */
  emergencyServiceType?: 'Police' | 'Ambulance' | 'Fire';
  emergencyServiceResponderName?: string;
  emergencyServiceBadgeNumber?: string;
  emergencyServiceFileNumber?: string;

  /* ---------- witnesses ---------- */
  witnesses?: Array<{
    name: string;
    contact: string;
    statement: string;
  }>;

  /* ---------- supervisor review ---------- */
  supervisorNotes?: string;
  correctiveActions?: string;

  /* ---------- staff sign‑off ---------- */
  staffName?: string;
  staffPosition?: string;
  reportDate?: string;

  /* ---------- audit‑trail fields ---------- */
  created_at?: string;
  updated_at?: string;
}

/**
 * Complete record as returned from the API (includes DB‑generated metadata).
 *
 * You can use this for GET /incident‑reports/:id or list queries.
 */
export type IncidentReportFetch = IncidentReportInterface;

/**
 * Payload shape for **staff** creating an incident report (POST).
 * Supervisor-only fields are omitted. Workflow status is fixed to "Draft".
 */
export type IncidentReportInsert = Omit<
  IncidentReportInterface,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'supervisorNotes'
  | 'correctiveActions'
  | 'supervisorReviewedAt'
> & {
  groupHomeId: number; // which site the incident occurred in
  residentId: number; // primary person affected
  staffId: number;
  incidentDateTime: string;
  incidentType: 'Injury' | 'Fall' | 'Aggression' | 'Medication' | 'Property' | 'NearMiss' | 'Other';
  severityLevel: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  description: string;
  followUpRequired: boolean;
  workflowStatus: 'Draft';
};
