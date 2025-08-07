import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookingDTO, BookingStatus } from "@/types/booking.types";
import { X, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bookingService } from "@/services/bookingService";
import { tokenUtils } from "@/lib/utils";

interface BookingStatusUpdateModalProps {
  booking: BookingDTO;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (
    bookingId: number,
    status: BookingStatus,
    reason?: string
  ) => Promise<void>;
  loading?: boolean;
}

const BookingStatusUpdateModal: React.FC<BookingStatusUpdateModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
  loading = false,
}) => {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    status?: string;
    reason?: string;
    general?: string;
  }>({});
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Available status options for captains (only CONFIRMED and CANCELLED)
  const availableStatuses = [
    { value: BookingStatus.CONFIRMED, label: "Confirm Booking" },
    { value: BookingStatus.CANCELLED, label: "Cancel Booking" },
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(null);
      setReason("");
      setValidationErrors({});
      setIsSubmitting(false);
      setRetryCount(0);
      setIsRetrying(false);
    }
  }, [isOpen]);

  // Clear validation errors when fields change
  useEffect(() => {
    if (validationErrors.status && selectedStatus) {
      setValidationErrors((prev) => ({ ...prev, status: undefined }));
    }
  }, [selectedStatus, validationErrors.status]);

  useEffect(() => {
    if (validationErrors.reason && reason.trim()) {
      setValidationErrors((prev) => ({ ...prev, reason: undefined }));
    }
  }, [reason, validationErrors.reason]);

  // Kullanıcı iptal gerekçesi yazmaya başlarsa otomatik olarak statüyü CANCELLED yap
  useEffect(() => {
    const trimmed = reason.trim();
    if (trimmed.length > 0 && selectedStatus !== BookingStatus.CANCELLED) {
      setSelectedStatus(BookingStatus.CANCELLED);
    }
  }, [reason, selectedStatus]);

  // Enhanced form validation logic
  const validateForm = (): boolean => {
    const errors: { status?: string; reason?: string } = {};

    // Validate status selection
    if (!selectedStatus) {
      errors.status = "Please select a status";
    }

    // Validate reason when status is CANCELLED
    if (selectedStatus === BookingStatus.CANCELLED) {
      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        errors.reason = "Cancellation reason is required";
      } else if (trimmedReason.length < 10) {
        errors.reason = "Cancellation reason must be at least 10 characters";
      } else if (trimmedReason.length > 500) {
        errors.reason = "Cancellation reason cannot exceed 500 characters";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || isRetrying) {
      return;
    }

    // Clear any previous general errors
    setValidationErrors((prev) => ({ ...prev, general: undefined }));

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Additional validation for edge cases
    if (!booking || !booking.id) {
      setValidationErrors({
        general: "Invalid booking data. Please refresh and try again.",
      });
      return;
    }

    if (selectedStatus && selectedStatus === booking.status) {
      setValidationErrors({
        general: `Booking is already ${selectedStatus.toLowerCase()}.`,
      });
      return;
    }

    setIsSubmitting(true);

    // Check if user is authenticated before making the request
    if (!tokenUtils.hasAuthToken()) {
      setValidationErrors({
        general: "Your session has expired. Please log in again.",
      });
      setIsSubmitting(false);

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    }

    try {
      console.log("Making status update request with:", {
        bookingId: booking.id,
        selectedStatus,
        reason:
          selectedStatus === BookingStatus.CANCELLED
            ? reason.trim()
            : undefined,
        hasToken: tokenUtils.hasAuthToken(),
      });

      // Call the API to update booking status
      await onStatusUpdate(
        booking.id,
        selectedStatus!,
        selectedStatus === BookingStatus.CANCELLED ? reason.trim() : undefined
      );

      // Show success toast notification
      const statusLabel =
        selectedStatus === BookingStatus.CONFIRMED ? "confirmed" : "cancelled";
      toast({
        title: "Booking Status Updated",
        description: `Booking #${booking.id} has been successfully ${statusLabel}.`,
        variant: "default",
      });

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Status update error:", error);
      console.error("Error details:", {
        bookingId: booking.id,
        selectedStatus,
        reason:
          selectedStatus === BookingStatus.CANCELLED
            ? reason.trim()
            : undefined,
        retryCount,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        statusCode: (error as any)?.statusCode,
        isAuthError: (error as any)?.isAuthError,
        originalError: (error as any)?.originalError,
      });

      // Handle different types of errors with specific messages
      let errorMessage = "Failed to update booking status. Please try again.";
      let shouldCloseModal = false;

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        const statusCode = (error as any).statusCode;
        const isAuthError = (error as any).isAuthError;

        // Handle authorization errors (401/403)
        if (isAuthError || statusCode === 401 || statusCode === 403) {
          if (
            statusCode === 401 ||
            errorText.includes("401") ||
            errorText.includes("unauthorized")
          ) {
            errorMessage = "Your session has expired. Please log in again.";
            shouldCloseModal = true; // Close modal since user will be redirected
          } else if (
            statusCode === 403 ||
            errorText.includes("403") ||
            errorText.includes("forbidden")
          ) {
            errorMessage =
              "You don't have permission to update this booking. Only the boat owner can modify booking status.";
          }
        } else if (
          errorText.includes("404") ||
          errorText.includes("not found")
        ) {
          errorMessage = "Booking not found. It may have been deleted.";
          shouldCloseModal = true; // Close modal since booking doesn't exist
        } else if (
          errorText.includes("400") ||
          errorText.includes("bad request")
        ) {
          errorMessage =
            "Invalid request. Please check your input and try again.";
        } else if (
          errorText.includes("network") ||
          errorText.includes("fetch") ||
          errorText.includes("connection")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (errorText.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (errorText.includes("500") || errorText.includes("server")) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      // Show error toast
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Close modal for certain error types
      if (shouldCloseModal) {
        setTimeout(() => {
          onClose();
        }, 2000); // Give user time to read the error message
        return;
      }

      // Also set general error for inline display
      setValidationErrors({ general: errorMessage });

      // Increment retry count for network/server errors (but not auth errors)
      const errorText =
        error instanceof Error ? error.message.toLowerCase() : "";
      const isAuthError = (error as any)?.isAuthError;
      const isNetworkError = (error as any)?.isNetworkError;
      const isServerError = (error as any)?.isServerError;

      if (
        !isAuthError &&
        (isNetworkError ||
          isServerError ||
          errorText.includes("network") ||
          errorText.includes("timeout") ||
          errorText.includes("server") ||
          errorText.includes("connection"))
      ) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setIsSubmitting(false);
      setIsRetrying(false);
    }
  };

  // Retry function for retryable errors
  const handleRetry = async () => {
    if (retryCount >= 3) {
      toast({
        title: "Maximum Retries Reached",
        description:
          "The service appears to be temporarily unavailable. Please try again later or contact support if the problem persists.",
        variant: "destructive",
      });

      // Show fallback options
      setValidationErrors({
        general:
          "Service temporarily unavailable. You can try refreshing the page or contact support for assistance.",
      });
      return;
    }

    setIsRetrying(true);
    setValidationErrors((prev) => ({ ...prev, general: undefined }));

    // Add exponential backoff delay for retries
    const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);

    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }, delay);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isSubmitting) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-[500px]"
        onKeyDown={handleKeyDown}
        aria-describedby="booking-status-update-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Update Booking Status
          </DialogTitle>
          <DialogDescription id="booking-status-update-description">
            Update the status of this booking reservation. If cancelling, please
            provide a reason.
          </DialogDescription>
        </DialogHeader>

        {/* Booking Details Preview */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Booking ID:
              </span>
              <span className="text-sm font-semibold">#{booking.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Current Status:
              </span>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded ${
                  booking.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.status === "CONFIRMED"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Date:</span>
              <span className="text-sm">{formatDate(booking.startDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Passengers:
              </span>
              <span className="text-sm">{booking.passengerCount}</span>
            </div>
          </div>
        </div>

        {/* Status Update Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status-select" className="text-sm font-medium">
              New Status
            </Label>
            <Select
              value={selectedStatus ?? ""}
              onValueChange={(value) =>
                setSelectedStatus(value as BookingStatus)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="status-select"
                className={`w-full ${
                  validationErrors.status ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.status && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{validationErrors.status}</span>
              </div>
            )}
          </div>

          {/* Conditional Reason Field */}
          {selectedStatus === BookingStatus.CANCELLED && (
            <div className="space-y-2">
              <Label
                htmlFor="cancellation-reason"
                className="text-sm font-medium"
              >
                Cancellation Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cancellation-reason"
                placeholder="Please provide a detailed reason for cancelling this booking (minimum 10 characters)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`min-h-[100px] resize-none ${
                  validationErrors.reason ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
                maxLength={500}
                required
              />
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>This reason will be visible to the customer</span>
                <span className={reason.length > 500 ? "text-red-500" : ""}>
                  {reason.length}/500
                </span>
              </div>
              {validationErrors.reason && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationErrors.reason}</span>
                </div>
              )}
            </div>
          )}

          {/* General Error */}
          {validationErrors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">
                  {validationErrors.general}
                </span>
              </div>
              {/* Show retry button for network/server errors and if retry count < 3 */}
              {retryCount > 0 &&
                retryCount < 3 &&
                (validationErrors.general.includes("Network") ||
                  validationErrors.general.includes("network") ||
                  validationErrors.general.includes("timeout") ||
                  validationErrors.general.includes("Server") ||
                  validationErrors.general.includes("server") ||
                  validationErrors.general.includes("connection") ||
                  validationErrors.general.includes("unavailable")) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying || isSubmitting}
                    className="mt-2 h-8 text-xs"
                  >
                    {isRetrying ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                        Retrying...
                      </>
                    ) : (
                      `Retry (${3 - retryCount} attempts left)`
                    )}
                  </Button>
                )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedStatus || isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {selectedStatus === BookingStatus.CONFIRMED
                    ? "Confirming..."
                    : "Cancelling..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {selectedStatus === BookingStatus.CONFIRMED
                    ? "Confirm Booking"
                    : selectedStatus === BookingStatus.CANCELLED
                    ? "Cancel Booking"
                    : "Update Status"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingStatusUpdateModal;
