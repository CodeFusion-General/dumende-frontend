import { useState, useEffect } from "react";
import { getWorkingImageUrl, getDefaultImageUrl } from "@/lib/imageUtils";

export const useImageFallback = (
  primaryUrl: string,
  fallbackIndex: number = 0
) => {
  const [imageUrl, setImageUrl] = useState<string>(primaryUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const workingUrl = await getWorkingImageUrl(primaryUrl, fallbackIndex);
        if (isMounted) {
          setImageUrl(workingUrl);
          setHasError(workingUrl.startsWith("data:"));
        }
      } catch (error) {
        if (isMounted) {
          setImageUrl(getDefaultImageUrl(fallbackIndex));
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [primaryUrl, fallbackIndex]);

  return { imageUrl, isLoading, hasError };
};

// Simpler hook for immediate fallback without async testing
export const useImageWithFallback = (
  primaryUrl: string,
  fallbackIndex: number = 0
) => {
  const [imageUrl, setImageUrl] = useState<string>(primaryUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageUrl(getDefaultImageUrl(fallbackIndex));
    }
  };

  return { imageUrl, hasError, handleError };
};
