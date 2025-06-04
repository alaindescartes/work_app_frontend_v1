import { format } from 'date-fns';

type MealLog = {
  date: string; // ISO date only
  meal: 'breakfast' | 'lunch' | 'supper' | 'snack';
  description: string;
};

/* ---------- fake records for UI demo ---------- */
const dummyMeals: MealLog[] = [
  { date: '2025-06-03', meal: 'breakfast', description: 'Oatmeal with fresh berries & coffee' },
  { date: '2025-06-03', meal: 'lunch', description: 'Grilled chicken salad, multigrain roll' },
  { date: '2025-06-03', meal: 'supper', description: 'Baked salmon, steamed veggies, brown rice' },
  { date: '2025-06-03', meal: 'snack', description: 'Fruit cup' },

  { date: '2025-06-02', meal: 'breakfast', description: 'Scrambled eggs, toast, orange juice' },
  { date: '2025-06-02', meal: 'lunch', description: 'Turkey sandwich, tomato soup' },
  { date: '2025-06-02', meal: 'supper', description: 'Beef stir‑fry with noodles' },
];

export default function ShowMeals() {
  const grouped = dummyMeals.reduce<Record<string, MealLog[]>>((acc, m) => {
    (acc[m.date] ||= []).push(m);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1)); // newest first

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4">
      {dates.map(d => (
        <div key={d} className="rounded-lg border border-gray-200 bg-white shadow-md">
          <header className="rounded-t-lg bg-purple-600 px-4 py-2 text-white font-semibold">
            {format(new Date(d), 'EEEE, MMM d yyyy')}
          </header>

          <ul className="divide-y">
            {grouped[d].map(meal => (
              <li
                key={meal.meal}
                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between px-4 py-3"
              >
                <span className="capitalize font-medium text-gray-700">{meal.meal}</span>
                <p className="text-sm text-gray-600 sm:text-right">{meal.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
