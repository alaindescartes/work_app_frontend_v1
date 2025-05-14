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

const dummyTask: Partial<TaskInsert> = {
  description: 'Sweep common area',
  groupHomeId: 2,
  residentId: 10,
};

function EditTaskForm() {
  const [formData, setFormData] = useState<Partial<TaskInsert>>(dummyTask);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

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

    setIsSubmitting(true);
    console.log('Updating task:', formData);

    // TODO: send update to API
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div>
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
        >
          Update Task
        </Button>
      </form>
    </div>
  );
}

export default EditTaskForm;
