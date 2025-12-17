// src/components/portals/InsurancePortal.tsx
import { Routes, Route, useLocation } from "react-router-dom";
import PortalLayout from "../shared/PortalLayout";
import { Home, ListChecks, ShieldCheck } from "lucide-react";

import InsuranceDashboard from "../Pages/Insurance/InsuranceDashboard";
import InsuranceRecords from "../Pages/Insurance/InsuranceRecords";
import ReviewClaims from "../Pages/Insurance/ReviewClaims";
import ClaimReviewPage from "../Pages/Insurance/ClaimReviewPage";
import ApprovedClaims from "../Pages/Insurance/ApprovedClaims";
import AllClaimsPage from "../Pages/Insurance/AllClaimsPage";
import AllClaimsList from "../Pages/Insurance/AllClaimsList";
import PreAuthList from "../Pages/Insurance/PreAuthList";

const InsurancePortal = () => {
  const location = useLocation();

  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      path: "/insurance",
    },
    {
      icon: <Home className="w-5 h-5" />,
      label: "Insurance Records",
      path: "/insurance/records",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: "Pre-Auths",
      path: "/insurance/pre-auths",
    },
    {
      icon: <ListChecks className="w-5 h-5" />,
      label: "Claims",
      path: "/insurance/claims/review",
      children: [
        { label: "Review Claims", path: "/insurance/claims/review" },
        { label: "Approved Claims", path: "/insurance/claims/approved" },
        { label: "All Claims", path: "/insurance/claims/all" },
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
        {/* Dashboard */}
        <Route index element={<InsuranceDashboard />} />

        {/* Records */}
        <Route path="records" element={<InsuranceRecords />} />

        {/* Claims */}
        <Route path="claims" element={<AllClaimsPage />} />
        <Route path="claims/review" element={<ReviewClaims />} />
        <Route path="claims/review/:id" element={<ClaimReviewPage />} />
        <Route path="claims/approved" element={<ApprovedClaims />} />
        <Route path="claims/all" element={<AllClaimsList />} />

        {/* Pre-Auths */}
        <Route path="pre-auths" element={<PreAuthList />} />
      </Routes>
    </PortalLayout>
  );
};

export default InsurancePortal;
