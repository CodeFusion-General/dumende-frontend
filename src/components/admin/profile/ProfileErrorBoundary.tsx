import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error("ProfileErrorBoundary caught an error:", error, errorInfo);

    // Show error toast
    toast.error("Bir hata oluştu", {
      description: "Sayfa yüklenirken beklenmeyen bir hata oluştu.",
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/captain";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-xl text-red-600">
              Bir Hata Oluştu
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Profil sayfası yüklenirken beklenmeyen bir hata oluştu. Lütfen
              sayfayı yenilemeyi deneyin.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-gray-50 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Hata Detayları (Geliştirici Modu)
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="flex items-center gap-2"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                Tekrar Dene
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 bg-[#3498db] hover:bg-[#2980b9]"
              >
                <Home className="h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
interface ProfileErrorWrapperProps {
  children: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const ProfileErrorWrapper: React.FC<ProfileErrorWrapperProps> = ({
  children,
  componentName = "Profile Component",
  onError,
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log component-specific error
    console.error(`Error in ${componentName}:`, error, errorInfo);

    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ProfileErrorBoundary onError={handleError}>
      {children}
    </ProfileErrorBoundary>
  );
};

// Specific error boundary for individual profile cards
export const ProfileCardErrorBoundary: React.FC<{
  children: ReactNode;
  cardName: string;
  onRetry?: () => void;
}> = ({ children, cardName, onRetry }) => {
  const fallbackUI = (
    <Card className="w-full">
      <CardContent className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-600 mb-2">
          {cardName} Yüklenemedi
        </h3>
        <p className="text-gray-600 mb-4">
          Bu bölüm yüklenirken bir hata oluştu.
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ProfileErrorBoundary fallback={fallbackUI}>
      {children}
    </ProfileErrorBoundary>
  );
};
