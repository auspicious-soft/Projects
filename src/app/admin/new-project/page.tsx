"use client";
import React, { ChangeEvent, FormEvent, useState, useTransition } from "react";
import Image from "next/image";
import success from "@/assets/images/succes.png";
import Notification from "../components/Notification";
import { toast } from "sonner";
import { AddIcon } from "@/utils/svgicons";
import CustomSelect from "@/app/(website)/components/CustomSelect";
import { addNewProject } from "@/services/admin/admin-service";
import useClients from "@/utils/useClients";
import { useTranslations } from "next-intl";

const option = [
  { label: "Associate 1", value: "Associate 1" },
  { label: "Associate 2", value: "Associate 2" },
  { label: "Associate 3", value: "Associate 3" },
  { label: "Associate 4", value: "Associate 4" },
  { label: "Associate 5", value: "Associate 5" },
  { label: "Associate 6", value: "Associate 6" },
  { label: "Associate 7", value: "Associate 7" },
  { label: "Associate 8", value: "Associate 8" },
  { label: "Associate 9", value: "Associate 9" },
  { label: "Associate 10", value: "Associate 10" },
];
const Page = () => {
  const t = useTranslations('ProjectsPage'); 

  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [associates, setAssociates] = useState<any>("");
  const { userData, isLoading } = useClients(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    projectName: "",
    projectimageLink: "",
    projectstartDate: "",
    projectendDate: "",
    assignCustomer: "",
    // associates: "",
    description: "",
    attachments: [],
    status: "",
    notes: [],
  });


  const handleUserChange = (selected: any) => {
    setSelectedUser(selected);
    // Set the userId when a user is selected
    setFormData((prev: any) => ({
      ...prev,
      userId: selected ? selected.id : ""
    }));
  };

  const handleSelectChange = (selected: any) => {
    setAssociates(selected);
  };
 
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement & { files: FileList };
    
    if (files && files.length > 0) {
      const fileURLs = Array.from(files).map((file) =>
        URL.createObjectURL(file) // Replace with actual upload logic later
      );
      setFormData((prev: any) => ({
        ...prev,
        attachments: fileURLs,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: name === "phoneNumber" ? Number(value) : value,
      }));
    }
  };
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        // Prepare the payload to match the Postman example
        const payload = {
          projectName: formData.projectName,
          userId: selectedUser ? selectedUser.id : "", // Ensure userId is from selected user
          projectimageLink: formData.projectimageLink,
          projectstartDate: formData.projectstartDate,
          projectendDate: formData.projectendDate,
          description: formData.description,
          attachments: formData.attachments.length > 0 
            ? formData.attachments 
            : ["https://example.com/attachments.zip"], // Default attachment if none
          status: formData.status,
          notes: formData.notes ? [formData.notes] : [], // Ensure notes is an array of strings
          associates: associates 
            ? associates.map((associate: any) => associate.value) 
            : ["james", "Micheal"] // Default associates if none selected
        };
  
        const response = await addNewProject("/admin/projects", payload);
        
        if (response?.status === 201) {
          setNotification("Project Added Successfully");
          
          // Reset form after successful submission
          setFormData({
            projectName: "",
            projectimageLink: "",
            projectstartDate: "",
            projectendDate: "",
            userId: "",
            description: "",
            attachments: [],
            status: "",
            notes: "",
          });
          setSelectedUser(null);
          setAssociates("");
        } else {
          toast.error("Failed to add project");
        }
      } catch (error) {
        console.error("Error adding project:", error);
        toast.error("An error occurred while adding the project");
      }
    });
  };


  return (
    <>
      <div className=" bg-white rounded-t-[10px] md:rounded-t-[30px] w-full py-[30px] px-[15px] md:p-10  ">
        <form onSubmit={handleSubmit} className="fomm-wrapper">
          <h2 className="section-projectName">{t('aboutProject')}</h2>
          <div className="grid md:flex flex-wrap gap-5 mb-[20px] md:mb-[33px] pb-[33px] relative progress-line">
            <div className="md:w-[calc(66.66%-8px)]">
              <label className="block">{t('title')}</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                placeholder={t('addTitle')}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="md:w-[calc(33.33%-14px)]">
              <label className="block">{t('image')}</label>
              <input
                type="file"
                name="projectimageLink"
                value={formData.projectimageLink}
                placeholder="Tilføj"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="md:w-[calc(50%-10px)]">
              <label className="block"> {t('startDate')}</label>
              <input
                type="date"
                name="projectstartDate"
                value={formData.projectstartDate}
                onChange={handleInputChange}
                placeholder={t('startDate')}
                required
              />
            </div>
            <div className="md:w-[calc(50%-10px)]">
              <label className="block">{t('expectedEndDate')}</label>
              <input
                type="date"
                name="projectendDate"
                value={formData.projectendDate}
                onChange={handleInputChange}
                placeholder=""
                required
              />
            </div>
            <div className="md:w-[calc(50%-14px)]">
              <label className="block">{t('assignCustomer')}</label>
              <CustomSelect
                value={selectedUser}
                options={userData}
                onChange={handleUserChange}
                placeholder={t('selectUser')}
              />
            </div>
            <div className="md:w-[calc(50%-14px)]">
            <label className="block">{t('employeesAssociated')}</label>

              <CustomSelect
                value={associates}
                options={option}
                isMulti={true}
                onChange={handleSelectChange}
                placeholder={t('selectAssociates')}
              />
            </div>
            <div className="w-full">
              <label className="block">{t('description')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('description')}
              ></textarea>
            </div>
          </div>
          <h2 className="section-projectName">{t('projectProgress')}</h2>
          <div className="grid md:flex flex-wrap gap-5 ">
            <div className="md:w-[calc(50%-10px)]">
              <label className="block">{t('attachments')}</label>
              <input type="file" id="myfile" name="myfile" />
            </div>
            <div className="md:w-[calc(50%-10px)]">
              <label className="block">{t('status')}</label>
              <select 
            name="status" 
            value={formData.status} 
            onChange={handleInputChange}
          >
            <option value="">{t('selectStatus')} </option>
            <option value="1">{t('foundation')}</option>
            <option value="2">{t('construction')}</option>
            <option value="3">{t('interiorWork')} Work</option>
            <option value="4">{t('completed')}</option>
          </select>
            </div>
            <div className="w-full">
              <label className="block">{t('addNotes')}</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={t('addNotes')}
              ></textarea>
            </div>
          </div>
          <div className="mt-5 ">
            <button
              type="submit"
              className="button w-full"
              disabled={isPending}
            >
              {" "}
              <AddIcon className="w-4 h-4" />
              {isPending ? "Adding..." : t("addNewProject")}
            </button>
          </div>
        </form>
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      </div>
    </>
  );
};
export default Page;
