import React from "react";
import Task from "./Task";

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
  return (
    <div className="space-y-6">
      {dummyTasks.map((task) => (
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
      ))}
    </div>
  );
}

export default TaskList;
