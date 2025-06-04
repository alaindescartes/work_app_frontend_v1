import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import type { MealLogPayload } from '@/_componets/meals/EnterMeals';
import EnterMeals from '@/_componets/meals/EnterMeals';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import ShowMeals from '@/_componets/meals/ShowMeals';
import type { MealFetch } from '@/_componets/meals/ShowMeals';
import { toast } from 'react-hot-toast';

export default function MealsWrapper() {
  const homeId = useSelector((s: RootState) => s.grouphome.grouphomeInfo.id);
  const staffId = useSelector((s: RootState) => s.user.userInfo.staffId);
  const [meals, setMeals] = useState<MealFetch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!homeId) return;
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meals/get-meals/${homeId}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const json = await res.json();
          setMeals(json.data ?? []);
        } else {
          console.error(await res.text());
          toast('Could not load meals', { style: { backgroundColor: 'red', color: 'white' } });
        }
      } catch (e) {
        console.error(e);
        toast('Network error', { style: { backgroundColor: 'red', color: 'white' } });
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [homeId]);

  const addMeal = async (meal: MealLogPayload) => {
    if (!homeId || !staffId) return;
    const payload = {
      home_id: homeId,
      staff_id: staffId,
      meal_date: meal.date,
      type: meal.meal,
      description: meal.description.trim(),
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meals/add-meal`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast('Meal added', { style: { backgroundColor: 'green', color: 'white' } });
        // refresh list
        const json = await res.json();
        setMeals(prev => [...prev, json.data]); // quick append
      } else {
        toast('Could not add meal', { style: { backgroundColor: 'red', color: 'white' } });
        console.error(await res.text());
      }
    } catch (e) {
      console.error(e);
      toast('Network error', { style: { backgroundColor: 'red', color: 'white' } });
    }
  };

  return (
    <div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger
            className={cn(
              'w-full rounded-md bg-purple-600 px-4 py-2 text-left',
              'text-sm font-semibold text-white shadow',
              'hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400',
              'flex items-center justify-between gap-3 transition',
              // when accordion is open
              'data-[state=open]:bg-purple-400 data-[state=open]:shadow-lg'
            )}
          >
            <span className="text-xl w-full text-center cursor-pointer">Enter Meals</span>
          </AccordionTrigger>
          <AccordionContent>
            <EnterMeals onSave={addMeal} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/*  Meals prepared */}
      {loading ? (
        <p className="text-center text-sm text-gray-500 mt-4">Loading meals…</p>
      ) : (
        <ShowMeals meals={meals} />
      )}
    </div>
  );
}
