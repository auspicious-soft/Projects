"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import success from "@/assets/images/succes.png";
import Notification from "../components/Notification";
import { toast } from "sonner";
import { AddIcon, EditButtonIcon } from "@/utils/svgicons";
import CustomSelect from "@/app/(website)/components/CustomSelect";
import { updateSingleProjectData } from "@/services/admin/admin-service";
import useClients from "@/utils/useClients";
import Modal from "react-modal";
import { getImageClientS3URL } from "@/utils/axios";
import { useTranslations } from "next-intl";
import { deleteFileFromS3, generateSignedUrlToUploadOn } from "@/actions";
import ReactLoader from "@/components/react-loading";


export const option = [
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

interface UpdateProps {
  isOpen: boolean;
  id?: any;
  data: any;
  mutate: any;
  onClose: () => void;

}
const UpdateSingleProjectModal: React.FC<UpdateProps> = ({ isOpen, onClose, id, data, mutate }) => {
  const t = useTranslations('ProjectsPage');
  const h = useTranslations('ToastMessages');
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [associates, setAssociates] = useState<any>("");
  const { userData, isLoading } = useClients(true);
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const oldProjectImage = data.projectimageLink
  const [formData, setFormData] = useState<any>({
    projectName: "",
    projectimageLink: "",
    projectstartDate: "",
    projectendDate: "",
    assignCustomer: "",
    description: "",
    employeeId: "", 
    progress: 0,
    status: "",
    notes: [],
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (data) {
      setFormData({
        projectName: data.projectName || "",
        projectimageLink: (data.projectimageLink) || "",
        projectstartDate: data.projectstartDate || "",
        projectendDate: data.projectendDate || "",
        description: data.description || "",
        attachments: data.attachments?.map((att: any) => att.filePath) || [],
        status: data.status || "",
        notes: data.notes || [],
      });
      setImagePreview(getImageClientS3URL(data.projectimageLink));
      // Set selected user if user data exists
      if (data.userId) {
        setSelectedUser({
          id: data.userId._id,
          label: data.userId.fullName,
          value: data.userId._id,
          email: data.userId.email,
        });
      }

      // Set associates if they exist
      if (data.associates && data.associates.length > 0) {
        const selectedAssociates = data.associates.map((assoc: string) => ({
          label: assoc,
          value: assoc
        }));
        setAssociates(selectedAssociates);
      }
    }
  }, []);

  const handleUserChange = (selected: any) => {
    setSelectedUser(selected);
    setFormData((prev: any) => ({
      ...prev,
      userId: selected ? selected.id : ""
    }));
  };

  const handleSelectChange = (selected: any) => {
    setAssociates(selected);
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement & { files: FileList };

    if (files && files.length > 0 && name === "projectimageLink") {
      const file = files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: name === "phoneNumber" ? Number(value) : value,
      }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     const progressRegex = /^([1-9][0-9]?|100)$/;
        if (formData.progress && !progressRegex.test(formData.progress.toString())) {
          toast.error("Progress must be a number between 1 and 100");
          return;
        }
    let imageUrl = formData.projectimageLink
    startTransition(async () => {
      try {
        if (selectedFile) {
          const { signedUrl, key } = await generateSignedUrlToUploadOn(selectedFile.name, selectedFile.type, selectedUser.email)
          await fetch(signedUrl, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type,
            },
          })
          oldProjectImage && await deleteFileFromS3(oldProjectImage)
          imageUrl = key
        }
        const payload = {
          projectName: formData.projectName,
          projectimageLink: imageUrl,
          projectstartDate: formData.projectstartDate,
          projectendDate: formData.projectendDate,
          description: formData.description,
          progress: formData.progress,
          status: formData.status,
          associates: associates.length > 0
            ? associates.map((associate: any) => associate.value)
            : undefined,
        };

        const response = await updateSingleProjectData(`/admin/project/${id}`, payload);

        if (response?.status === 200) {
          toast.success(h("Updated successfully"));
          mutate();
          onClose();
        } else {
          toast.error(h("Failed to add project"));
        }
      }
      catch (error) {
        console.error("Der opstod en fejl", error);
        toast.error("Der opstod en fejl");
      }
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      bodyOpenClassName='overflow-hidden'
      contentLabel="Edit Client Details"
      className="modal max-w-[1081px] mx-auto rounded-[20px] w-full max-h-[90vh] overflow-auto overflow-custom"
      overlayClassName="w-full h-full p-3 fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      ariaHideApp={false}
    >
      <div className=" bg-white rounded-t-[10px] md:rounded-t-[30px] w-full py-[30px] px-[15px] md:p-10  ">
        <form onSubmit={handleSubmit} className="fomm-wrapper">
          <h2 className="section-projectName">{t('aboutProject')}</h2>
          <div className="grid md:flex flex-wrap gap-5 pb-[33px] relative ">
            <div className="md:w-[calc(66.66%-8px)]">
              <label className="block">{t('title')}</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                placeholder={t('addProjectName')}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="md:w-[calc(33.33%-14px)] mb-5">
              <label className="block">{t('projectImage')}</label>
              {!selectedFile ? (
                <div className="relative h-full">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="rounded-full object-cover w-[200px] h-[200px]"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className="absolute bottom-5 right-24 p-2 rounded-full bg-[#1657ff] text-white"
                  >
                    <EditButtonIcon />
                  </button>
                </div>
              ) : (
                <div className="relative h-full">
                  <Image
                    src={imagePreview ? imagePreview : success}
                    alt="upload"
                    width={200}
                    height={200}
                    className="rounded-full object-cover w-[200px] h-[200px]"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className="absolute bottom-5 right-24 p-2 rounded-full bg-[#1657ff] text-white"
                  >
                    <EditButtonIcon />
                  </button>
                </div>
              )}
              <input
                type="file"
                id="fileInput"
                name="projectimageLink"
                className="hidden"
                onChange={handleInputChange}
                accept="image/*"
              />
            </div>
            <div className="md:w-[calc(33.33%-14px)]">
              <label className="block">{t('startDate')}</label>
              <input
                type="date"
                name="projectstartDate"
                value={formData.projectstartDate}
                onChange={handleInputChange}
                placeholder={t('startDate')}
              />
            </div>
            <div className="md:w-[calc(33.33%-14px)]">
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
            <div className="md:w-[calc(33.33%-14px)]">
              <label className="block">{t('status')}</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="">{t('selectStatus')} </option>
                <option value="1">{t('foundation')}</option>
                <option value="2">{t('construction')}</option>
                <option value="3">{t('interiorWork')} </option>
                <option value="4">{t('completed')}</option>
              </select>
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
                placeholder="{t('selectAssociates')}"
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
          <div className="mt-5 ">
            <button
              type="submit"
              className="button w-full"
              disabled={isPending}>
              {isPending ? <ReactLoader /> : <> <AddIcon className="w-4 h-4" /> {t('updateProjectDetails')}</>}
            </button>
          </div>
        </form>
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      </div>
    </Modal>
  );
};
export default UpdateSingleProjectModal;
