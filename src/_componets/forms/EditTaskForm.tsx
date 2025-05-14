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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    console.log("Updating task:", formData);

    // TODO: send update to API
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
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
      {currentTask && madeChoice && (
        <form
          onSubmit={handleSubmit}
          className="flex-1 bg-white p-8 rounded-xl shadow-lg space-y-5 border border-purple-200 w-full overflow-y-auto"
        >
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-1">
              Description <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 shadow-sm ${
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
                setFormData((prev) => ({ ...prev, groupHomeId: Number(value) }))
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
                <SelectItem value="1">Home 1</SelectItem>
                <SelectItem value="2">Home 2</SelectItem>
                <SelectItem value="3">Home 3</SelectItem>
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
                setFormData((prev) => ({ ...prev, residentId: Number(value) }))
              }
            >
              <SelectTrigger className="w-full p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm">
                <SelectValue placeholder="Select a Resident (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9">Resident A</SelectItem>
                <SelectItem value="10">Resident B</SelectItem>
                <SelectItem value="11">Resident C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
          >
            Update Task
          </Button>
        </form>
      )}
    </div>
  );
}

export default EditTaskForm;
