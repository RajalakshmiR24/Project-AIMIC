import { Routes, Route, useLocation } from 'react-router-dom';
import PortalLayout from '../shared/PortalLayout';
import { Home, FileText, CheckCircle, TrendingUp } from 'lucide-react';

import InsuranceDashboard from '../Pages/Insurance/InsuranceDashboard';
import ClaimReview from '../Pages/Insurance/ReviewClaims';
import ApprovedClaims from '../Pages/Insurance/ApprovedClaims';

const InsurancePortal = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/insurance' },
    { icon: <FileText className="w-5 h-5" />, label: 'Review Claims', path: '/insurance/review' },
    { icon: <CheckCircle className="w-5 h-5" />, label: 'Approved Claims', path: '/insurance/approved' },
  ];

  return (
    <PortalLayout
      title="Insurance Portal"
      menuItems={menuItems}
      currentPath={location.pathname}
      headerColor="bg-green-600"
    >
      <Routes>
        <Route path="/" element={<InsuranceDashboard />} />
        <Route path="/review" element={<ClaimReview />} />
        <Route path="/approved" element={<ApprovedClaims />} />
      </Routes>
    </PortalLayout>
  );
};

export default InsurancePortal;
