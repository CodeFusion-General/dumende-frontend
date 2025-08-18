import React, { Component, ErrorInfo, ReactNode } from "react";
import { mobileDetection, MobileDeviceInfo } from "../../utils/mobileDetection";
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff } from "lucide-react";

interface MobileErrorReport {
  id: string;
  timestamp: Date;
  errorType: "javascript" | "network" | "rendering" | "memory" | "unknown";
  message: string;
  stack?: string;
  componentStack?: string;

  // Device context
  deviceInfo: MobileDeviceInfo;

  // Performance context
  performanceMetrics?: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };

  // Page context
  routePath: string;
  userAgent: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    report: MobileErrorReport
  ) => void;
  enableRecovery?: boolean;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorReport: MobileErrorReport | null;
  retryCount: number;
  isRecovering: boolean;
  recoveryMode: "basic" | "offline" | "reload" | null;
}

export class MobileErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorReport: null,
      retryCount: 0,
      isRecovering: false,
      recoveryMode: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const deviceInfo = mobileDetection.detectMobileDevice();
    const errorReport = this.createErrorReport(error, errorInfo, deviceInfo);

    this.setState({
      errorInfo,
      errorReport,
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorReport);
    }

    // Log error for debugging
    console.error("MobileErrorBoundary caught an error:", error, errorInfo);

    // Report error to monitoring service (if available)
    this.reportError(errorReport);
  }

  private createErrorReport(
    error: Error,
    errorInfo: ErrorInfo,
    deviceInfo: MobileDeviceInfo
  ): MobileErrorReport {
    const errorType = this.classifyError(error);
    const performanceMetrics = this.getPerformanceMetrics();

    return {
      id: `mobile-error-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      timestamp: new Date(),
      errorType,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      deviceInfo,
      performanceMetrics,
      routePath: window.location.pathname,
      userAgent: navigator.userAgent,
    };
  }

  private classifyError(error: Error): MobileErrorReport["errorType"] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || "";

    // Memory-related errors
    if (
      message.includes("memory") ||
      message.includes("heap") ||
      stack.includes("out of memory")
    ) {
      return "memory";
    }

    // Network-related errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection")
    ) {
      return "network";
    }

    // Rendering-related errors
    if (
      message.includes("render") ||
      message.includes("component") ||
      stack.includes("react-dom")
    ) {
      return "rendering";
    }

    // JavaScript errors
    if (
      error instanceof TypeError ||
      error instanceof ReferenceError ||
      error instanceof SyntaxError
    ) {
      return "javascript";
    }

    return "unknown";
  }

  private getPerformanceMetrics() {
    try {
      // @ts-ignore - performance.memory is not in all TypeScript definitions
      const memory = performance.memory;

      if (memory) {
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
    } catch (e) {
      // Ignore errors getting performance metrics
    }

    return undefined;
  }

  private reportError(errorReport: MobileErrorReport) {
    // In a real app, this would send to your error tracking service
    // For now, we'll just log it
    console.warn("Mobile Error Report:", errorReport);

    // You could integrate with services like Sentry, LogRocket, etc.
    // Example:
    // Sentry.captureException(error, {
    //   tags: {
    //     errorType: errorReport.errorType,
    //     deviceType: errorReport.deviceInfo.deviceType,
    //     isMobile: errorReport.deviceInfo.isMobile
    //   },
    //   extra: errorReport
    // });
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount >= maxRetries) {
      this.handleReload();
      return;
    }

    this.setState({
      isRecovering: true,
      retryCount: this.state.retryCount + 1,
    });

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Attempt recovery after a delay
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorReport: null,
        isRecovering: false,
        recoveryMode: null,
      });
    }, 1000);
  };

  private handleBasicMode = () => {
    this.setState({
      recoveryMode: "basic",
      isRecovering: true,
    });

    // Simulate basic mode recovery
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorReport: null,
        isRecovering: false,
      });
    }, 500);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private renderErrorUI() {
    const { errorReport } = this.state;
    const deviceInfo = errorReport?.deviceInfo;

    if (!errorReport || !deviceInfo) {
      return this.renderGenericError();
    }

    // Different UI based on error type and device
    switch (errorReport.errorType) {
      case "memory":
        return this.renderMemoryError(deviceInfo);
      case "network":
        return this.renderNetworkError(deviceInfo);
      case "rendering":
        return this.renderRenderingError(deviceInfo);
      default:
        return this.renderGenericError();
    }
  }

  private renderMemoryError(deviceInfo: MobileDeviceInfo) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">
              Memory Issue
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            {deviceInfo.isLowEndDevice
              ? "Your device is running low on memory. We'll switch to a lighter version."
              : "The app is using too much memory. Let's try a simpler version."}
          </p>

          <div className="space-y-3">
            <button
              onClick={this.handleBasicMode}
              disabled={this.state.isRecovering}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {this.state.isRecovering ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Switch to Basic Mode
            </button>

            <button
              onClick={this.handleGoHome}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderNetworkError(deviceInfo: MobileDeviceInfo) {
    const isSlowConnection =
      deviceInfo.connectionType === "slow-2g" ||
      deviceInfo.connectionType === "2g";

    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            {navigator.onLine ? (
              <Wifi className="h-8 w-8 text-yellow-500 mr-3" />
            ) : (
              <WifiOff className="h-8 w-8 text-red-500 mr-3" />
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              Connection Issue
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            {!navigator.onLine
              ? "You appear to be offline. Please check your internet connection."
              : isSlowConnection
              ? "Your connection seems slow. We'll optimize the experience for you."
              : "There was a network error. Let's try again."}
          </p>

          <div className="space-y-3">
            <button
              onClick={this.handleRetry}
              disabled={this.state.isRecovering}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {this.state.isRecovering ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Try Again
            </button>

            {isSlowConnection && (
              <button
                onClick={this.handleBasicMode}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Use Offline Mode
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  private renderRenderingError(deviceInfo: MobileDeviceInfo) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">
              Display Issue
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            Something went wrong with displaying this page.
            {deviceInfo.isLowEndDevice &&
              " We'll try a simpler version that works better on your device."}
          </p>

          <div className="space-y-3">
            <button
              onClick={this.handleRetry}
              disabled={this.state.isRecovering}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {this.state.isRecovering ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Try Again
            </button>

            {deviceInfo.isLowEndDevice && (
              <button
                onClick={this.handleBasicMode}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Use Basic Version
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  private renderGenericError() {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-gray-500 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">
              Something went wrong
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try
            refreshing the page.
          </p>

          <div className="space-y-3">
            <button
              onClick={this.handleRetry}
              disabled={this.state.isRecovering}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {this.state.isRecovering ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Try Again
            </button>

            <button
              onClick={this.handleReload}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Refresh Page
            </button>

            <button
              onClick={this.handleGoHome}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withMobileErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  return function WrappedComponent(props: P) {
    return (
      <MobileErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </MobileErrorBoundary>
    );
  };
}
