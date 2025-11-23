// src/components/Insurance/ClaimsTabs.tsx
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { label: "Review Claims", path: "/insurance/claims/review" },
  { label: "Approved Claims", path: "/insurance/claims/approved" },
  { label: "All Claims", path: "/insurance/claims/all" },
];

const ClaimsTabs = () => {
  const location = useLocation();

  const active =
    location.pathname.startsWith("/insurance/claims")
      ? location.pathname
      : "/insurance/claims/review";

  return (
    <div className="flex gap-4 border-b pb-2 mb-6">
      {tabs.map((t) => (
        <Link
          key={t.path}
          to={t.path}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            active === t.path
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
};

export default ClaimsTabs;
