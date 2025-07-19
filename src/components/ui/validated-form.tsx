import React, { ReactNode } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FormErrorSummary } from "./form-error";
import { useProfileFormValidation } from "@/hooks/useFormValidation";
import { Button } from "./button";
import { Save, X, Loader2 } from "lucide-react";

interface ValidatedFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  formType?: "personal" | "professional";
  children: ReactNode;
  className?: string;
  showErrorSummary?: boolean;
  submitText?: string;
  cancelText?: string;
  disabled?: boolean;
}

export function ValidatedForm<T extends FieldValues>({
  form,
  onSubmit,
  onCancel,
  formType = "personal",
  children,
  className,
  showErrorSummary = true,
  submitText = "Kaydet",
  cancelText = "İptal",
  disabled = false,
}: ValidatedFormProps<T>) {
  const [validationState, validationActions] = useProfileFormValidation(
    form,
    formType
  );

  const handleSubmit = async (data: T) => {
    try {
      validationActions.clearErrors();
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      // Handle submission errors here if needed
    }
  };

  const handleCancel = () => {
    validationActions.reset();
    onCancel?.();
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className={cn("space-y-6", className)}
    >
      {/* Error Summary */}
      {showErrorSummary &&
        validationState.hasErrors &&
        validationState.submitCount > 0 && (
          <FormErrorSummary
            errors={form.formState.errors}
            dismissible
            onDismiss={() => validationActions.toggleErrorSummary(false)}
          />
        )}

      {/* Form Content */}
      <div className="space-y-4">{children}</div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={validationState.isSubmitting || disabled}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={validationState.isSubmitting || disabled}
          className="flex items-center gap-2 bg-[#3498db] hover:bg-[#2980b9]"
        >
          {validationState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {validationState.isSubmitting ? "Kaydediliyor..." : submitText}
        </Button>
      </div>
    </form>
  );
}

interface ValidatedFieldProps {
  name: string;
  label: string;
  children: ReactNode;
  required?: boolean;
  description?: string;
  className?: string;
}

export const ValidatedField: React.FC<ValidatedFieldProps> = ({
  name,
  label,
  children,
  required = false,
  description,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={name}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};
