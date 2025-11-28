import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderSearch, ClipboardCheck } from 'lucide-react';

import PortalLayout from '../shared/PortalLayout';

import EmployeeDashboard from '../Pages/Employee/EmployeeDashboard';
import ViewClaims from '../Pages/Employee/ViewClaims';
import ReadyForClaimPatients from '../Pages/Employee/ReadyForClaimPatients';

const EmployeePortal: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/employee' },
    { icon: <FolderSearch className="w-5 h-5" />, label: 'All Claims', path: '/employee/claims' },
    { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Ready for Claim', path: '/employee/patients/ready' },
  ];

  return (
    <PortalLayout
      title="Employee Portal"
      menuItems={menuItems}
      currentPath={location.pathname}
      headerColor="bg-blue-600"
    >
      <Routes>
        <Route path="/" element={<EmployeeDashboard />} />
        <Route path="/claims" element={<ViewClaims />} />
        <Route path="/patients/ready" element={<ReadyForClaimPatients />} />
      </Routes>
    </PortalLayout>
  );
};

export default EmployeePortal;
