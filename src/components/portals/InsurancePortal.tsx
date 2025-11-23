// src/components/portals/InsurancePortal.tsx
import { Routes, Route, useLocation } from "react-router-dom";
import PortalLayout from "../shared/PortalLayout";
import { Home, ListChecks } from "lucide-react";

import InsuranceDashboard from "../Pages/Insurance/InsuranceDashboard";
import InsuranceRecords from "../Pages/Insurance/InsuranceRecords";
import ReviewClaims from "../Pages/Insurance/ReviewClaims";
import ClaimReviewPage from "../Pages/Insurance/ClaimReviewPage";
import ApprovedClaims from "../Pages/Insurance/ApprovedClaims";
import AllClaimsPage from "../Pages/Insurance/AllClaimsPage";
import AllClaimsList from "../Pages/Insurance/AllClaimsList";

const InsurancePortal = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: "Dashboard", path: "/insurance" },
    { icon: <Home className="w-5 h-5" />, label: "Insurance Records", path: "/insurance/records" },
    {
      icon: <ListChecks className="w-5 h-5" />,
      label: "All Claims",
      path: "/insurance/claims/review",
      children: [
        { label: "Approved Claims", path: "/insurance/claims/approved" }
      ],
    },
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
        <Route path="/records" element={<InsuranceRecords />} />

        {/* All Claims Main Page */}
        <Route path="/claims" element={<AllClaimsPage />} />

        {/* Subtabs */}
        <Route path="/claims/review" element={<ReviewClaims />} />
        <Route path="/claims/review/:id" element={<ClaimReviewPage />} />
        <Route path="/claims/approved" element={<ApprovedClaims />} />
        <Route path="/claims/all" element={<AllClaimsList />} />

      </Routes>
    </PortalLayout>
  );
};

export default InsurancePortal;
