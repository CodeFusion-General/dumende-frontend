import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useProfileRetry } from "./useRetry";

export interface ProfileLoadingState {
  isLoading: boolean;
  isInitialLoading: boolean;
  isSaving: boolean;
  isUploading: boolean;
  error: Error | null;
  hasError: boolean;
}

export interface ProfileStateActions {
  setLoading: (loading: boolean) => void;
  setInitialLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: Error | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: ProfileLoadingState = {
  isLoading: false,
  isInitialLoading: true,
  isSaving: false,
  isUploading: false,
  error: null,
  hasError: false,
};

export const useProfileState = () => {
  const [state, setState] = useState<ProfileLoadingState>(initialState);
  const { executeWithRetry, isRetrying } = useProfileRetry();

  const actions: ProfileStateActions = {
    setLoading: useCallback((loading: boolean) => {
      setState((prev) => ({ ...prev, isLoading: loading }));
    }, []),

    setInitialLoading: useCallback((loading: boolean) => {
      setState((prev) => ({ ...prev, isInitialLoading: loading }));
    }, []),

    setSaving: useCallback((saving: boolean) => {
      setState((prev) => ({ ...prev, isSaving: saving }));
    }, []),

    setUploading: useCallback((uploading: boolean) => {
      setState((prev) => ({ ...prev, isUploading: uploading }));
    }, []),

    setError: useCallback((error: Error | null) => {
      setState((prev) => ({
        ...prev,
        error,
        hasError: error !== null,
        isLoading: false,
        isSaving: false,
        isUploading: false,
      }));
    }, []),

    clearError: useCallback(() => {
      setState((prev) => ({ ...prev, error: null, hasError: false }));
    }, []),

    reset: useCallback(() => {
      setState(initialState);
    }, []),
  };

  // Enhanced operation handlers with retry logic
  const handleOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: {
        loadingType?: "loading" | "saving" | "uploading";
        successMessage?: string;
        errorMessage?: string;
        showSuccessToast?: boolean;
        showErrorToast?: boolean;
      } = {}
    ): Promise<T | null> => {
      const {
        loadingType = "loading",
        successMessage,
        errorMessage,
        showSuccessToast = true,
        showErrorToast = true,
      } = options;

      try {
        // Clear previous errors
        actions.clearError();

        // Set appropriate loading state
        switch (loadingType) {
          case "saving":
            actions.setSaving(true);
            break;
          case "uploading":
            actions.setUploading(true);
            break;
          default:
            actions.setLoading(true);
        }

        // Execute operation with retry logic
        const result = await executeWithRetry(operation);

        // Show success message
        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        return result;
      } catch (error) {
        const errorObj = error as Error;
        actions.setError(errorObj);

        // Show error message
        if (showErrorToast) {
          toast.error(errorMessage || "İşlem başarısız", {
            description: errorObj.message || "Beklenmeyen bir hata oluştu.",
          });
        }

        return null;
      } finally {
        // Clear loading states
        actions.setLoading(false);
        actions.setSaving(false);
        actions.setUploading(false);
      }
    },
    [executeWithRetry, actions]
  );

  // Specific handlers for common profile operations
  const loadProfile = useCallback(
    async (loadFn: () => Promise<any>) => {
      return handleOperation(loadFn, {
        loadingType: "loading",
        showSuccessToast: false,
        errorMessage: "Profil bilgileri yüklenemedi",
      });
    },
    [handleOperation]
  );

  const saveProfile = useCallback(
    async (
      saveFn: () => Promise<any>,
      successMessage = "Profil başarıyla güncellendi"
    ) => {
      return handleOperation(saveFn, {
        loadingType: "saving",
        successMessage,
        errorMessage: "Profil güncellenemedi",
      });
    },
    [handleOperation]
  );

  const uploadPhoto = useCallback(
    async (uploadFn: () => Promise<any>) => {
      return handleOperation(uploadFn, {
        loadingType: "uploading",
        successMessage: "Fotoğraf başarıyla yüklendi",
        errorMessage: "Fotoğraf yüklenemedi",
      });
    },
    [handleOperation]
  );

  return {
    state: {
      ...state,
      isRetrying,
    },
    actions,
    operations: {
      handleOperation,
      loadProfile,
      saveProfile,
      uploadPhoto,
    },
  };
};

// Specialized hooks for different profile sections
export const usePersonalInfoState = () => {
  const { state, actions, operations } = useProfileState();

  return {
    ...state,
    actions,
    savePersonalInfo: (saveFn: () => Promise<any>) =>
      operations.saveProfile(saveFn, "Kişisel bilgiler başarıyla güncellendi"),
  };
};

export const useProfessionalInfoState = () => {
  const { state, actions, operations } = useProfileState();

  return {
    ...state,
    actions,
    saveProfessionalInfo: (saveFn: () => Promise<any>) =>
      operations.saveProfile(saveFn, "Mesleki bilgiler başarıyla güncellendi"),
  };
};

export const useStatisticsState = () => {
  const { state, actions, operations } = useProfileState();

  return {
    ...state,
    actions,
    loadStatistics: (loadFn: () => Promise<any>) =>
      operations.loadProfile(loadFn),
  };
};
