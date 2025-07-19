import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { FormError } from "./form-error";
import { cn } from "@/lib/utils";
import { validateFieldRealTime } from "@/lib/validation/profile-validators";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  description?: string;
  validationRules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
  showValidationIcon?: boolean;
  realTimeValidation?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  name,
  error,
  required = false,
  description,
  validationRules = {},
  showValidationIcon = true,
  realTimeValidation = true,
  onValidationChange,
  className,
  onChange,
  onBlur,
  value,
  ...props
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  // Combine external error with local validation error
  const displayError = error || localError;
  const hasError = Boolean(displayError);

  // Real-time validation
  const validateValue = (inputValue: any) => {
    if (!realTimeValidation || !isTouched) return;

    const validationError = validateFieldRealTime(
      label,
      inputValue,
      validationRules
    );

    setLocalError(validationError);
    const valid = !validationError;
    setIsValid(valid);

    onValidationChange?.(valid, validationError || undefined);
  };

  // Validate on value change
  useEffect(() => {
    if (isTouched) {
      validateValue(value);
    }
  }, [value, isTouched, realTimeValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (realTimeValidation && isTouched) {
      validateValue(e.target.value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);
    onBlur?.(e);
    if (realTimeValidation) {
      validateValue(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        <Input
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "pr-10",
            hasError && "border-destructive focus-visible:ring-destructive",
            isValid &&
              isTouched &&
              value &&
              "border-green-500 focus-visible:ring-green-500",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${name}-error`
              : description
              ? `${name}-description`
              : undefined
          }
          {...props}
        />

        {/* Validation Icon */}
        {showValidationIcon && isTouched && value && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && <FormError error={displayError} className="mt-1" />}
    </div>
  );
};

interface ValidatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  description?: string;
  validationRules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean | string;
  };
  showCharacterCount?: boolean;
  realTimeValidation?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  label,
  name,
  error,
  required = false,
  description,
  validationRules = {},
  showCharacterCount = true,
  realTimeValidation = true,
  onValidationChange,
  className,
  onChange,
  onBlur,
  value,
  maxLength,
  ...props
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  const displayError = error || localError;
  const hasError = Boolean(displayError);
  const characterCount = typeof value === "string" ? value.length : 0;

  const validateValue = (inputValue: any) => {
    if (!realTimeValidation || !isTouched) return;

    const validationError = validateFieldRealTime(
      label,
      inputValue,
      validationRules
    );

    setLocalError(validationError);
    const valid = !validationError;
    setIsValid(valid);

    onValidationChange?.(valid, validationError || undefined);
  };

  useEffect(() => {
    if (isTouched) {
      validateValue(value);
    }
  }, [value, isTouched, realTimeValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    if (realTimeValidation && isTouched) {
      validateValue(e.target.value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsTouched(true);
    onBlur?.(e);
    if (realTimeValidation) {
      validateValue(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={maxLength}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            hasError && "border-destructive focus-visible:ring-destructive",
            isValid &&
              isTouched &&
              value &&
              "border-green-500 focus-visible:ring-green-500",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${name}-error`
              : description
              ? `${name}-description`
              : undefined
          }
          {...props}
        />
      </div>

      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <div className="flex justify-end">
          <span
            className={cn(
              "text-xs text-muted-foreground",
              characterCount > maxLength * 0.9 && "text-orange-500",
              characterCount >= maxLength && "text-destructive"
            )}
          >
            {characterCount}/{maxLength}
          </span>
        </div>
      )}

      {/* Error Message */}
      {hasError && <FormError error={displayError} className="mt-1" />}
    </div>
  );
};
