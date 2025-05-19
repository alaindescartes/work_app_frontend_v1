import { DisplayCalendar } from '@/_componets/schedules/DisplayCalendar';
import { useGetSchedulesQuery } from '@/redux/slices/scheduleSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ScheduleForm from '@/_componets/forms/ScheduleForm';

export function ScheduleWrapper() {
  const groupHomeId = useSelector((state: RootState) => state.grouphome.grouphomeInfo.id);
  const { data: schedules = [] } = useGetSchedulesQuery(groupHomeId);
  return (
    <>
      <div className="flex justify-center w-full my-4">
        <Dialog>
          <DialogTrigger asChild={true}>
            <Button className=" cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-colors">
              Add New Schedules
            </Button>
          </DialogTrigger>
          <DialogContent className="w-screen h-[90vh] max-w-none bg-white p-6 space-y-4 flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-center w-full">Schedule Form</DialogTitle>
              <DialogDescription></DialogDescription>
              <ScheduleForm />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <DisplayCalendar schedules={schedules} />
    </>
  );
}
