import React, { useEffect, useState, useCallback } from "react";
import Task from "./Task";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CompletedTask, Task as TaskFetch } from "@/interfaces/taskInterface";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ResidentFetch } from "@/interfaces/clientInterface";

interface TaskListProps {
  flag: (hasUnsaved: boolean) => void;
}

function TaskList({ flag }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskFetch[]>([]);
  const [clients, setClients] = useState<ResidentFetch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [taskStatuses, setTaskStatuses] = useState<
    Record<number, "pending" | "completed" | "not-done">
  >({});

  const currentGroupHomeId = useSelector(
    (state: RootState) => state.reducer.grouphome.grouphomeInfo.id
  );
  const currentGroupHomeName = useSelector(
    (state: RootState) => state.reducer.grouphome.grouphomeInfo.name
  );
  const [completedTask, setCompletedTask] = useState<CompletedTask[]>([]);

  useEffect(() => {
    console.log("CompletedTask: ", completedTask);
  }, [completedTask]);

  const getClientForHome = async (value: string) => {
    //fetch residents associated to a home
    try {
      const residents = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/find-residents/${value}`,
        {
          credentials: "include",
          method: "GET",
        }
      );
      if (residents.ok) {
        const data = await residents.json();
        setClients(data.residentsData);
      }
    } catch (error: any) {
      if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
        console.log("error adding tasks", error.message);
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
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks);
          // initialise status map for each fetched task
          const statusMap: Record<
            number,
            "pending" | "completed" | "not-done"
          > = {};
          if (Array.isArray(data.tasks)) {
            data.tasks.forEach((t: TaskFetch) => {
              statusMap[t.id] = t.status as
                | "pending"
                | "completed"
                | "not-done";
            });
          }
          setTaskStatuses(statusMap);
          await getClientForHome(currentGroupHomeId.toString());
        }
      } catch (e: any) {
        if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
          console.log(e.message);
        }
        //TODO:log data to data system
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksPerHome();
  }, [currentGroupHomeId]);

  const handleStatusChange = useCallback(
    (taskId: number, newStatus: "pending" | "completed" | "not-done") => {
      setTaskStatuses((prev) => {
        if (newStatus === "pending") {
          const { [taskId]: _omit, ...rest } = prev;
          return rest; // remove key
        }
        return { ...prev, [taskId]: newStatus };
      });

      // sync completedTask list
      setCompletedTask((prev) => {
        const idx = prev.findIndex((t) => t.id === taskId);

        if (newStatus === "completed") {
          if (idx !== -1) return prev; // already stored
          const fullTask = tasks.find((t) => t.id === taskId);
          if (!fullTask) return prev;
          return [
            ...prev,
            {
              ...fullTask,
              completedAt: fullTask.completedAt || new Date().toISOString(),
            } as CompletedTask,
          ];
        }

        // any status other than completed removes from the list
        return idx === -1 ? prev : prev.filter((t) => t.id !== taskId);
      });
    },
    [tasks]
  );

  const handleCompleteTask = (task: CompletedTask) => {
    setCompletedTask((prev) => {
      // don't push duplicates
      if (prev.some((t) => t.id === task.id)) return prev;
      return [...prev, task];
    });
  };

  /*
   * Unsaved changes exist when *any* task in `taskStatuses`
   * has a status other than "pending".
   */
  const hasNonPending = Object.values(taskStatuses).some(
    (s) => s !== "pending"
  );

  useEffect(() => {
    flag(hasNonPending); // true blocks tab_switching
  }, [hasNonPending, flag]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 animate-pulse rounded-lg"
            />
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
                        statusState={taskStatuses[task.id] ?? "pending"}
                        onStatusChange={(newStatus) =>
                          handleStatusChange(task.id, newStatus)
                        }
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
              {currentGroupHomeName || "Group Home Tasks"}
            </AccordionTrigger>
            <AccordionContent>
              {Array.isArray(tasks) &&
              tasks.filter((task) => !task.residentId).length > 0 ? (
                tasks
                  .filter((task) => !task.residentId)
                  .map((task) => (
                    <Task
                      key={task.id}
                      id={task.id}
                      description={task.description}
                      groupHomeId={task.groupHomeId}
                      residentId={task.residentId}
                      statusState={taskStatuses[task.id] ?? "pending"}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(task.id, newStatus)
                      }
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
