import { useEffect, useRef, useCallback } from "react";
import { debounce } from "lodash";

interface UseAutoSaveOptions {
  delay?: number;
  enabled?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAutoSave = <T>(data: T, options: UseAutoSaveOptions = {}) => {
  const { delay = 2000, enabled = true, onSave, onError } = options;

  const previousDataRef = useRef<T>();
  const isInitialRender = useRef(true);

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce(async (currentData: T) => {
      if (!enabled || !onSave) return;

      try {
        await onSave(currentData);
      } catch (error) {
        onError?.(error as Error);
      }
    }, delay),
    [delay, enabled, onSave, onError]
  );

  useEffect(() => {
    // Skip auto-save on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      previousDataRef.current = data;
      return;
    }

    // Check if data has actually changed
    const hasChanged =
      JSON.stringify(previousDataRef.current) !== JSON.stringify(data);

    if (hasChanged && enabled) {
      debouncedSave(data);
      previousDataRef.current = data;
    }
  }, [data, debouncedSave, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    save: () => debouncedSave(data),
    cancel: () => debouncedSave.cancel(),
  };
};

// Local storage auto-save hook
export const useLocalStorageAutoSave = <T>(
  key: string,
  data: T,
  options: Omit<UseAutoSaveOptions, "onSave"> = {}
) => {
  const saveToLocalStorage = useCallback(
    (dataToSave: T) => {
      try {
        // Filter out File objects and other non-serializable data
        const serializableData = JSON.parse(
          JSON.stringify(dataToSave, (key, value) => {
            if (value instanceof File) {
              return {
                __fileInfo: {
                  name: value.name,
                  size: value.size,
                  type: value.type,
                  lastModified: value.lastModified,
                },
              };
            }
            return value;
          })
        );

        localStorage.setItem(key, JSON.stringify(serializableData));
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
        options.onError?.(error as Error);
      }
    },
    [key, options]
  );

  return useAutoSave(data, {
    ...options,
    onSave: saveToLocalStorage,
  });
};

// Utility to load from localStorage
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
  }
  return defaultValue;
};

// Utility to clear localStorage
export const clearLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
};
