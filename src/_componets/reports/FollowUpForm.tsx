'use client';

import { useState, useEffect } from 'react';
import { IncidentFollowUpFetch, IncidentFollowUpInsert } from '@/interfaces/followUp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FollowUpFormProps {
  incidentId: number; // report ID
  initial?: IncidentFollowUpFetch; // whole row, optional
  onCancel?: () => void; // optional close handler
}

export default function FollowUpForm({ incidentId, initial, onCancel }: FollowUpFormProps) {
  // ─── Local state ────────────────────────────────────────────
  const [title, setTitle] = useState(initial?.title ?? '');
  const [details, setDetails] = useState(initial?.details ?? '');
  /** store YYYY-MM-DD string; empty string means “not set” */
  const initialDateStr = initial?.dueDate
    ? initial.dueDate instanceof Date
      ? initial.dueDate.toISOString().substring(0, 10)
      : String(initial.dueDate).substring(0, 10)
    : '';
  const [dueDate, setDueDate] = useState(initialDateStr);
  const [status, setStatus] = useState<'Open' | 'InProgress' | 'Closed'>(
    (initial?.status as 'Open' | 'InProgress' | 'Closed') ?? 'InProgress'
  );
  const [saving, setSaving] = useState(false);

  // Keep local state in sync when a follow‑up row arrives after initial render
  useEffect(() => {
    setTitle(initial?.title ?? '');
    setDetails(initial?.details ?? '');
    setDueDate(
      initial?.dueDate
        ? initial.dueDate instanceof Date
          ? initial.dueDate.toISOString().substring(0, 10)
          : String(initial.dueDate).substring(0, 10)
        : ''
    );
    setStatus((initial?.status as 'Open' | 'InProgress' | 'Closed') ?? 'InProgress');
  }, [initial]);

  const followUpId = initial?.id;
  if (!followUpId) {
    return <div className="p-4 text-sm text-red-600">Cannot edit follow‑up: record not found.</div>;
  }
  console.log(initial);
  const valid = title.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!followUpId) {
      console.error('Follow‑up id missing – cannot update');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/edit-follow-up/${followUpId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incidentId,
            title: title.trim(),
            details: details.trim() || undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            status,
          } as IncidentFollowUpInsert),
        }
      );

      if (!res.ok) throw new Error(`API responded ${res.status}`);
      console.log('Follow-up updated successfully');
      // close the dialog if parent provided a handler
      onCancel?.();
    } catch (err) {
      console.error('Error updating follow-up:', err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-6 rounded-lg border bg-gray-50 p-6 shadow divide-y divide-gray-200"
    >
      <h2 className="text-lg font-semibold">{initial ? 'Edit Follow-Up' : 'New Follow-Up'}</h2>

      <div className="space-y-6 pb-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input
            className="w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Schedule GP appointment"
            required
          />
        </div>

        {/* Details */}
        <div>
          <label className="block text-sm font-medium mb-1">Details</label>
          <Textarea
            className="w-full"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional context, instructions, etc."
            rows={4}
          />
        </div>
      </div>

      {/* Due date & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <Input
            type="date"
            className="w-full"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as 'Open' | 'InProgress' | 'Closed')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-6">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!valid || saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
