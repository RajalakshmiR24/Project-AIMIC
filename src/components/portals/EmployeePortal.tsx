import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Home, FileText, Upload, Plus } from 'lucide-react';
import PortalLayout from '../shared/PortalLayout';
import EmployeeDashboard from '../Pages/Employee/EmployeeDashboard';
import SubmitClaim from '../Pages/Employee/SubmitClaim';
import UploadDocuments from '../Pages/Employee/UploadDocuments';
import ViewClaims from '../Pages/Employee/ViewClaims';
/* -------------------------- Portal Wrapper -------------------------- */
const EmployeePortal: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/employee' },
    { icon: <Plus className="w-5 h-5" />, label: 'Submit Claim', path: '/employee/submit' },
    { icon: <FileText className="w-5 h-5" />, label: 'My Claims', path: '/employee/claims' },
    { icon: <Upload className="w-5 h-5" />, label: 'Documents', path: '/employee/documents' }
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
        <Route path="/submit" element={<SubmitClaim />} />
        <Route path="/claims" element={<ViewClaims />} />
        <Route path="/documents" element={<UploadDocuments />} />
      </Routes>
    </PortalLayout>
  );
};

export default EmployeePortal;