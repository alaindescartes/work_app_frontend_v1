'use client';
import AllGroupHomes from '@/_componets/groupHome/AllGroupHomes';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useState } from 'react';
import useAuth from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import AdminGrouphoneView from '@/_componets/groupHome/AdminGrouphoneView';

function pages() {
  const [adminView, setAdminView] = useState<boolean>(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';

  const swithAdminView = () => {
    setAdminView(prev => {
      const newView = !prev;
      if (newView) {
        toast.success('You are now in admin view', {
          id: 'admin-view',
          style: { backgroundColor: 'green' },
        });
      } else {
        toast.error('You are now in user view', {
          id: 'user-view',
        });
      }
      return newView;
    });
  };
  return (
    <div>
      {/* admin switch button */}
      {isAdmin && (
        <span className="flex sm:justify-end p-2 justify-center">
          <Button
            onClick={swithAdminView}
            className={`${adminView ? 'bg-green-500' : 'bg-red-500'} hover:${
              adminView ? 'bg-green-700' : 'bg-red-700'
            } hover:shadow-lg transition duration-300 ease-in-out hover:cursor-pointer`}
          >
            {adminView ? 'Switch to User View' : 'Switch to Admin View'}
          </Button>
        </span>
      )}
      {isAdmin && adminView ? <AdminGrouphoneView /> : <AllGroupHomes />}
    </div>
  );
}

export default pages;
