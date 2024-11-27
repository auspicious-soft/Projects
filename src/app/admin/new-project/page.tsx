"use client";
import React, {ChangeEvent, FormEvent, useState, useTransition} from "react";
import Image from 'next/image';
import success from "@/assets/images/succes.png";
import Notification from "../components/Notification";
import { toast } from "sonner";
import { AddIcon } from "@/utils/svgicons";

interface FormData {
  title: string;
  assignCustomer: string; 
  startDate: string;
  endDate: string;
  description: string;
  attachments: string;
  status: string;
  addNotes: string;
}

const Page = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>({
  title: "",
  assignCustomer: "", 
  startDate: "",
  endDate: "",
  description: "",
  attachments: "",
  status: "",
  addNotes: "",
  });


  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement & { files: FileList };
    setFormData({
      ...formData,
      [name]: name === "phoneNumber" ? Number(value) : value, // Convert phoneNumber to number
    });
  };
  
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // startTransition(async () => {
    //   try {
    //     const response = await AddNewTherapist('/admin/therapists',formData); 
    //     if (response?.status === 201) {
    //       setNotification("Therapist Added Successfully");
    //       // toast.success("Wellness entry added successfully");
    //       setFormData({
    //         firstName: "",
    //         lastName: "",
    //         phoneNumber: 0,
    //         email: "",
    //         password: "",
    //       });
    //     } else {
    //       toast.error("Failed to add wellness entry");
    //     }
    //   } catch (error) {
    //     console.error("Error adding wellness entry:", error);
    //     toast.error("An error occurred while adding the wellness entry");
    //   }
    // });
  };
  return (
    <>
      <div className=" bg-white rounded-t-[30px] w-full p-10 ">
       <form onSubmit={handleSubmit} className="fomm-wrapper">
          <h2 className="section-title">About Project</h2>
          <div className="grid md:flex flex-wrap gap-5 mb-[33px] pb-[33px] relative progress-line">
           <div className="w-full">
              <label className="block">Title</label>
              <input type="text" name="title" value={formData.title} placeholder="Add Title" onChange={handleInputChange} required/>
            </div>
            <div className="md:w-[calc(33.33%-14px)]">
              <label className="block">Assign Customer</label>
              <input type="text" name="assignCustomer" value={formData.assignCustomer} onChange={handleInputChange} placeholder="Select Customer" required/>
            </div>
            <div className="md:w-[calc(33.33%-14px)]">
              <label className="block">Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} placeholder="+12346987" required/>
            </div>
            <div className="md:w-[calc(33.33%-14px)]">
              <label className="block">Expected End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} placeholder="emailaddress@mail.com" required/>
            </div>
            <div className="w-full">
              <label className="block">Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Add Description" required/>
            </div>
           </div>
           <h2 className="section-title">Project Progress</h2>
           <div className="grid md:flex flex-wrap gap-5 ">
           <div className="md:w-[calc(50%-10px)]">
              <label className="block">Attachments</label>
              <input type="text" name="attachments" value={formData.attachments} onChange={handleInputChange} placeholder="Attachments" required/>
            </div>
            <div className="md:w-[calc(50%-10px)]">
              <label className="block">Status</label>
              <input type="text" name="status" value={formData.status} onChange={handleInputChange} placeholder="Construction" required/>
            </div>
            <div className="w-full">
              <label className="block">Add Notes</label>
              <input type="text" name="addNotes" value={formData.addNotes} onChange={handleInputChange} placeholder="Your text here" required/>
            </div>
           </div>
         <div className='mt-5 '>
         <button type="submit" className="button w-full" disabled={isPending}> <AddIcon className="w-4 h-4"/>
              {isPending ? 'Adding...' : 'Add New Project'}
            </button>
         </div>
        </form>
        <Notification message={notification} onClose={() => setNotification(null)} />
      </div>
    </>
  );
};
export default Page;
 