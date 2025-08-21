import { useEffect } from "react";

/**
 * Hook to prevent form submission when interacting with document upload areas
 */
export const usePreventFormSubmission = (
  containerRef: React.RefObject<HTMLElement>
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;

      // Check if the click is on a document-related element
      if (
        target.closest("[data-document-area]") ||
        target.closest("[data-document-uploader]") ||
        target.closest("[data-document-tab-container]") ||
        target.closest('input[type="file"]') ||
        target.hasAttribute("data-document-file-input")
      ) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const handleSubmit = (e: Event) => {
      const target = e.target as HTMLElement;

      // Prevent form submission if it originates from document areas
      if (
        target.closest("[data-document-area]") ||
        target.closest("[data-document-uploader]") ||
        target.closest("[data-document-tab-container]")
      ) {
        e.preventDefault();
        e.stopPropagation();
        console.log(
          "Form submission prevented by usePreventFormSubmission hook"
        );
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Enter key from submitting form when in document areas
      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        if (
          target.closest("[data-document-area]") ||
          target.closest("[data-document-uploader]") ||
          target.closest("[data-document-tab-container]")
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Add event listeners
    container.addEventListener("click", handleClick, true);
    container.addEventListener("submit", handleSubmit, true);
    container.addEventListener("keydown", handleKeyDown, true);

    // Cleanup function
    return () => {
      container.removeEventListener("click", handleClick, true);
      container.removeEventListener("submit", handleSubmit, true);
      container.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [containerRef]);
};
