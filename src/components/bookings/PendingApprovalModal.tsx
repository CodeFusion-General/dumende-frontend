import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookingDTO } from "@/types/booking.types";
import { Check, X, AlertCircle, Clock, User, Ship, Calendar, Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bookingService } from "@/services/bookingService";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { tr } from "date-fns/locale";

interface PendingApprovalModalProps {
  booking: BookingDTO;
  isOpen: boolean;
  onClose: () => void;
  onApprovalComplete: () => void;
}

const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({
  booking,
  isOpen,
  onClose,
  onApprovalComplete,
}) => {
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Calculate time remaining until deadline
  useEffect(() => {
    if (!booking.ownerApprovalDeadline) return;

    const calculateTimeRemaining = () => {
      const deadline = new Date(booking.ownerApprovalDeadline!);
      const now = new Date();

      if (deadline <= now) {
        setTimeRemaining("Expired");
        return;
      }

      const hoursLeft = differenceInHours(deadline, now);
      const minutesLeft = differenceInMinutes(deadline, now) % 60;

      if (hoursLeft > 0) {
        setTimeRemaining(`${hoursLeft} saat ${minutesLeft} dakika`);
      } else {
        setTimeRemaining(`${minutesLeft} dakika`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [booking.ownerApprovalDeadline]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShowRejectForm(false);
      setRejectReason("");
      setValidationError(null);
      setIsApproving(false);
      setIsRejecting(false);
    }
  }, [isOpen]);

  const handleApprove = async () => {
    setIsApproving(true);
    setValidationError(null);

    try {
      await bookingService.approveBooking(booking.id);

      toast({
        title: "Rezervasyon Onaylandi",
        description: `#${booking.id} numarali rezervasyon onaylandi. Musteriye odeme linki gonderildi.`,
        variant: "default",
      });

      onApprovalComplete();
      onClose();
    } catch (error) {
      console.error("Approval error:", error);

      let errorMessage = "Rezervasyon onaylanirken bir hata olustu.";
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        if (errorText.includes("401") || errorText.includes("unauthorized")) {
          errorMessage = "Oturum suresi doldu. Lutfen tekrar giris yapin.";
        } else if (errorText.includes("403") || errorText.includes("forbidden")) {
          errorMessage = "Bu rezervasyonu onaylama yetkiniz yok.";
        } else if (errorText.includes("404") || errorText.includes("not found")) {
          errorMessage = "Rezervasyon bulunamadi.";
        }
      }

      toast({
        title: "Onay Basarisiz",
        description: errorMessage,
        variant: "destructive",
      });

      setValidationError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      setValidationError("Ret sebebi zorunludur.");
      return;
    }

    if (trimmedReason.length < 10) {
      setValidationError("Ret sebebi en az 10 karakter olmalidir.");
      return;
    }

    setIsRejecting(true);
    setValidationError(null);

    try {
      await bookingService.rejectBooking(booking.id, trimmedReason);

      toast({
        title: "Rezervasyon Reddedildi",
        description: `#${booking.id} numarali rezervasyon reddedildi. Musteriye bildirim gonderildi.`,
        variant: "default",
      });

      onApprovalComplete();
      onClose();
    } catch (error) {
      console.error("Rejection error:", error);

      let errorMessage = "Rezervasyon reddedilirken bir hata olustu.";
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        if (errorText.includes("401") || errorText.includes("unauthorized")) {
          errorMessage = "Oturum suresi doldu. Lutfen tekrar giris yapin.";
        } else if (errorText.includes("403") || errorText.includes("forbidden")) {
          errorMessage = "Bu rezervasyonu reddetme yetkiniz yok.";
        } else if (errorText.includes("404") || errorText.includes("not found")) {
          errorMessage = "Rezervasyon bulunamadi.";
        }
      }

      toast({
        title: "Ret Basarisiz",
        description: errorMessage,
        variant: "destructive",
      });

      setValidationError(errorMessage);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleClose = () => {
    if (!isApproving && !isRejecting) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy HH:mm", { locale: tr });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const isExpired = booking.ownerApprovalDeadline && new Date(booking.ownerApprovalDeadline) <= new Date();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Onay Bekleyen Rezervasyon
          </DialogTitle>
          <DialogDescription>
            Bu rezervasyon talebini onaylayabilir veya reddedebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        {/* Deadline Warning */}
        {booking.ownerApprovalDeadline && (
          <div className={`p-3 rounded-lg flex items-center gap-3 ${
            isExpired
              ? "bg-red-50 border border-red-200"
              : "bg-amber-50 border border-amber-200"
          }`}>
            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
              isExpired ? "text-red-500" : "text-amber-500"
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                isExpired ? "text-red-700" : "text-amber-700"
              }`}>
                {isExpired ? "Sure Doldu!" : "Son Onay Suresi"}
              </p>
              <p className={`text-xs ${
                isExpired ? "text-red-600" : "text-amber-600"
              }`}>
                {isExpired
                  ? "Bu rezervasyon otomatik olarak iptal edilecek."
                  : `Kalan sure: ${timeRemaining}`
                }
              </p>
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-4 border space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2 rounded-full bg-purple-100">
              <Ship className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rezervasyon No</p>
              <p className="font-semibold text-lg">#{booking.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Musteri ID</p>
                <p className="text-sm font-medium">#{booking.customerId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Yolcu Sayisi</p>
                <p className="text-sm font-medium">{booking.passengerCount} kisi</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Tarih</p>
                <p className="text-sm font-medium">
                  {formatDate(booking.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Tutar</p>
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency(booking.totalPrice || 0)}
                </p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1">Musteri Notu</p>
              <p className="text-sm italic text-gray-700">"{booking.notes}"</p>
            </div>
          )}
        </div>

        {/* Reject Form */}
        {showRejectForm && (
          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <Label htmlFor="reject-reason" className="text-sm font-medium text-red-700">
              Ret Sebebi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Lutfen musteriye bildirilecek ret sebebini yazin (en az 10 karakter)..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setValidationError(null);
              }}
              className="min-h-[100px] resize-none border-red-200 focus:border-red-400"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Bu aciklama musteriye gosterilecektir</span>
              <span>{rejectReason.length}/500</span>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{validationError}</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!showRejectForm ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejectForm(true)}
                disabled={isApproving || isRejecting || isExpired}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <X className="h-4 w-4 mr-2" />
                Reddet
              </Button>
              <Button
                type="button"
                onClick={handleApprove}
                disabled={isApproving || isRejecting || isExpired}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Onaylaniyor...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Onayla
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason("");
                  setValidationError(null);
                }}
                disabled={isRejecting}
              >
                Geri
              </Button>
              <Button
                type="button"
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isRejecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reddediliyor...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Rezervasyonu Reddet
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PendingApprovalModal;
