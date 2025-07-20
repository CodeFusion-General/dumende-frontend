import { useState, useCallback, useEffect } from "react";
import { FieldErrors, FieldValues, UseFormReturn } from "react-hook-form";
import { useFormState, getValidationState } from "@/lib/utils/form-state";
import { validateFieldRealTime } from "@/lib/validation/profile-validators";

export interface UseFormValidationOptions {
  mode?: "onChange" | "onBlur" | "onSubmit";
  reValidateMode?: "onChange" | "onBlur" | "onSubmit";
  showErrorSummary?: boolean;
  realTimeValidation?: boolean;
}

export interface FormValidationState {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
  hasErrors: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  submitCount: number;
  showErrorSummary: boolean;
}

export interface FormValidationActions {
  validateField: (fieldName: string, value: any, rules?: any) => string | null;
  validateForm: () => boolean;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
  setFormErrors: (errors: Record<string, string>) => void;
  toggleErrorSummary: (show: boolean) => void;
  reset: () => void;
}

export const useFormValidation = <T extends FieldValues>(
  form: UseFormReturn<T>,
  options: UseFormValidationOptions = {}
) => {
  const {
    mode = "onChange",
    reValidateMode = "onChange",
    showErrorSummary = true,
    realTimeValidation = true,
  } = options;

  const [formState, formActions, setHasErrors] = useFormState();
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(showErrorSummary);

  // Get form errors from react-hook-form
  const formErrors = form.formState.errors;
  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;

  // Combine react-hook-form errors with custom errors
  const allErrors = { ...formErrors, ...customErrors };
  const validationState = getValidationState(allErrors);

  // Update form state based on validation
  useEffect(() => {
    setHasErrors(!validationState.isValid);
  }, [validationState.isValid, setHasErrors]);

  useEffect(() => {
    formActions.setDirty(isDirty);
  }, [isDirty, formActions.setDirty]);

  useEffect(() => {
    formActions.setSubmitting(isSubmitting);
  }, [isSubmitting, formActions.setSubmitting]);

  // Validate individual field
  const validateField = useCallback(
    (fieldName: string, value: any, rules?: any): string | null => {
      if (!realTimeValidation) return null;

      const error = validateFieldRealTime(fieldName, value, rules || {});

      if (error) {
        setCustomErrors((prev) => ({ ...prev, [fieldName]: error }));
      } else {
        setCustomErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      return error;
    },
    [realTimeValidation]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const isValid = form.trigger();
    formActions.incrementSubmitCount();
    return isValid;
  }, [form, formActions]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    form.clearErrors();
    setCustomErrors({});
  }, [form]);

  // Clear specific field error
  const clearFieldError = useCallback(
    (fieldName: string) => {
      form.clearErrors(fieldName as any);
      setCustomErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    },
    [form]
  );

  // Set specific field error
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setCustomErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  // Set multiple form errors
  const setFormErrors = useCallback((errors: Record<string, string>) => {
    setCustomErrors(errors);
  }, []);

  // Toggle error summary visibility
  const toggleErrorSummary = useCallback((show: boolean) => {
    setShowSummary(show);
  }, []);

  // Reset all validation state
  const reset = useCallback(() => {
    form.reset();
    setCustomErrors({});
    formActions.reset();
    setShowSummary(showErrorSummary);
  }, [form, formActions, showErrorSummary]);

  const state: FormValidationState = {
    isValid: validationState.isValid,
    errors: validationState.errors,
    fieldErrors: validationState.fieldErrors,
    hasErrors: !validationState.isValid,
    isSubmitting: formState.isSubmitting,
    isValidating: formState.isValidating,
    isDirty: formState.isDirty,
    submitCount: formState.submitCount,
    showErrorSummary: showSummary,
  };

  const actions: FormValidationActions = {
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldError,
    setFormErrors,
    toggleErrorSummary,
    reset,
  };

  return [state, actions] as const;
};

// Specialized hook for profile forms
export const useProfileFormValidation = <T extends FieldValues>(
  form: UseFormReturn<T>,
  formType: "personal" | "professional" = "personal"
) => {
  const [validationState, validationActions] = useFormValidation(form, {
    mode: "onChange",
    reValidateMode: "onChange",
    showErrorSummary: true,
    realTimeValidation: true,
  });

  // Field-specific validation rules based on form type
  const getFieldRules = useCallback(
    (fieldName: string) => {
      if (formType === "personal") {
        switch (fieldName) {
          case "firstName":
          case "lastName":
            return {
              required: true,
              minLength: 1,
              maxLength: 50,
              pattern: /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/,
            };
          case "email":
            return {
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              maxLength: 100,
            };
          case "phone":
            return {
              required: true,
              pattern: /^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2}$/,
            };
          case "city":
          case "country":
            return {
              required: true,
              maxLength: 50,
              pattern: /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/,
            };
          case "postalCode":
            return {
              pattern: /^[0-9]{5}$/,
            };
          default:
            return {};
        }
      } else if (formType === "professional") {
        switch (fieldName) {
          case "licenseNumber":
            return {
              required: true,
              pattern: /^[A-Z]{2}-[A-Z]{3}-\d{4}-\d{6}$/,
            };
          case "licenseExpiry":
            return {
              required: true,
              pattern: /^\d{4}-\d{2}-\d{2}$/,
              custom: (value: string) => {
                if (!value) return true;
                const expiry = new Date(value);
                const today = new Date();
                return (
                  expiry > today || "Lisans bitiş tarihi gelecekte olmalıdır"
                );
              },
            };
          case "yearsOfExperience":
            return {
              custom: (value: number) => {
                return (
                  (value >= 0 && value <= 50 && Number.isInteger(value)) ||
                  "Deneyim yılı 0-50 arasında tam sayı olmalıdır"
                );
              },
            };
          case "bio":
            return {
              maxLength: 500,
            };
          default:
            return {};
        }
      }
      return {};
    },
    [formType]
  );

  // Enhanced field validation with form-specific rules
  const validateFieldWithRules = useCallback(
    (fieldName: string, value: any) => {
      const rules = getFieldRules(fieldName);
      return validationActions.validateField(fieldName, value, rules);
    },
    [getFieldRules, validationActions]
  );

  return [
    validationState,
    {
      ...validationActions,
      validateField: validateFieldWithRules,
      getFieldRules,
    },
  ] as const;
};
