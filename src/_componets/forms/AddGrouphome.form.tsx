import React, { useState } from "react";
import { Button } from "@/components/ui/button";

function AddGroupHomeForm() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    status: "",
    managerId: "",
    type: "",
    notes: "",
    image: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file })); //here
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting group home:", formData);
    // Add your API call here
  };

  return (
    <div className="w-full h-full bg-purple-50 p-4 flex flex-col">
      <form
        onSubmit={handleSubmit}
        // Stretch to fill container, set up scroll if content overflows
        className="flex-1 bg-white p-8 rounded-xl shadow-lg space-y-5 border border-purple-200 w-full overflow-y-auto"
      >
        <h2 className="text-3xl font-bold text-purple-700 text-center">
          Add Group Home
        </h2>

        {[
          { label: "Name", name: "name", required: true },
          { label: "Address", name: "address", required: true },
          { label: "Phone", name: "phone", required: true },
          { label: "Status", name: "status", required: true },
          { label: "Manager ID", name: "managerId" },
          { label: "Type", name: "type" },
        ].map((field) => (
          <div key={field.name}>
            <div className="flex flex-row gap-2">
              <label className="block text-sm font-medium text-purple-600 mb-1">
                {field.label}
              </label>
              {field.required && <span className="text-red-700">*</span>}
            </div>
            <input
              type="text"
              name={field.name}
              value={
                (formData[field.name as keyof typeof formData] as string) || ""
              }
              onChange={handleChange}
              className="w-full p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              placeholder={field.label}
            />
          </div>
        ))}

        <div>
          <div className="flex flex-row gap-2">
            <label className="block text-sm font-medium text-purple-600 mb-1">
              Image
            </label>
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-600 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            placeholder="Additional notes"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Add Group Home
        </Button>
      </form>
    </div>
  );
}

export default AddGroupHomeForm;
