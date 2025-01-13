"use client";
import CompletedProjects from "@/app/admin/components/CompletedProjects";
import Notes from "@/app/admin/components/Notes";
import OnGoingProjects from "@/app/admin/components/OnGoingProjects";
import OverviewOfProjects from "@/app/admin/components/OverviewOfProjects";
import {AddIcon,CallIcon,MailIcon, MapIcon, ProgressIcon,} from "@/utils/svgicons";
import Image from "next/image";
import { Line } from "rc-progress";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import imgNew from "@/assets/images/img13.png";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { getSingleProject, updateSingleProjectData } from "@/services/admin/admin-service";
import UpdateSingleProjectModal from "@/app/admin/components/UpdateSingleProjectModal";
import dayjs from "dayjs"; 
import { useTranslations } from "next-intl";
import { getImageClientS3URL } from "@/utils/axios";
import ProjectImages from "@/app/admin/components/ProjectImages";

const Page = () => {
  const t = useTranslations('ProjectsPage');
  const h = useTranslations('ToastMessages');
  const { id } = useParams();
  const { data, error, mutate, isLoading } = useSWR(`/admin/project/${id}`, getSingleProject);
  const project = data?.data?.data; 
  const userData = data?.data?.data?.userId;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(t("Drawings"));

  const renderTabContent = () => {
    switch (activeTab) {
      case t("Drawings"):
        return (
          <div><OverviewOfProjects id={id} userEmail = {userData?.email} /></div>
        );
      case t("Progress"):
        return (
          <div><ProjectImages id={id} userEmail = {userData?.email} /></div>
        );
      case t("notes"):
        return (
          <div><Notes id={id} /></div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
  }, [activeTab]);

  return (
    <div>
      <div className="grid grid-cols-[1fr] md:grid-cols-[2fr_1fr] lg:grid-cols-[1fr_309px] gap-5">
        <div className="bg-white rounded-[10px] md:rounded-[30px] box-shadow ">
          <div className="flex items-center justify-between border-b border-[#E9EDF3] py-[20px] md:py-[30px] px-[15px] md:px-10">
            <h2 className="main-heading capitalize">{project?.projectName}</h2>
            <button onClick={() => setIsModalOpen(true)} className="!rounded-[3px] !h-[37px] button !px-4 ">
              <AddIcon className="w-4 h-4" /> Redigere
            </button>
          </div>
          <div className="pt-[20px] px-[15px] md:px-10 pb-[15px] md:pb-[40px] border-b border-[#E9EDF3] ">
            <div className=" flex gap-3 flex-col justify-between md:flex-row mb-[20px]">
              <div className="">
                <label className="block text-[#8B8E98] text-[14px] ">
                  {t('startDate')}
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      disabled
                      defaultValue={project?.projectstartDate ? dayjs(project.projectstartDate) : null}
                      value={project?.projectstartDate ? dayjs(project.projectstartDate) : null}
                      views={["year", "month", "day"]}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
              <div className="">
                <label className="block text-[#8B8E98] text-[14px] ">
                  {t('expectedEndDate')}
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer
                    components={["DatePicker"]}
                  >
                    <DatePicker
                      disabled
                      defaultValue={project?.projectendDate ? dayjs(project.projectendDate) : null}
                      value={project?.projectendDate ? dayjs(project.projectendDate) : null}
                      views={["year", "month", "day"]}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
            </div>
        <div className="mb-[20px] md:mb-[40px]">
            <label className="block text-[#3C3F88]  ">
            {t('Home Address')}
            </label>
          <p className="text-base  text-[#8B8E98] border border-[#E9EDF3] py-[9px] px-3 rounded-[6px] mt-[6px] ">
            {project?.homeAddress}</p>
           
            <label className="block text-[#3C3F88] mt-5">
                {t('Construction Address')}
            </label>
          <p className="text-base text-[#8B8E98]  border border-[#E9EDF3] py-[9px] px-3 rounded-[6px] mt-[6px] ">
            {project?.constructionAddress}</p>
            
            </div>
            <div className="progress-container pb-4">
              <h2 className="section-title"> {t('progress')}</h2>
              <p className="text-[#3C3F88] bg-[#FFF477] py-2.5 px-5 mb-10 inline-block rounded-[50px] font-sfproDisplaymedium ">{project?.status} </p>
              <div className="text-right">
                <p className="text-[#8B8E98] mb-1 text-sm ">{project?.progress}%</p>
              <Line
                percent={project?.progress}
                strokeWidth={1.2}
                strokeColor="#FF16A2"
                className="rounded-xl"
                trailWidth={2}
                trailColor="#e4e4e4"
              />
              </div>
            </div>
          </div>
          <div className="py-[30px] px-[15px] md:px-10">
            <div className="">
              <div className="flex gap-2.5">
                {[t("Drawings"), t('Progress'),  t("notes")].map((tab) => (
                  <button
                    key={tab}
                    className={`text-base rounded-[5px] py-2 px-4 font-sfproDisplaymedium transition-all duration-300 ${activeTab === tab
                      ? "text-white bg-[#3C3F88] "
                      : "text-[#8B8E98] bg-[#F4F5F7] "
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >{tab}</button>
                ))}
              </div>
              <div className="p-5 bg-[#F6F6F6] rounded-[20px] mt-5 ">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
        <div className="right-grid bg-white rounded-[10px] md:rounded-[30px] box-shadow">
          <div className="border-b border-[#E9EDF3] pb-5 pt-9 ">
            <div className="custom relative w-[120px] h-[120px] mx-auto mb-5">
              <div className="grid place-items-center h-full w-full">
                <div>
                  <Image
                    src={getImageClientS3URL(userData?.profilePic) || imgNew}
                    alt="upload"
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
            <h2 className="section-title !m-0 text-center">{userData?.fullName}</h2>
          </div>
          <div className="px-[30px] py-5 ">
            <div className="flex gap-[15px] mb-4  ">
              <span><CallIcon /></span>
              <p className="text-sm text-[#8B8E98] ">{userData?.phoneNumber}</p>
            </div>
            <div className="flex gap-[15px] mb-4  ">
              <span><MailIcon /></span>
              <p className="text-sm text-[#8B8E98] ">
                {userData?.email}
              </p>
            </div>
            <div className="flex gap-[15px]  ">
              <span><MapIcon /></span>
              <p className="text-sm text-[#8B8E98] ">
                {userData?.address}
              </p>
            </div>
            <div className="mt-7">
              <h3 className="text-[#3C3F88] text-sm flex mb-2 items-center justify-between ">
                {t('description')}
                {/* <EditProfile /> */}
              </h3>
              <p className="text-[#8B8E98] text-sm  ">{project?.description}
              </p>
            </div>
            <div className="mt-7">
              <h3 className="text-[#3C3F88] text-sm flex mb-2 items-center justify-between ">
                {t('employeesAssociated')}
                {/* <EditProfile /> */}
              </h3>
              {project?.associates?.map((index: any) => (
                <p className="text-[#8B8E98] text-sm capitalize " key={index}>{index} </p>
              ))}

            </div>
          </div>
        </div>
      </div>
    <UpdateSingleProjectModal
        id={id}
        data={project}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mutate={mutate}
      />
    </div>
  );
};

export default Page;
