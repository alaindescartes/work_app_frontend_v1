import { format, parse } from 'date-fns';

export interface MealFetch {
  id: number;
  home_id: number;
  staff_id: number;
  staffFirstName: string;
  staffLastName: string;
  meal_date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string | null;
  created_at: string;
}

interface Props {
  meals: MealFetch[];
}

export default function ShowMeals({ meals }: Props) {
  if (!meals.length)
    return <p className="text-center text-sm text-gray-500">No meals recorded for this period.</p>;

  const grouped = meals.reduce<Record<string, MealFetch[]>>((acc, m) => {
    (acc[m.meal_date] ||= []).push(m);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1)); // newest first

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4">
      {dates.map(d => (
        <div key={d} className="rounded-lg border border-gray-200 bg-white shadow-md">
          <header className="rounded-t-lg bg-purple-600 px-4 py-2 text-white font-semibold">
            {format(parse(d, 'yyyy-MM-dd', new Date()), 'EEEE, MMM d yyyy')}
          </header>

          <ul className="divide-y">
            {grouped[d].map(meal => (
              <li
                key={meal.id}
                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="capitalize font-medium text-gray-700">{meal.type}</span>
                  <span className="text-xs text-gray-400">
                    ({meal.staffFirstName} {meal.staffLastName})
                  </span>
                </div>
                <p className="text-sm text-gray-600 sm:text-right">{meal.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
