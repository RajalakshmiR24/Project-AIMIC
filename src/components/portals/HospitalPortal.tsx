import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PortalLayout from "../shared/PortalLayout";
import HospitalDashboard from "../Pages/Hospital/HospitalDashboard";
import PatientManagement from "../Pages/Hospital/PatientManagement";
import AllReportsPage from "../Pages/Hospital/AllReportsPage";
import AllClaimsPage from "../Pages/Hospital/AllClaimsPage";
import { Home, Users, FileText, FileCheck } from "lucide-react";

const HospitalPortal: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: "Dashboard", path: "/hospital" },
    { icon: <Users className="w-5 h-5" />, label: "Patients", path: "/hospital/patients" },
    { icon: <FileText className="w-5 h-5" />, label: "All Reports", path: "/hospital/reports" },
    { icon: <FileCheck className="w-5 h-5" />, label: "All Claims", path: "/hospital/claims" },
  ];

  return (
    <PortalLayout
      title="Hospital Portal"
      menuItems={menuItems}
      currentPath={location.pathname}
      headerColor="bg-teal-600"
    >
      <Routes>
        <Route path="/" element={<HospitalDashboard />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/reports" element={<AllReportsPage />} />
        <Route path="/claims" element={<AllClaimsPage />} />
      </Routes>
    </PortalLayout>
  );
};

export default HospitalPortal;
