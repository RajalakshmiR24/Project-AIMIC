// src/Pages/Insurance/AllClaimsPage.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { label: "Review Claims", path: "/insurance/claims/review" },
  { label: "Approved Claims", path: "/insurance/claims/approved" },
  { label: "All Claims", path: "/insurance/claims/all" },
];

const AllClaimsPage: React.FC = () => {
  const location = useLocation();

  const activePath =
    location.pathname === "/insurance/claims"
      ? "/insurance/claims/review"
      : location.pathname;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Claims</h1>

      <div className="flex gap-4 border-b pb-2 mb-6">
        {tabs.map((tab) => {
          const active = activePath === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
                active
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AllClaimsPage;
