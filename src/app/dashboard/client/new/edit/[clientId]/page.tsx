'use client';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ResidentInsert } from '@/interfaces/clientInterface';

export default function Page() {
  const params = useParams();

  const [clientToEdit, setClientToEdit] = useState<ResidentInsert | null>(null);

  useEffect(() => {
    /**
     * Fetches the client data for the given clientId from the API.
     * Sets the clientToEdit state with the fetched data.
     */
    const fetchClient = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/single-client/${params.clientId}`,
          {
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setClientToEdit(data.client);
        } else {
          console.error('Failed to fetch client data');
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Error fetching client:', err);
        }
      }
    };

    fetchClient();
  }, [params.clientId]);

  const formRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [formData, setFormData] = useState<
    Omit<ResidentInsert, 'image_url'> & { image_file: File | null }
  >({
    firstName: clientToEdit?.firstName ?? '',
    lastName: clientToEdit?.lastName ?? '',
    dateOfBirth: clientToEdit?.dateOfBirth?.slice(0, 10) ?? '',
    gender: clientToEdit?.gender ?? '',
    primaryDiagnosis: clientToEdit?.primaryDiagnosis ?? [],
    allergies: clientToEdit?.allergies ?? [],
    admissionDate: clientToEdit?.admissionDate?.slice(0, 10) ?? '',
    status: clientToEdit?.status ?? '',
    groupHomeId: clientToEdit?.groupHomeId ?? 0,
    marital_status: clientToEdit?.marital_status ?? 'single',
    healthcareNumber: clientToEdit?.healthcareNumber ?? '',
    phoneNumber: clientToEdit?.phoneNumber ?? '',
    isSelfGuardian: clientToEdit?.isSelfGuardian ?? false,
    funderID: clientToEdit?.funderID ?? undefined,
    image_file: null,
  });

  useEffect(() => {
    /**
     * Updates the formData state whenever clientToEdit changes.
     * Ensures the form fields reflect the latest client data.
     */
    if (clientToEdit) {
      setFormData({
        firstName: clientToEdit.firstName ?? '',
        lastName: clientToEdit.lastName ?? '',
        dateOfBirth: clientToEdit.dateOfBirth?.slice(0, 10) ?? '',
        gender: clientToEdit.gender ?? '',
        primaryDiagnosis: clientToEdit.primaryDiagnosis ?? [],
        allergies: clientToEdit.allergies ?? [],
        admissionDate: clientToEdit.admissionDate?.slice(0, 10) ?? '',
        status: clientToEdit.status ?? '',
        groupHomeId: clientToEdit.groupHomeId ?? 0,
        marital_status: clientToEdit.marital_status ?? 'single',
        healthcareNumber: clientToEdit.healthcareNumber ?? '',
        phoneNumber: clientToEdit.phoneNumber ?? '',
        isSelfGuardian: clientToEdit.isSelfGuardian ?? false,
        funderID: clientToEdit.funderID ?? undefined,
        image_file: null,
      });
    }
  }, [clientToEdit]);

  /**
   * Handles changes to input and select elements.
   * Updates formData state accordingly, handling checkboxes and file inputs specifically.
   * @param e React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, type } = target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (target as HTMLInputElement).checked,
      }));
    } else if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        image_file: (target as HTMLInputElement).files?.[0] ?? null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: target.value,
      }));
    }
  };

  /**
   * Handles changes to fields that are arrays represented as comma-separated strings.
   * Sanitizes input by replacing dashes with commas, splitting, trimming, and filtering empty values.
   * @param e React.ChangeEvent<HTMLInputElement>
   * @param field The field name to update ('primaryDiagnosis' or 'allergies')
   */
  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'primaryDiagnosis' | 'allergies'
  ) => {
    const { value } = e.target;

    const sanitized = value.replace(/-/g, ',');

    const values = sanitized
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');

    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  /**
   * Handles form submission to update resident data.
   * Validates required fields, constructs FormData, and sends a POST request to update the resident.
   * Displays success or error toasts and navigates back on success.
   * @param e React.FormEvent
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting resident:', formData);

    const requiredFields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'admissionDate',
      'healthcareNumber',
    ];

    let hasError = false;

    requiredFields.forEach((field) => {
      const input = formRefs.current[field];
      if (input && !input.value.trim()) {
        input.style.borderColor = 'red';
        hasError = true;
      } else if (input) {
        input.style.borderColor = '';
      }
    });

    if (!hasError) {
      try {
        setIsEditing(true);
        const formPayload = new FormData();
        formPayload.append('firstName', formData.firstName);
        formPayload.append('lastName', formData.lastName);
        formPayload.append('dateOfBirth', formData.dateOfBirth);
        formPayload.append('gender', formData.gender);
        formPayload.append('admissionDate', formData.admissionDate);
        formPayload.append('healthcareNumber', formData.healthcareNumber);
        formPayload.append('status', formData.status);
        formPayload.append('marital_status', formData.marital_status);
        formPayload.append('groupHomeId', String(formData.groupHomeId));
        formPayload.append('isSelfGuardian', String(formData.isSelfGuardian));
        formPayload.append('primaryDiagnosis', JSON.stringify(formData.primaryDiagnosis));
        formPayload.append('allergies', JSON.stringify(formData.allergies));

        if (formData.phoneNumber) {
          formPayload.append('phoneNumber', formData.phoneNumber);
        }
        if (formData.funderID !== undefined) {
          formPayload.append('funderID', String(formData.funderID));
        }
        if (formData.image_file) {
          formPayload.append('image', formData.image_file);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resident-route/edit-resident/${params?.clientId}`,
          {
            method: 'POST',
            credentials: 'include',
            body: formPayload,
          }
        );

        if (response.ok) {
          toast('client Edited successfully.', {
            style: { backgroundColor: 'green', color: 'white' },
          });
          router.push(`/dashboard/group-homes/${clientToEdit?.groupHomeId}`);
          console.log(response.body);
        }
      } catch (e) {
        toast('Error Editing client.', {
          style: { backgroundColor: 'red', color: 'white' },
        });
        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
          console.error('Error submitting resident', e);
        }
      } finally {
        setIsEditing(false);
      }
    }
  };

  if (!clientToEdit) return <div className="text-center mt-8">Loading client data...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow space-y-6"
    >
      <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">Edit Resident</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div>
          <label className="block text-sm font-semibold">First Name</label>
          <input
            ref={(el) => {
              formRefs.current['firstName'] = el;
            }}
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Last Name</label>
          <input
            ref={(el) => {
              formRefs.current['lastName'] = el;
            }}
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Date of Birth</label>
          <input
            ref={(el) => {
              formRefs.current['dateOfBirth'] = el;
            }}
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Gender</label>
          <select
            ref={(el) => {
              formRefs.current['gender'] = el;
            }}
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Health Info */}
        <div>
          <label className="block text-sm font-semibold">Primary Diagnosis (comma separated)</label>
          <input
            type="text"
            onChange={(e) => handleArrayChange(e, 'primaryDiagnosis')}
            className="w-full p-2 border rounded"
            placeholder="e.g. Autism, Epilepsy"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Allergies (comma separated)</label>
          <input
            type="text"
            onChange={(e) => handleArrayChange(e, 'allergies')}
            className="w-full p-2 border rounded"
            placeholder="e.g. Peanuts, Shellfish"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Admission Date</label>
          <input
            ref={(el) => {
              formRefs.current['admissionDate'] = el;
            }}
            type="date"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Healthcare Number</label>
          <input
            ref={(el) => {
              formRefs.current['healthcareNumber'] = el;
            }}
            type="text"
            name="healthcareNumber"
            value={formData.healthcareNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Other Info */}
        <div>
          <label className="block text-sm font-semibold">Marital Status</label>
          <select
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold">Group Home ID</label>
          <input
            type="number"
            name="groupHomeId"
            value={formData.groupHomeId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={true}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Funder ID (optional)</label>
          <input
            type="number"
            name="funderID"
            value={formData.funderID ?? ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isSelfGuardian"
            checked={formData.isSelfGuardian}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label className="text-sm font-semibold">Self-Guardian?</label>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-semibold">Upload Resident Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isEditing}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-8 py-3 rounded-md mt-6"
        >
          {isEditing ? 'Editing...' : 'Edit Resident'}
        </Button>
      </div>
    </form>
  );
}
