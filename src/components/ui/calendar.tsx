'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReactDatePicker from 'react-datepicker';
import type { ComponentProps, ComponentPropsWithoutRef } from 'react';

type CalendarProps = ComponentPropsWithoutRef<typeof ReactDatePicker> & {
  /** Extra Tailwind classes for the calendar root. */
  className?: string;
};

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

import 'react-datepicker/dist/react-datepicker.css';

/** Minimal calendar wrapper around `react-datepicker` rendered inline. */
function Calendar({ className, ...props }: CalendarProps) {
  const restProps = props as ComponentProps<typeof ReactDatePicker>;

  return (
    <ReactDatePicker
      inline
      calendarClassName={cn('p-3', className)}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex justify-center pt-1 relative items-center w-full">
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-medium">{format(date, 'MMMM yyyy')}</span>
          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
      {...restProps}
    />
  );
}

export { Calendar };
