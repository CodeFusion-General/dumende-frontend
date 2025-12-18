import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalType =
  | "default"
  | "confirmation"
  | "warning"
  | "error"
  | "success"
  | "info";

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface AdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  type?: ModalType;
  actions?: ModalAction[];
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw] h-[95vh]",
};

const typeIcons: Record<ModalType, React.ReactNode> = {
  default: null,
  confirmation: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export function AdminModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  type = "default",
  actions = [],
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
}: AdminModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (closeOnEscape && e.key === "Escape") {
      handleClose();
    }
  };

  React.useEffect(() => {
    if (open && closeOnEscape) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => document.removeEventListener("keydown", handleEscapeKey);
    }
  }, [open, closeOnEscape]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          size === "full" && "h-[95vh]",
          contentClassName
        )}
        onPointerDownOutside={
          closeOnOverlayClick ? undefined : (e) => e.preventDefault()
        }
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className={cn("relative", headerClassName)}>
          <div className="flex items-center gap-3">
            {typeIcons[type]}
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="absolute right-0 top-0 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Kapat</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className={cn("flex-1", size === "full" && "overflow-hidden")}>
          {size === "full" ? (
            <ScrollArea className="h-full pr-4">
              <div className={className}>{children}</div>
            </ScrollArea>
          ) : (
            <div className={className}>{children}</div>
          )}
        </div>

        {/* Footer */}
        {actions.length > 0 && (
          <DialogFooter className={cn("gap-2", footerClassName)}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="min-w-[80px]"
              >
                {action.loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    {action.icon}
                    {action.label}
                  </>
                )}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Predefined modal configurations for common use cases
export const modalConfigs = {
  confirmation: (
    title: string,
    description: string,
    onConfirm: () => void,
    onCancel: () => void,
    confirmLabel = "Onayla",
    cancelLabel = "İptal"
  ): Omit<AdminModalProps, "open" | "onOpenChange" | "children"> => ({
    title,
    description,
    type: "confirmation",
    size: "sm",
    actions: [
      {
        label: cancelLabel,
        onClick: onCancel,
        variant: "outline",
      },
      {
        label: confirmLabel,
        onClick: onConfirm,
        variant: "default",
      },
    ],
  }),

  destructive: (
    title: string,
    description: string,
    onConfirm: () => void,
    onCancel: () => void,
    confirmLabel = "Sil",
    cancelLabel = "İptal"
  ): Omit<AdminModalProps, "open" | "onOpenChange" | "children"> => ({
    title,
    description,
    type: "warning",
    size: "sm",
    actions: [
      {
        label: cancelLabel,
        onClick: onCancel,
        variant: "outline",
      },
      {
        label: confirmLabel,
        onClick: onConfirm,
        variant: "destructive",
      },
    ],
  }),

  info: (
    title: string,
    description: string,
    onClose: () => void,
    closeLabel = "Tamam"
  ): Omit<AdminModalProps, "open" | "onOpenChange" | "children"> => ({
    title,
    description,
    type: "info",
    size: "sm",
    actions: [
      {
        label: closeLabel,
        onClick: onClose,
        variant: "default",
      },
    ],
  }),

  success: (
    title: string,
    description: string,
    onClose: () => void,
    closeLabel = "Tamam"
  ): Omit<AdminModalProps, "open" | "onOpenChange" | "children"> => ({
    title,
    description,
    type: "success",
    size: "sm",
    actions: [
      {
        label: closeLabel,
        onClick: onClose,
        variant: "default",
      },
    ],
  }),

  error: (
    title: string,
    description: string,
    onClose: () => void,
    closeLabel = "Tamam"
  ): Omit<AdminModalProps, "open" | "onOpenChange" | "children"> => ({
    title,
    description,
    type: "error",
    size: "sm",
    actions: [
      {
        label: closeLabel,
        onClick: onClose,
        variant: "default",
      },
    ],
  }),

  form: (
    title: string,
    description?: string,
    onSave?: () => void,
    onCancel?: () => void,
    saveLabel = "Kaydet",
    cancelLabel = "İptal",
    saveLoading = false,
    saveDisabled = false
  ): Omit<AdminModalProps, "open" | "onOpenChange" | "children"> => ({
    title,
    description,
    type: "default",
    size: "lg",
    actions: [
      ...(onCancel
        ? [
            {
              label: cancelLabel,
              onClick: onCancel,
              variant: "outline" as const,
            },
          ]
        : []),
      ...(onSave
        ? [
            {
              label: saveLabel,
              onClick: onSave,
              variant: "default" as const,
              loading: saveLoading,
              disabled: saveDisabled,
            },
          ]
        : []),
    ],
  }),
};
