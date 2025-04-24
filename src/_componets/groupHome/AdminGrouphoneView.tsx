import React from 'react';
import AddGroupHomeForm from '../forms/AddGrouphome.form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Edit_RemoveGroupHome from '@/_componets/groupHome/Edit_RemoveGroupHome';

function AdminGrouphoneView() {
  return (
    <div>
      {/*form to add a groupHome*/}
      <div className="flex flex-col p-7">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800">Actions</h2>
        {/*add groupHome*/}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-center text-2xl hover:cursor-pointer">
              Add a GroupHome
            </AccordionTrigger>
            <AccordionContent>
              <AddGroupHomeForm />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/*  edit or delete groupHome*/}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-center text-2xl hover:cursor-pointer">
              Edit or Delete GroupHome
            </AccordionTrigger>
            <AccordionContent>
              <Edit_RemoveGroupHome />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default AdminGrouphoneView;
