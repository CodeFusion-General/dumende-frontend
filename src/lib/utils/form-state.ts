import { useState, useCallback } from "react";
import { FieldErrors, FieldValues } from "react-hook-form";

export interface FormState {
  isSubmitting: boolean;
  isValidating: boolean;
  hasErrors: boolean;
  isDirty: boolean;
  submitCount: number;
}

export interface FormStateActions {
  setSubmitting: (submitting: boolean) => void;
  setValidating: (validating: boolean) => void;
  setDirty: (dirty: boolean) => void;
  incrementSubmitCount: () => void;
  reset: () => void;
}

export const useFormState = (initialState?: Partial<FormState>) => {
  const [state, setState] = useState<FormState>({
    isSubmitting: false,
    isValidating: false,
    hasErrors: false,
    isDirty: false,
    submitCount: 0,
    ...initialState,
  });

  const setSubmitting = useCallback((submitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting: submitting }));
  }, []);

  const setValidating = useCallback((validating: boolean) => {
    setState((prev) => ({ ...prev, isValidating: validating }));
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    setState((prev) => ({ ...prev, isDirty: dirty }));
  }, []);

  const setHasErrors = useCallback((hasErrors: boolean) => {
    setState((prev) => ({ ...prev, hasErrors }));
  }, []);

  const incrementSubmitCount = useCallback(() => {
    setState((prev) => ({ ...prev, submitCount: prev.submitCount + 1 }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      isValidating: false,
      hasErrors: false,
      isDirty: false,
      submitCount: 0,
    });
  }, []);

  const actions: FormStateActions = {
    setSubmitting,
    setValidating,
    setDirty,
    incrementSubmitCount,
    reset,
  };

  return [state, actions, setHasErrors] as const;
};

export interface ValidationState {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

export const getValidationState = (
  errors: FieldErrors<FieldValues>
): ValidationState => {
  const fieldErrors: Record<string, string> = {};
  const errorMessages: string[] = [];

  Object.entries(errors).forEach(([field, error]) => {
    if (error?.message) {
      fieldErrors[field] = error.message as string;
      errorMessages.push(error.message as string);
    }
  });

  return {
    isValid: errorMessages.length === 0,
    errors: errorMessages,
    fieldErrors,
  };
};

export const validateField = (
  value: any,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  }
): string | null => {
  const { required, minLength, maxLength, pattern, custom } = rules;

  if (required && (!value || (typeof value === "string" && !value.trim()))) {
    return "Bu alan zorunludur";
  }

  if (value && typeof value === "string") {
    if (minLength && value.length < minLength) {
      return `En az ${minLength} karakter olmalıdır`;
    }

    if (maxLength && value.length > maxLength) {
      return `En fazla ${maxLength} karakter olmalıdır`;
    }

    if (pattern && !pattern.test(value)) {
      return "Geçersiz format";
    }
  }

  if (custom) {
    const result = custom(value);
    if (typeof result === "string") {
      return result;
    }
    if (result === false) {
      return "Geçersiz değer";
    }
  }

  return null;
};

export const validateEmail = (email: string): string | null => {
  return validateField(email, {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value) => {
      if (!value) return true;
      const domain = value.split("@")[1];
      if (!domain || domain.length < 3) {
        return "Geçerli bir e-posta domaini girin";
      }
      return true;
    },
  });
};

export const validatePhone = (phone: string): string | null => {
  return validateField(phone, {
    required: true,
    pattern: /^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2}$/,
    custom: (value) => {
      if (!value) return true;
      // Remove spaces and formatting
      const cleaned = value.replace(/\s/g, "");
      if (cleaned.length < 10 || cleaned.length > 14) {
        return "Geçerli bir telefon numarası girin";
      }
      return true;
    },
  });
};

export const validateRequired = (
  value: any,
  fieldName: string
): string | null => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} alanı zorunludur`;
  }
  return null;
};

export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  if (!value) return null;

  if (value.length < min) {
    return `${fieldName} en az ${min} karakter olmalıdır`;
  }

  if (value.length > max) {
    return `${fieldName} en fazla ${max} karakter olmalıdır`;
  }

  return null;
};
