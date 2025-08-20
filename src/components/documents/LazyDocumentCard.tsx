import { useLazyLoading } from "@/hooks/useLazyLoading";
import { DocumentCardLoading } from "@/components/ui/loading-states";
import DocumentCard from "./DocumentCard";
import { BoatDocumentDTO, TourDocumentDTO } from "@/types/document.types";

interface LazyDocumentCardProps<T extends BoatDocumentDTO | TourDocumentDTO> {
  document: T;
  onDelete: () => void;
  onEdit?: () => void;
  onVerificationUpdate?: (document: T) => void;
  showVerificationStatus?: boolean;
  showExpiryWarning?: boolean;
  className?: string;
  entityType: "boat" | "tour";
  threshold?: number;
  rootMargin?: string;
}

const LazyDocumentCard = <T extends BoatDocumentDTO | TourDocumentDTO>({
  document,
  onDelete,
  onEdit,
  onVerificationUpdate,
  showVerificationStatus = true,
  showExpiryWarning = true,
  className,
  entityType,
  threshold = 0.1,
  rootMargin = "100px",
}: LazyDocumentCardProps<T>) => {
  const { hasIntersected, ref } = useLazyLoading({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={className}>
      {hasIntersected ? (
        <DocumentCard
          document={document}
          onDelete={onDelete}
          onEdit={onEdit}
          onVerificationUpdate={onVerificationUpdate}
          showVerificationStatus={showVerificationStatus}
          showExpiryWarning={showExpiryWarning}
          entityType={entityType}
        />
      ) : (
        <DocumentCardLoading />
      )}
    </div>
  );
};

export default LazyDocumentCard;
