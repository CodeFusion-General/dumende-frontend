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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Send, X } from "lucide-react";
import { ReviewData } from "@/types/ratings.types";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  review: ReviewData | null;
  loading?: boolean;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  review,
  loading = false,
}) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset message when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message.trim());
      onClose();
    } catch (error) {
      console.error("Reply submission error:", error);
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  if (!review) return null;

  const getUserName = () => {
    return review.customer?.fullName || `Müşteri ${review.customer?.id || review.id}`;
  };

  const getUserInitials = () => {
    const fullName = review.customer?.fullName;
    if (!fullName) return "M";
    
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getCategory = (): "boat" | "tour" => {
    return review.boatId ? "boat" : "tour";
  };

  const getEntityName = () => {
    return review.boatName || review.tourName || "Bilinmeyen";
  };

  const getCategoryColor = (category: "boat" | "tour") => {
    return category === "boat" ? "info" : "success";
  };

  const getCategoryLabel = (category: "boat" | "tour") => {
    return category === "boat" ? "Tekne" : "Tur";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-montserrat">
            Değerlendirmeye Yanıt Ver
          </DialogTitle>
          <DialogDescription className="text-gray-600 font-roboto">
            Bu değerlendirmeye profesyonel bir yanıt yazın. Yanıtınız tüm kullanıcılar tarafından görülebilir.
          </DialogDescription>
        </DialogHeader>

        {/* Review Preview */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-start space-x-3 mb-3">
            <Avatar className="h-10 w-10 bg-primary/10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-montserrat font-semibold text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-montserrat font-semibold text-gray-900 text-sm">
                    {getUserName()}
                  </h4>
                  <p className="text-xs text-gray-500 font-roboto">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                
                {/* Star Rating */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "text-accent fill-accent"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category and Entity Tags */}
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant={getCategoryColor(getCategory())}
              className="font-montserrat font-medium text-xs"
            >
              {getCategoryLabel(getCategory())}
            </Badge>
            <Badge variant="outline" className="font-roboto text-xs">
              {getEntityName()}
            </Badge>
          </div>

          {/* Review Comment */}
          <p className="text-gray-700 font-roboto text-sm leading-relaxed">
            {review.comment}
          </p>
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reply-message" className="text-sm font-montserrat font-medium">
              Yanıtınız
            </Label>
            <Textarea
              id="reply-message"
              placeholder="Değerlendirme için teşekkür ederiz. Geri bildiriminiz bizim için çok değerli..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none font-roboto"
              disabled={isSubmitting}
              maxLength={1000}
              required
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Ctrl+Enter ile gönderebilirsiniz</span>
              <span>{message.length}/1000</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="font-montserrat"
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="font-montserrat"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Yanıtı Gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyModal;