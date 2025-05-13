import React from "react";
import Task from "./Task";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const dummyGroupHomes = [
  { id: 101, name: "Sunrise Group Home" },
  { id: 102, name: "Harmony Group Home" },
];

const dummyResidents = [{ id: 5, name: "Resident A" }];

const dummyTasks = [
  {
    id: 1,
    description: "Clean the common area",
    groupHomeId: 101,
    residentId: null,
    status: "pending" as "pending" | "completed",
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    description: "Administer medication to Resident A",
    groupHomeId: 101,
    residentId: 5,
    status: "completed" as "pending" | "completed",
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    description: "Prepare lunch",
    groupHomeId: 102,
    residentId: null,
    status: "pending" as "pending" | "completed",
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function TaskList() {
  const tasksByGroupHome = dummyGroupHomes.map((home) => ({
    ...home,
    tasks: dummyTasks.filter(
      (task) => task.groupHomeId === home.id && !task.residentId
    ),
  }));

  const tasksByResident = dummyResidents.map((resident) => ({
    ...resident,
    tasks: dummyTasks.filter((task) => task.residentId === resident.id),
  }));

  return (
    <div className="space-y-6">
      <Accordion type="multiple">
        {tasksByGroupHome.map((home) => (
          <AccordionItem key={home.id} value={`home-${home.id}`}>
            <AccordionTrigger className="text-lg font-semibold">
              {home.name}
            </AccordionTrigger>
            <AccordionContent>
              {home.tasks.length > 0 ? (
                home.tasks.map((task) => (
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
                  />
                ))
              ) : (
                <p className="text-gray-500">No tasks available.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Accordion type="multiple">
        {tasksByResident.map((resident) => (
          <AccordionItem key={resident.id} value={`resident-${resident.id}`}>
            <AccordionTrigger className="text-lg font-semibold">
              {resident.name}
            </AccordionTrigger>
            <AccordionContent>
              {resident.tasks.length > 0 ? (
                resident.tasks.map((task) => (
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
                  />
                ))
              ) : (
                <p className="text-gray-500">No tasks available.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default TaskList;
