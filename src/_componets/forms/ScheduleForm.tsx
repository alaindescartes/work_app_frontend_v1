import React, { useState } from 'react';
import { ScheduleInsert } from '@/interfaces/scheduleInterface';
import { useAddScheduleMutation } from '@/redux/slices/scheduleSlice';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScheduleFormProps {
  /** Called with the array of schedules after successful submit */
  onSubmit?: (schedules: ScheduleInsert[]) => void;
}

/**
 * ScheduleForm
 * -------------
 * Allows the user to build one or more schedules before submitting.
 * Purple‑toned Tailwind styles throughout to match design preference.
 */
export default function ScheduleForm({ onSubmit }: ScheduleFormProps) {
  const groupHomeId = useSelector((state: RootState) => state.grouphome.grouphomeInfo.id);
  const residents = useSelector((state: RootState) => state.grouphome.residents);
  const blank: ScheduleInsert = {
    residentId: 0,
    groupHomeId: groupHomeId ? groupHomeId : 0,
    title: '',
    description: '',
    start_time: new Date(),
    end_time: new Date(),
    is_recurring: false,
    schedule_type: 'appointment',
  };

  const [forms, setForms] = useState<ScheduleInsert[]>([blank]);
  const [savedSchedules, setSavedSchedules] = useState<ScheduleInsert[]>([]);
  const [addSchedule, { isLoading }] = useAddScheduleMutation();

  /** Update a single field in the `forms` array */
  const updateField = (
    idx: number,
    key: keyof ScheduleInsert,
    value: ScheduleInsert[keyof ScheduleInsert]
  ) => {
    setForms((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
  };

  /** Save current filled forms locally and reset UI to a blank entry */
  const addForm = () => {
    // Only push non‑empty forms (simple title check)
    const filled = forms.filter((f) => f.title.trim() !== '');
    if (filled.length) {
      setSavedSchedules((prev) => [...prev, ...filled]);
    }
    // Reset with one blank schedule
    setForms([{ ...blank }]);
  };

  /** Remove a schedule form */
  const removeForm = (idx: number) => setForms((prev) => prev.filter((_, i) => i !== idx));

  /** Submit handler: send all schedules in one batch */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = [...savedSchedules, ...forms.filter((f) => f.title.trim() !== '')];
    if (!payload.length) return;
    // Show a loading toast and keep its id so we can update it
    const toastId = toast.loading('Saving…');

    try {
      await addSchedule(payload).unwrap();

      // Update the same toast to success ‑ green bg, white text
      toast.success('', {
        id: toastId,
        description: 'Schedules saved successfully',
        style: { background: '#16a34a', color: '#fff' },
      });

      onSubmit?.(payload);

      // Clear both local buffers after a successful save
      setForms([{ ...blank }]);
      setSavedSchedules([]);
    } catch (err) {
      // Update the same toast to error ‑ red bg, white text
      toast.error('', {
        id: toastId,
        description: 'Could not save schedules',
        style: { background: '#dc2626', color: '#fff' },
      });

      if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
        console.error('Failed to save schedules:', err);
      }
      // TODO: log in a logging service
    }
  };

  return (
    <>
      {savedSchedules.length > 0 && (
        <span className="block text-sm text-purple-700 mb-2">
          Saved drafts: {savedSchedules.length}
        </span>
      )}
      <form onSubmit={handleSubmit} className="w-full h-full overflow-y-auto space-y-8 p-4">
        {forms.map((f, idx) => (
          <fieldset key={idx} className="border border-purple-300 rounded-md p-4 space-y-4">
            <legend className="px-2 text-purple-700 font-semibold">Schedule {idx + 1}</legend>

            {/* Resident & Group Home */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col text-sm">
                <span className="text-purple-600">Resident</span>

                <Select
                  value={f.residentId ? f.residentId.toString() : ''}
                  onValueChange={(val) => updateField(idx, 'residentId', Number(val))}
                >
                  <SelectTrigger className="w-[180px] h-[28px] border rounded px-2 py-1 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select Resident" />
                  </SelectTrigger>

                  <SelectContent>
                    {residents.map((resident) => (
                      <SelectItem key={resident.id} value={resident.id.toString()}>
                        {resident.firstName} {resident.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col text-sm">
                <span className="text-purple-600">Group Home ID</span>
                <input
                  type="number"
                  disabled={true}
                  value={groupHomeId}
                  onChange={(e) => updateField(idx, 'groupHomeId', Number(e.target.value))}
                  className="border rounded px-2 py-1 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </label>
            </div>

            {/* Title */}
            <label className="flex flex-col text-sm">
              <span className="text-purple-600">Title</span>
              <input
                type="text"
                value={f.title}
                onChange={(e) => updateField(idx, 'title', e.target.value)}
                className="border rounded px-2 py-1 focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </label>

            {/* Description */}
            <label className="flex flex-col text-sm">
              <span className="text-purple-600">Description</span>
              <textarea
                value={f.description}
                onChange={(e) => updateField(idx, 'description', e.target.value)}
                className="border rounded px-2 py-1 focus:border-purple-500 focus:ring-purple-500 min-h-[80px]"
              />
            </label>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col text-sm">
                <span className="text-purple-600">Start Time</span>
                <input
                  type="datetime-local"
                  value={f.start_time.toISOString().slice(0, 16)}
                  onChange={(e) => updateField(idx, 'start_time', new Date(e.target.value))}
                  className="border rounded px-2 py-1 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="text-purple-600">End Time</span>
                <input
                  type="datetime-local"
                  value={f.end_time.toISOString().slice(0, 16)}
                  onChange={(e) => updateField(idx, 'end_time', new Date(e.target.value))}
                  className="border rounded px-2 py-1 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </label>
            </div>

            {/* Recurring & Type */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={f.is_recurring}
                  onChange={(e) => updateField(idx, 'is_recurring', e.target.checked)}
                  className="accent-purple-600"
                />
                <span className="text-sm text-purple-700">Is Recurring</span>
              </label>

              <label className="flex flex-col text-sm">
                <span className="text-purple-600">Schedule Type</span>
                <select
                  value={f.schedule_type}
                  onChange={(e) =>
                    updateField(
                      idx,
                      'schedule_type',
                      e.target.value as ScheduleInsert['schedule_type']
                    )
                  }
                  className="border rounded px-2 py-1 focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="appointment">Appointment</option>
                  <option value="daily-care">Daily Care</option>
                  <option value="outing">Outing</option>
                </select>
              </label>
            </div>

            {/* Notes */}
            <label className="flex flex-col text-sm">
              <span className="text-purple-600">Notes</span>
              <textarea
                value={f.notes ?? ''}
                onChange={(e) => updateField(idx, 'notes', e.target.value)}
                className="border rounded px-2 py-1 focus:border-purple-500 focus:ring-purple-500 min-h-[60px]"
              />
            </label>

            {/* Remove button (only show if multiple forms) */}
            {forms.length > 1 && (
              <button
                type="button"
                onClick={() => removeForm(idx)}
                className="text-purple-500 hover:text-purple-700 text-sm self-end"
              >
                Remove this schedule
              </button>
            )}
          </fieldset>
        ))}

        {/* Add another schedule */}
        <div className="sticky bottom-0 left-0 right-0 bg-white py-2 flex justify-between items-center">
          <button
            type="button"
            onClick={addForm}
            className="cursor-pointer text-purple-500 hover:text-purple-700 border border-purple-500 hover:border-purple-700 rounded px-3 py-1 text-sm"
          >
            Save &amp; Add another
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded shadow"
          >
            {isLoading ? 'Saving…' : 'Save Schedules'}
          </button>
        </div>
      </form>
    </>
  );
}
