import React from "react";
import TaskForm from "../forms/TaskForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditTaskForm from "../forms/EditTaskForm";

function AddTaskWrapper() {
  return (
    <div>
      <Tabs defaultValue="add-task" className="w-full">
        <TabsList className="flex w-full justify-between bg-gray-100 p-1 rounded-lg mb-4">
          <TabsTrigger
            value="add-task"
            className="w-full text-center px-4 py-2 rounded-md data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700 hover:bg-purple-200 transition"
          >
            Add tasks
          </TabsTrigger>
          <TabsTrigger
            value="edit"
            className="w-full text-center px-4 py-2 rounded-md data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700 hover:bg-purple-200 transition"
          >
            Edit tasks
          </TabsTrigger>
        </TabsList>
        <TabsContent value="add-task">
          <TaskForm />
        </TabsContent>
        <TabsContent value="edit">
          <EditTaskForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AddTaskWrapper;
