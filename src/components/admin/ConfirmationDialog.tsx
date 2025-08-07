import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorDisplay } from "@/components/common/ErrorDisplay";
import { useRetry } from "@/hooks/useRetry";
import { parseApiError, AppError } from "@/utils/errorHandling";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

const ConfirmationDialogContent: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "İptal",
  variant = "default",
  loading = false,
}) => {
  const [apiError, setApiError] = useState<AppError | null>(null);

  const {
    execute: executeConfirm,
    isRetrying,
    retryCount,
  } = useRetry({
    maxRetries: 3,
    onRetry: (attempt) => {
      console.log(`Retrying confirmation action (attempt ${attempt})`);
    },
    onError: (error) => {
      setApiError(error);
    },
  });

  const handleConfirm = async () => {
    setApiError(null);

    try {
      await executeConfirm(async () => {
        await onConfirm();
      });
    } catch (error) {
      // Error is handled by the retry hook
      console.error("Confirmation action failed:", error);
    }
  };

  const handleRetry = () => {
    setApiError(null);
    handleConfirm();
  };

  const isProcessing = loading || isRetrying;

  const getConfirmButtonStyles = () => {
    if (variant === "destructive") {
      return "bg-red-600 hover:bg-red-700 text-white";
    }
    return "bg-[#15847c] hover:bg-[#0e5c56] text-white";
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* API Error Display */}
        {apiError && (
          <div className="px-6">
            <ErrorDisplay
              error={apiError}
              onRetry={apiError.isRetryable ? handleRetry : undefined}
              onDismiss={() => setApiError(null)}
              variant="inline"
              showSuggestions={false}
            />
          </div>
        )}

        {/* Retry Status */}
        {isRetrying && (
          <div className="px-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Yeniden deneniyor... (Deneme {retryCount}/3)
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isProcessing}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isProcessing}
            className={getConfirmButtonStyles()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {retryCount > 0
                  ? `Yeniden Deneniyor... (${retryCount}/3)`
                  : "İşleniyor..."}
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Wrap with error boundary
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = (
  props
) => (
  <ErrorBoundary
    fallback={
      <AlertDialog open={props.isOpen} onOpenChange={props.onClose}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Hata Oluştu</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="p-4">
            <ErrorDisplay
              error="Dialog yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
              onRetry={() => window.location.reload()}
              variant="default"
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    }
  >
    <ConfirmationDialogContent {...props} />
  </ErrorBoundary>
);
