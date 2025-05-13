import React from 'react';
import AddGroupHomeForm from '../forms/AddGrouphome.form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Edit_RemoveGroupHome from '@/_componets/groupHome/Edit_RemoveGroupHome';
import AddTaskWrapper from '../task/AddTaskWrapper';

function AdminGrouphoneView() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/*form to add a groupHome*/}
      <div className="flex flex-col max-w-4xl mx-auto mt-10 p-7 bg-white shadow-lg rounded-lg">
        <h2 className="text-4xl font-bold mb-6 text-purple-700 text-center">Admin Actions</h2>
        {/*add groupHome*/}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xl font-medium text-purple-800 hover:underline transition-all">
              Add a GroupHome here
            </AccordionTrigger>
            <AccordionContent>
              <AddGroupHomeForm />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/*  edit or delete groupHome*/}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xl font-medium text-purple-800 hover:underline transition-all">
              Edit or Delete GroupHome here
            </AccordionTrigger>
            <AccordionContent>
              <Edit_RemoveGroupHome />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* add or edit task */}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xl font-medium text-purple-800 hover:underline transition-all">
              Add, Edit or Delete GroupHome Tasks here
            </AccordionTrigger>
            <AccordionContent>
              <AddTaskWrapper />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default AdminGrouphoneView;
