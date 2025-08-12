import { useEffect, useCallback, useRef } from "react";

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
  onTab?: (direction: "forward" | "backward") => void;
  trapFocus?: boolean;
  autoFocus?: boolean;
}

export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseKeyboardNavigationOptions = {}
) => {
  const {
    enabled = true,
    onEscape,
    onEnter,
    onTab,
    trapFocus = false,
    autoFocus = false,
  } = options;

  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(", ");

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((element) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    focusableElementsRef.current = elements;
    return elements;
  }, [containerRef]);

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  // Focus the last focusable element
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return;

      const { key, shiftKey, target } = event;
      const elements = getFocusableElements();

      switch (key) {
        case "Escape":
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;

        case "Enter":
          if (onEnter && target instanceof HTMLElement) {
            // Only trigger onEnter for non-button elements
            if (target.tagName !== "BUTTON" && target.type !== "submit") {
              event.preventDefault();
              onEnter();
            }
          }
          break;

        case "Tab":
          if (trapFocus && elements.length > 0) {
            const currentIndex = elements.indexOf(target as HTMLElement);

            if (shiftKey) {
              // Shift + Tab (backward)
              if (currentIndex <= 0) {
                event.preventDefault();
                focusLast();
              }
              onTab?.("backward");
            } else {
              // Tab (forward)
              if (currentIndex >= elements.length - 1) {
                event.preventDefault();
                focusFirst();
              }
              onTab?.("forward");
            }
          } else if (onTab) {
            onTab(shiftKey ? "backward" : "forward");
          }
          break;

        case "ArrowDown":
        case "ArrowUp":
          // Handle arrow key navigation for form sections
          if (
            target instanceof HTMLElement &&
            target.getAttribute("role") === "button"
          ) {
            event.preventDefault();
            const currentIndex = elements.indexOf(target);
            let nextIndex;

            if (key === "ArrowDown") {
              nextIndex = currentIndex + 1;
              if (nextIndex >= elements.length) nextIndex = 0;
            } else {
              nextIndex = currentIndex - 1;
              if (nextIndex < 0) nextIndex = elements.length - 1;
            }

            if (elements[nextIndex]) {
              elements[nextIndex].focus();
            }
          }
          break;

        case "Home":
          if (elements.length > 0) {
            event.preventDefault();
            focusFirst();
          }
          break;

        case "End":
          if (elements.length > 0) {
            event.preventDefault();
            focusLast();
          }
          break;
      }
    },
    [
      enabled,
      containerRef,
      getFocusableElements,
      onEscape,
      onEnter,
      onTab,
      trapFocus,
      focusFirst,
      focusLast,
    ]
  );

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);

    // Auto-focus first element if requested
    if (autoFocus) {
      const timer = setTimeout(() => {
        focusFirst();
      }, 100);

      return () => {
        clearTimeout(timer);
        container.removeEventListener("keydown", handleKeyDown);
      };
    }

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, containerRef, handleKeyDown, autoFocus, focusFirst]);

  return {
    focusFirst,
    focusLast,
    getFocusableElements,
  };
};

// Hook for managing focus announcements for screen readers
export const useFocusAnnouncement = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (!announcementRef.current) {
        // Create announcement element if it doesn't exist
        const element = document.createElement("div");
        element.setAttribute("aria-live", priority);
        element.setAttribute("aria-atomic", "true");
        element.className = "sr-only";
        element.id = "focus-announcement";
        document.body.appendChild(element);
        announcementRef.current = element;
      }

      // Update the message
      announcementRef.current.setAttribute("aria-live", priority);
      announcementRef.current.textContent = message;

      // Clear the message after a delay to allow for re-announcements
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = "";
        }
      }, 1000);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (announcementRef.current && announcementRef.current.parentNode) {
        announcementRef.current.parentNode.removeChild(announcementRef.current);
      }
    };
  }, []);

  return { announce };
};

// Hook for managing skip links
export const useSkipLinks = (
  skipTargets: Array<{ id: string; label: string }>
) => {
  useEffect(() => {
    // Create skip links container
    const skipContainer = document.createElement("div");
    skipContainer.className = "skip-links";
    skipContainer.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 1000;
    `;

    skipTargets.forEach(({ id, label }) => {
      const skipLink = document.createElement("a");
      skipLink.href = `#${id}`;
      skipLink.textContent = label;
      skipLink.className = "profile-skip-link";
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(id);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      skipContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipContainer, document.body.firstChild);

    return () => {
      if (skipContainer.parentNode) {
        skipContainer.parentNode.removeChild(skipContainer);
      }
    };
  }, [skipTargets]);
};
