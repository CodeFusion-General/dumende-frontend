// Service for managing notifications and error messages

import * as React from "react";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

export interface NotificationOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  private buildToastPayload(
    message: string,
    variant: "default" | "destructive",
    options: Omit<NotificationOptions, "variant"> = {}
  ) {
    const payload: any = {
      title: options.title || (variant === "destructive" ? "Error" : "Info"),
      description: message,
      variant,
      duration: options.duration ?? (variant === "destructive" ? 7000 : 5000),
    };

    if (options.action) {
      payload.action = React.createElement(
        ToastAction,
        {
          altText: options.action.label,
          onClick: options.action.onClick,
        } as any,
        options.action.label
      );
    }

    return payload;
  }

  // Show success notification
  success(message: string, options: Omit<NotificationOptions, "variant"> = {}) {
    toast(
      this.buildToastPayload(message, "default", {
        title: options.title || "Success",
        ...options,
      })
    );
  }

  // Show error notification
  error(message: string, options: Omit<NotificationOptions, "variant"> = {}) {
    toast(
      this.buildToastPayload(message, "destructive", {
        title: options.title || "Error",
        ...options,
      })
    );
  }

  // Show warning notification
  warning(message: string, options: Omit<NotificationOptions, "variant"> = {}) {
    toast(
      this.buildToastPayload(message, "default", {
        title: options.title || "Warning",
        duration: options.duration ?? 6000,
        ...options,
      })
    );
  }

  // Show info notification
  info(message: string, options: Omit<NotificationOptions, "variant"> = {}) {
    toast(
      this.buildToastPayload(message, "default", {
        title: options.title || "Information",
        ...options,
      })
    );
  }

  // Show loading notification
  loading(message: string, options: Omit<NotificationOptions, "variant"> = {}) {
    toast(
      this.buildToastPayload(message, "default", {
        title: options.title || "Loading",
        duration: options.duration ?? 0, // Don't auto-dismiss loading notifications
        ...options,
      })
    );
  }

  // Network error notification
  networkError(options: Omit<NotificationOptions, "variant"> = {}) {
    this.error("Please check your internet connection and try again.", {
      title: "Connection Error",
      ...options,
    });
  }

  // API error notification
  apiError(error: any, options: Omit<NotificationOptions, "variant"> = {}) {
    let message = "An unexpected error occurred. Please try again.";

    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }

    this.error(message, {
      title: "API Error",
      ...options,
    });
  }

  // Validation error notification
  validationError(
    message: string,
    options: Omit<NotificationOptions, "variant"> = {}
  ) {
    this.error(message, {
      title: "Validation Error",
      ...options,
    });
  }

  // Permission error notification
  permissionError(options: Omit<NotificationOptions, "variant"> = {}) {
    this.error("You don't have permission to perform this action.", {
      title: "Permission Denied",
      ...options,
    });
  }

  // Timeout error notification
  timeoutError(options: Omit<NotificationOptions, "variant"> = {}) {
    this.error("The request took too long to complete. Please try again.", {
      title: "Request Timeout",
      ...options,
    });
  }

  // Image loading error notification
  imageLoadError(options: Omit<NotificationOptions, "variant"> = {}) {
    this.warning("Some images couldn't be loaded. Please refresh the page.", {
      title: "Image Load Error",
      ...options,
    });
  }

  // Booking error notifications
  bookingError(
    type: "unavailable" | "validation" | "payment" | "general",
    options: Omit<NotificationOptions, "variant"> = {}
  ) {
    const messages = {
      unavailable:
        "This boat is not available for the selected dates. Please choose different dates.",
      validation: "Please check your booking details and try again.",
      payment: "There was an issue processing your payment. Please try again.",
      general: "We couldn't complete your booking. Please try again later.",
    };

    const titles = {
      unavailable: "Boat Unavailable",
      validation: "Invalid Information",
      payment: "Payment Error",
      general: "Booking Failed",
    };

    this.error(messages[type], {
      title: titles[type],
      ...options,
    });
  }

  // Data loading error notification
  dataLoadError(
    dataType: string,
    options: Omit<NotificationOptions, "variant"> = {}
  ) {
    this.error(`Failed to load ${dataType}. Please try again.`, {
      title: "Loading Error",
      ...options,
    });
  }

  // Retry notification with action
  retryNotification(
    message: string,
    onRetry: () => void,
    options: Omit<NotificationOptions, "variant" | "action"> = {}
  ) {
    this.error(message, {
      action: {
        label: "Retry",
        onClick: onRetry,
      },
      ...options,
    });
  }

  // Batch error notification
  batchError(
    errors: Array<{ operation: string; error: string }>,
    options: Omit<NotificationOptions, "variant"> = {}
  ) {
    const errorCount = errors.length;
    const message =
      errorCount === 1
        ? `Failed to ${errors[0].operation}: ${errors[0].error}`
        : `${errorCount} operations failed. Please check and try again.`;

    this.error(message, {
      title: errorCount === 1 ? "Operation Failed" : "Multiple Errors",
      ...options,
    });
  }

  // Progressive loading notification
  progressiveLoadingError(
    component: string,
    options: Omit<NotificationOptions, "variant"> = {}
  ) {
    this.warning(
      `${component} couldn't be loaded. Some features may not be available.`,
      {
        title: "Partial Loading Error",
        duration: 4000,
        ...options,
      }
    );
  }

  // Offline notification
  offlineNotification(options: Omit<NotificationOptions, "variant"> = {}) {
    this.warning(
      "You're currently offline. Some features may not work properly.",
      {
        title: "Connection Lost",
        duration: 0, // Don't auto-dismiss
        ...options,
      }
    );
  }

  // Online notification
  onlineNotification(options: Omit<NotificationOptions, "variant"> = {}) {
    this.success("Connection restored. All features are now available.", {
      title: "Back Online",
      duration: 3000,
      ...options,
    });
  }
}

export const notificationService = new NotificationService();
