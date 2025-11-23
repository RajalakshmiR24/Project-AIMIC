// src/components/Pages/Insurance/ClaimReviewPage.tsx
import { useParams } from "react-router-dom";
import ClaimReview from "./ClaimReview";

const ClaimReviewPage = () => {
  const { id } = useParams();

  if (!id) return <div className="p-6">Invalid claim selected</div>;

  return (
    <div className="p-6">
      <ClaimReview claimId={id} />
    </div>
  );
};

export default ClaimReviewPage;
