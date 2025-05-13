import React, { useState } from 'react';
import { TaskInsert } from '@/interfaces/taskInterface';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

function TaskForm() {
  const [formData, setFormData] = useState<Partial<TaskInsert>>({});
  const [taskList, setTaskList] = useState<TaskInsert[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: boolean } = {};
    const requiredFields = ['description', 'groupHomeId'];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof TaskInsert]) {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setTaskList([...taskList, formData as TaskInsert]);
    setFormData({});
    setErrors({});
  };

  const handleSubmitAll = () => {
    setIsSubmitting(true);
    console.log('Submitting all tasks:', taskList);

    // TODO: replace with real API request
    setTimeout(() => {
      setIsSubmitting(false);
      setTaskList([]);
    }, 1000);
  };

  return (
    <div>
      <form
        onSubmit={handleAddTask}
        className="flex-1 bg-white p-8 rounded-xl shadow-lg space-y-5 border border-purple-200 w-full overflow-y-auto"
      >
        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-purple-600 mb-1">
            Description <span className="text-red-700">*</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 shadow-sm ${
              errors.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-purple-300 focus:ring-purple-500'
            }`}
            placeholder="Task description"
          />
        </div>

        {/* Group Home Select */}
        <div>
          <label className="block text-sm font-medium text-purple-600 mb-1">
            Group Home <span className="text-red-700">*</span>
          </label>
          <Select
            value={formData.groupHomeId?.toString() || ''}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, groupHomeId: Number(value) }))
            }
          >
            <SelectTrigger
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 shadow-sm ${
                errors.groupHomeId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-purple-300 focus:ring-purple-500'
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

        {/* Resident Select */}
        <div>
          <label className="block text-sm font-medium text-purple-600 mb-1">
            Resident (optional)
          </label>
          <Select
            value={formData.residentId?.toString() || ''}
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

        {/* Add Task Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
        >
          Add Task
        </Button>

        {/* Submit All Button */}
        <Button
          type="button"
          onClick={handleSubmitAll}
          disabled={isSubmitting || taskList.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
        >
          Submit All Tasks
        </Button>

        {/* Display added tasks */}
        {taskList.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-purple-700 font-semibold">Tasks to Submit:</h3>
            {taskList.map((task, index) => (
              <div
                key={index}
                className="text-sm bg-purple-50 border border-purple-200 p-2 rounded"
              >
                {task.description} — Group Home: {task.groupHomeId}{' '}
                {task.residentId ? `(Resident: ${task.residentId})` : ''}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default TaskForm;
