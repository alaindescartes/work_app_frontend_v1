'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function Page() {
  const params = useParams();
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    phone: string;
    status: string;
    managerName: string;
    supervisorName: string;
    type: string;
    notes: string;
    image: File | null;
  }>({
    name: '',
    address: '',
    phone: '',
    status: '',
    managerName: '',
    supervisorName: '',
    type: '',
    notes: '',
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // prepare data for the backend
    const data = new FormData();
    data.append('name', formData.name);
    data.append('address', formData.address);
    data.append('phone', formData.phone);
    data.append('status', formData.status);
    data.append('managerName', formData.managerName);
    data.append('supervisorName', formData.supervisorName);
    data.append('type', formData.type);
    data.append('notes', formData.notes);
    if (formData.image) {
      data.append('image', formData.image);
    }

    //send data to the backend
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/edit-grouphome/${params.homeId}/home`,
        {
          method: 'POST',
          body: data,
          credentials: 'include',
        }
      );

      if (response.ok) {
        toast('Successfully edited!', { style: { backgroundColor: 'green', color: 'white' } });
        console.log(response);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const getHome = async () => {
      try {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/grouphome-route/get-grouphome/${params.homeId}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (result.ok) {
          const response = await result.json();
          const data = response.groupHome;
          setFormData((prev) => ({
            ...prev,
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
            status: data.status || '',
            managerName: data.managerName || '',
            supervisorName: data.supervisorName || '',
            type: data.type || '',
            notes: data.notes || '',
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    getHome();
  }, [params.homeId]);

  return (
    <div className="w-full h-full bg-purple-50 p-4 flex flex-col">
      <div className="flex flex-col">
        <p className="font-semibold">
          Fields marked <span className="text-2xl text-red-700">*</span> are required.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        // Stretch to fill container, set up scroll if content overflows
        className="flex-1 bg-white p-8 rounded-xl shadow-lg space-y-5 border border-purple-200 w-full overflow-y-auto"
      >
        {[
          { label: 'Name', name: 'name', required: true },
          { label: 'Address', name: 'address', required: true },
          { label: 'Phone', name: 'phone', required: true },
          { label: 'Status', name: 'status', required: true },
          { label: "Manager's Name", name: 'managerName' },
          { label: "Supervisor's Name", name: 'supervisorName' },
          { label: 'Type', name: 'type' },
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
              value={(formData[field.name as keyof typeof formData] as string) || ''}
              onChange={handleChange}
              className="w-full p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              placeholder={field.label}
            />
          </div>
        ))}

        <div>
          <div className="flex flex-row gap-2">
            <label className="block text-sm font-medium text-purple-600 mb-1">Image</label>
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
          <label className="block text-sm font-medium text-purple-600 mb-1">Notes</label>
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
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
        >
          {isSubmitting ? 'Editing...' : ' Edit Group Home'}
        </Button>
      </form>
    </div>
  );
}
