import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useRoleContext } from "@/context/currentRoleContext";

// MainLayout
import Mainlayout from "@/mainlayout/Mainlayout";

// Dashboard
import AdminDashboard from "@/dashboard/AdminDashboard";

// ManageUser
import ManageUser from "@/ManageUser/ManageUser";

// SurveyForm Reports
import SurveyFormReportAll from "@/SurveyForm/SurveyFormReportAll";

import ManageModels from "@/ManageModels/ManageModels";


import Loader from "@/components/loaders/Loader";

const Approutes = () => {
  const { currentRole, isLoading } = useRoleContext();

  if (isLoading) {
    // return <VivoTypingLoader />;
    return <Loader />;
  }
  return (
    <Routes>
      <Route path="/" element={<Mainlayout />}>

        <Route index element={<AdminDashboard />} />


        {/* {!currentRole && <Route index element={<Navigate to="/login" replace />} />} */}

        <Route path="/managestore" element={<ManageUser />} />
        <Route path="/surveyformreportall" element={<SurveyFormReportAll />} />
        <Route path="/managebrands" element={<ManageModels />} />
      </Route>
    </Routes>
  );
};

export default Approutes;
