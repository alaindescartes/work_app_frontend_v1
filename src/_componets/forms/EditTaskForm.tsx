import React, { useState } from "react";
import { Task, TaskInsert } from "@/interfaces/taskInterface";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect } from "react";
import { GroupHomeFetch } from "@/interfaces/groupHomeInterface";
import { ResidentFetch } from "@/interfaces/clientInterface";
import Link from "next/link";
import { toast } from "sonner";

const dummyTask: Partial<TaskInsert> = {
  description: "Sweep common area",
  groupHomeId: 2,
  residentId: 10,
};

function EditTaskForm() {
  const [formData, setFormData] = useState<Partial<TaskInsert>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [madeChoice, setMadeChoice] = useState<boolean>(false);
  const [homes, setHomes] = useState<GroupHomeFetch[]>([]);
  const [clients, setClients] = useState<ResidentFetch[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: boolean } = {};
    const requiredFields = ["description", "groupHomeId"];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof TaskInsert]) {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/task-route/edit-task/${currentTask?.id}`,
        {
          credentials: "include",
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        toast("successfully edited this task", {
          style: { backgroundColor: "green", color: "white" },
        });
        // Refresh the task list for the selected group home
        if (formData.groupHomeId) {
          await getTaskByHome(String(formData.groupHomeId));
        }
        setCurrentTask(null);
        setMadeChoice(false);
        setFormData({});
      }
    } catch (error: any) {
      toast("could not edit this task", {
        style: { backgroundColor: "red", color: "white" },
      });
      if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
        console.log("error adding tasks", error.message);
      }
      //TODO:log to a logging service
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTaskByHome = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/task-route/all-GroupHome-task/${id}`,
        {
          credentials: "include",
          method: "GET",
        }
      );

      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (error: any) {
      if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
        console.log("error adding tasks", error.message);
      }
      //TODO:log to a logging service
    }
  };

  const getClientForHome = async (value: string) => {
    setFormData((prev) => ({
      ...prev,
      groupHomeId: Number(value),
      residentId: undefined,
    }));

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
        getTaskByHome(value);
      }
    } catch (error: any) {
      if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
        console.log("error adding tasks", error.message);
      }
      //TODO:log to a logging service
    }
  };

  useEffect(() => {
    const fetchAllHomes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/get-grouphomes`,
          {
            credentials: "include",
            method: "GET",
          }
        );

        if (res.ok) {
          const allHomes = await res.json();
          setHomes(allHomes.groupHomes);
        }
      } catch (error: any) {
        if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
          console.log("error adding tasks", error.message);
        }
        //TODO:log to a logging service
      }
    };

    fetchAllHomes();
  }, []);

  return (
    <div>
      {/* home selection */}
      <div className="mb-6 p-4 bg-white border border-purple-200 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-purple-700 mb-3">
          Select home to continue
        </h2>
        <Select
          value={formData.groupHomeId?.toString() || ""}
          onValueChange={(value) => getClientForHome(value)}
        >
          <SelectTrigger
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 shadow-sm ${
              errors.groupHomeId
                ? "border-red-500 focus:ring-red-500"
                : "border-purple-300 focus:ring-purple-500"
            }`}
          >
            <SelectValue placeholder="Select a Group Home" />
          </SelectTrigger>
          <SelectContent>
            {homes.map((home) => (
              <SelectItem value={home.id.toString()} key={home.id}>
                {home.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* task display for edit */}
      <div className="space-y-4 mb-6">
        {tasks &&
          tasks.length !== 0 &&
          tasks.map((task) =>
            currentTask?.id === task.id ? (
              <div
                key={task.id}
                className="flex flex-col bg-white border border-purple-400 rounded-lg shadow-md p-4 ring-2 ring-purple-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="text-gray-800 font-medium text-base">
                    {task.description}
                  </p>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    Currently editing this task
                  </span>
                </div>
                {/* Cancel Edit button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setCurrentTask(null);
                      setMadeChoice(false);
                      setFormData({});
                    }}
                    className="text-sm font-semibold text-red-700 border border-red-200 bg-red-50 px-4 py-1 rounded hover:bg-red-100 transition"
                  >
                    Cancel Edit
                  </button>
                </div>
                {madeChoice && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Description <span className="text-red-700">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 shadow-sm resize-y min-h-[80px] leading-relaxed ${
                          errors.description
                            ? "border-red-500 focus:ring-red-500"
                            : "border-purple-300 focus:ring-purple-500"
                        }`}
                        placeholder="Task description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Group Home <span className="text-red-700">*</span>
                      </label>
                      <Select
                        value={formData.groupHomeId?.toString() || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            groupHomeId: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger
                          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 shadow-sm ${
                            errors.groupHomeId
                              ? "border-red-500 focus:ring-red-500"
                              : "border-purple-300 focus:ring-purple-500"
                          }`}
                        >
                          <SelectValue placeholder="Select a Group Home" />
                        </SelectTrigger>
                        <SelectContent>
                          {homes.map((home) => (
                            <SelectItem
                              key={home.id}
                              value={home.id.toString()}
                            >
                              {home.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-600 mb-1">
                        Resident (optional)
                      </label>
                      <Select
                        value={formData.residentId?.toString() || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            residentId: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm">
                          <SelectValue placeholder="Select a Resident (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem
                              value={client.id.toString()}
                              key={client.id}
                            >
                              {client.firstName} {client.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
                    >
                      {isSubmitting ? "Saving changes..." : "Save Changes"}
                    </Button>
                  </form>
                )}
              </div>
            ) : !madeChoice ? (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <p className="text-gray-800 font-medium text-base">
                    {task.description}
                  </p>
                </div>
                <div className="flex space-x-3 mt-3 sm:mt-0">
                  <button
                    onClick={() => {
                      setCurrentTask(task);
                      setFormData(task);
                      setMadeChoice(true);
                    }}
                    className="text-sm text-blue-600 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                  <Button
                    variant="destructive"
                    className="text-sm px-3 py-1 h-auto"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : null
          )}
      </div>
    </div>
  );
}

export default EditTaskForm;
