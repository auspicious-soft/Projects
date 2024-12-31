"use client";
import Image from "next/image";
import React, { ChangeEvent, FormEvent, startTransition, useEffect, useState } from "react";
import { EditButtonIcon } from "@/utils/svgicons";
import EditClientDetailsModal from "@/app/admin/components/EditClientDetailsModal";
import AssociatedProjects from "@/app/admin/components/AssociatedProjects";
import { useParams } from "next/navigation";
import { getSingleUser, updateSingleUser } from "@/services/admin/admin-service";
import useSWR from "swr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getImageClientS3URL } from "@/utils/axios";
import { deleteFileFromS3, generateSignedUrlForUserProfile } from "@/actions";


const Page = () => {
  const t = useTranslations('ProfilePage');
  const { id } = useParams();
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, error, mutate, isLoading } = useSWR(`/admin/users/${id}`, getSingleUser)
  const customerData = data?.data?.data;
  const associatedProjects = customerData?.projects
  const [formData, setFormData] = useState<any>({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    profilePic: "",
  });

  useEffect(() => {
    if (customerData?.user) {
      setFormData({
        fullName: customerData.user.fullName || "",
        phoneNumber: customerData.user.phoneNumber || "",
        email: customerData.user.email || "",
        address: customerData.user.address || "",
        profilePic: customerData.user.profilePic || "",
      });
    }
  }, [customerData]);


  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement & { files: FileList };
    setFormData({
      ...formData,
      [name]: name === "phoneNumber" ? value : value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let updatedFormData = { ...formData }
    startTransition(async () => {
      try {
        if (formData.profilePic instanceof File) {
          const fileName = formData.profilePic.name + '-' + new Date().getTime()
          const email = formData.email
          const uploadUrl = await generateSignedUrlForUserProfile(fileName, formData.profilePic.type, email)
          await fetch(uploadUrl, {
            method: 'PUT',
            body: formData.profilePic,
            headers: {
              'Content-Type': formData.profilePic.type,
            },
          })
          const oldImage = customerData.profilePic
          // if (oldImage.includes('users')) {
          //   await deleteFileFromS3(customerData.profilePic)
          // }
          updatedFormData.profilePic = `users/${email}/${fileName}`
        }
        console.log('updatedFormData: ', updatedFormData);
        const response = await updateSingleUser(`/admin/users/${id}`, updatedFormData);
        if (response?.status === 200) {
          setIsModalOpen(false);
          mutate()
          //setNotification("User Added Successfully");
          toast.success("User details updated successfully", {position: 'bottom-left'});

        } else {
          toast.error("Failed to add User Data");
        }
      } catch (error) {
        console.error("Error adding User Data:", error);
        toast.error("An error occurred while adding the User Data");
      }
    });

  };
  return (
    <div>
      <h2 className="section-title text-[#3C3F88]"> {t('clientDetails')}</h2>
      <div className=" bg-white rounded-[10px] md:rounded-[30px] w-full py-[30px] px-[15px] md:p-10 ">
        <div className="mb-10 flex gap-[20px] justify-between ">
          {/* src={formData.profilePic || imgNew}  */}
          <Image src={getImageClientS3URL(formData.profilePic)} alt="hjfg" height={200} width={200} className="max-w-[100px] md:max-w-[200px] aspect-square rounded-full  " />
          <div>
            <button onClick={() => setIsModalOpen(true)} className="w-full !rounded-[3px] button !h-[40px] ">
              <EditButtonIcon /> {t('editDetails')}
            </button></div>
        </div>
        <div className="fomm-wrapper grid md:flex flex-wrap gap-5 ">
          <div className="w-full">
            <label className="block">{t('fullName')}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              placeholder={t('fullName')}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div className="md:w-[calc(33.33%-14px)]">
            <label className="block">{t('phoneNumber')}</label>
            <input
              type="text"
              name={t('phoneNumber')}
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
              readOnly
            />
          </div>
          <div className="md:w-[calc(33.33%-14px)]">
            <label className="block">{t('emailAddress')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('emailAddress')}
              readOnly
            />
          </div>
          <div className="md:w-[calc(33.33%-14px)]">
            <label className="block">{t('homeAddress')}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t('homeAddress')}
              readOnly
            />
          </div>
        </div>
      </div>

      {isModalOpen && <EditClientDetailsModal
        isPending={isLoading}
        profilePic={getImageClientS3URL(formData.profilePic)}
        setFormData={setFormData}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        mutate={mutate}
      />}
      <section className="mt-10">
        <h2 className="section-title">{t('associatedProjects')} </h2>
        <AssociatedProjects setQuery={setQuery} mutate={mutate} data={associatedProjects} />
      </section>
    </div>
  );
};

export default Page;
