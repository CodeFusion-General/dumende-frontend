import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormErrorProps {
  error?: string | string[];
  className?: string;
  variant?: "inline" | "alert" | "toast";
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const FormError: React.FC<FormErrorProps> = ({
  error,
  className,
  variant = "inline",
  dismissible = false,
  onDismiss,
}) => {
  if (!error) return null;

  const errors = Array.isArray(error) ? error : [error];

  if (variant === "inline") {
    return (
      <div className={cn("space-y-1", className)}>
        {errors.map((err, index) => (
          <p
            key={index}
            className="text-sm font-medium text-destructive flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {err}
          </p>
        ))}
      </div>
    );
  }

  if (variant === "alert") {
    return (
      <Alert variant="destructive" className={cn("", className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="space-y-1">
            {errors.map((err, index) => (
              <div key={index}>{err}</div>
            ))}
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

interface FieldErrorProps {
  name: string;
  errors: Record<string, any>;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({
  name,
  errors,
  className,
}) => {
  const error = errors[name]?.message;
  return <FormError error={error} className={className} />;
};

interface FormErrorSummaryProps {
  errors: Record<string, any>;
  className?: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  className,
  title = "Lütfen aşağıdaki hataları düzeltin:",
  dismissible = false,
  onDismiss,
}) => {
  const errorMessages = Object.values(errors)
    .filter((error: any) => error?.message)
    .map((error: any) => error.message);

  if (errorMessages.length === 0) return null;

  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium mb-2">{title}</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errorMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
