import React, { useEffect, useState } from 'react';
import Task from './Task';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CompletedTask, Task as TaskFetch } from '@/interfaces/taskInterface';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ResidentFetch } from '@/interfaces/clientInterface';

function TaskList() {
  const [tasks, setTasks] = useState<TaskFetch>({
    completedAt: '',
    completedBy: 0,
    createdAt: '',
    description: '',
    groupHomeId: 0,
    id: 0,
    residentId: 0,
    status: 'pending',
    updatedAt: '',
  });
  const [clients, setClients] = useState<ResidentFetch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentGroupHomeId = useSelector(
    (state: RootState) => state.reducer.grouphome.grouphomeInfo.id
  );
  const currentGroupHomeName = useSelector(
    (state: RootState) => state.reducer.grouphome.grouphomeInfo.name
  );
  const [completedTask, setCompletedTask] = useState<CompletedTask[]>([]);

  const getClientForHome = async (value: string) => {
    //fetch residents associated to a home
    try {
      const residents = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/find-residents/${value}`,
        {
          credentials: 'include',
          method: 'GET',
        }
      );
      if (residents.ok) {
        const data = await residents.json();
        setClients(data.residentsData);
      }
    } catch (error: any) {
      if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
        console.log('error adding tasks', error.message);
      }
      //TODO:log to a logging service
    }
  };
  useEffect(() => {
    const fetchTasksPerHome = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/task-route/all-GroupHome-task/${currentGroupHomeId}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks);
          await getClientForHome(currentGroupHomeId.toString());
          console.log(data.tasks);
        }
      } catch (e: any) {
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.log(e.message);
        }
        //TODO:log data to data system
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksPerHome();
  }, [currentGroupHomeId]);

  const handleCompleteTask = (task: CompletedTask) => {
    setCompletedTask((prev) => [...prev, task]);
  };

  useEffect(() => {
    console.log(completedTask);
  }, [completedTask]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <Accordion type="multiple">
          {clients.map((client) => {
            const clientTasks = Array.isArray(tasks)
              ? tasks.filter((task) => task.residentId === client.id)
              : [];

            return (
              <AccordionItem key={client.id} value={`resident-${client.id}`}>
                <AccordionTrigger className="text-lg font-semibold">
                  {client.firstName} {client.lastName}
                </AccordionTrigger>
                <AccordionContent>
                  {clientTasks.length > 0 ? (
                    clientTasks.map((task) => (
                      <Task
                        key={task.id}
                        id={task.id}
                        description={task.description}
                        groupHomeId={task.groupHomeId}
                        residentId={task.residentId}
                        status={task.status}
                        completedAt={task.completedAt}
                        createdAt={task.createdAt}
                        updatedAt={task.updatedAt}
                        onComplete={handleCompleteTask}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500">No tasks available.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}

          <AccordionItem key="general-home-tasks" value="general-home">
            <AccordionTrigger className="text-lg font-semibold">
              {currentGroupHomeName || 'Group Home Tasks'}
            </AccordionTrigger>
            <AccordionContent>
              {Array.isArray(tasks) && tasks.filter((task) => !task.residentId).length > 0 ? (
                tasks
                  .filter((task) => !task.residentId)
                  .map((task) => (
                    <Task
                      key={task.id}
                      id={task.id}
                      description={task.description}
                      groupHomeId={task.groupHomeId}
                      residentId={task.residentId}
                      status={task.status}
                      completedAt={task.completedAt}
                      createdAt={task.createdAt}
                      updatedAt={task.updatedAt}
                      onComplete={handleCompleteTask}
                    />
                  ))
              ) : (
                <p className="text-gray-500">No general tasks available.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

export default TaskList;
