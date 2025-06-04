import { useState } from 'react';

export interface MealLogPayload {
  date: string;
  meal: 'breakfast' | 'lunch' | 'supper' | 'snack';
  description: string;
}

interface Props {
  onSave: (p: MealLogPayload) => void;
}

export default function EnterMeals({ onSave }: Props) {
  // Current date in America/Edmonton (MDT/MST) formatted as YYYY‑MM‑DD
  const todayISO = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [form, setForm] = useState<MealLogPayload>({
    date: todayISO,
    meal: 'breakfast',
    description: '',
  });

  const setMeal = (meal: MealLogPayload['meal']) => setForm(prev => ({ ...prev, meal }));

  const setDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, description: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setForm({ ...form, description: '' });
  };

  return (
    <section className="p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white shadow-md space-y-6 p-6"
      >
        <h1 className="text-2xl font-semibold text-purple-700">Enter Meal Log</h1>

        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Date:</span>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="rounded border px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Meal:</span>
          <select
            value={form.meal}
            onChange={e => setMeal(e.target.value as MealLogPayload['meal'])}
            className="rounded border px-2 py-1"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="supper">Supper</option>
            <option value="snack">Snack</option>
          </select>
        </label>

        <textarea
          value={form.description}
          onChange={setDescription}
          rows={4}
          placeholder="Describe the meal…"
          className="w-full rounded border px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={!form.description.trim()}
          className="w-full sm:w-auto inline-flex justify-center rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Save Meals
        </button>
      </form>
    </section>
  );
}
