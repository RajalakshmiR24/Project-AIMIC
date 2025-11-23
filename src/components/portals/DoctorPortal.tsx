import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PortalLayout from "../shared/PortalLayout";
import DoctorDashboard from "../Pages/Doctor/DoctorDashboard";
import PatientManagement from "../Pages/Doctor/PatientManagement";
import AllReportsPage from "../Pages/Doctor/AllReportsPage";
import AllClaimsPage from "../Pages/Doctor/AllClaimsPage";
import { Home, Users, FileText, FileCheck } from "lucide-react";

const DoctorPortal: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: "Dashboard", path: "/doctor" },
    { icon: <Users className="w-5 h-5" />, label: "Patients", path: "/doctor/patients" },
    { icon: <FileText className="w-5 h-5" />, label: "All Reports", path: "/doctor/reports" },
    { icon: <FileCheck className="w-5 h-5" />, label: "All Claims", path: "/doctor/claims" },
  ];

  return (
    <PortalLayout
      title="Doctor Portal"
      menuItems={menuItems}
      currentPath={location.pathname}
      headerColor="bg-teal-600"
    >
      <Routes>
        <Route path="/" element={<DoctorDashboard />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/reports" element={<AllReportsPage />} />
        <Route path="/claims" element={<AllClaimsPage />} />
      </Routes>
    </PortalLayout>
  );
};

export default DoctorPortal;
