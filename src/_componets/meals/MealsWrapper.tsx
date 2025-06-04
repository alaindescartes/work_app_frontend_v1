import EnterMeals from '@/_componets/meals/EnterMeals';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import ShowMeals from '@/_componets/meals/ShowMeals';

export default function MealsWrapper() {
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
            <EnterMeals />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/*  Meals prepared */}
      <ShowMeals />
    </div>
  );
}
