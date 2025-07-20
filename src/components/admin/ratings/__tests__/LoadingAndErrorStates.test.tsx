import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ErrorBoundary from "../errors/ErrorBoundary";
import {
  NetworkError,
  ServerError,
  TimeoutError,
  DataLoadingError,
  ChartError,
  EmptySearchResults,
  ComponentErrorWrapper,
} from "../errors/ErrorStates";
import {
  LoadingSpinner,
  PageLoading,
  CardLoading,
  ChartLoading,
  DataLoadingProgress,
  InlineLoading,
  LoadingOverlay,
} from "../loading/LoadingStates";
import {
  NoReviewsEmpty,
  FilteredResultsEmpty,
  SearchResultsEmpty,
  NoDataEmpty,
  ChartEmpty,
  RecentActivityEmpty,
  StatisticsEmpty,
  WelcomeState,
  MaintenanceState,
} from "../empty/EmptyStates";
import {
  RatingsSummaryCardSkeleton,
  RatingDistributionCardSkeleton,
  RatingTrendsChartSkeleton,
  CategoryBreakdownChartSkeleton,
  RecentActivityCardSkeleton,
  ReviewCardSkeleton,
  RatingsHeaderSkeleton,
  ReviewsFilterBarSkeleton,
  RatingsPageSkeleton,
} from "../skeletons/SkeletonLoaders";

// Mock console methods to avoid noise in tests
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("Error Components", () => {
  describe("ErrorBoundary", () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error("Test error");
      }
      return <div>No error</div>;
    };

    it("renders children when there is no error", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("No error")).toBeInTheDocument();
    });

    it("renders error UI when there is an error", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Bir Hata Oluştu")).toBeInTheDocument();
      expect(screen.getByText("Tekrar Dene")).toBeInTheDocument();
      expect(screen.getByText("Ana Sayfaya Dön")).toBeInTheDocument();
    });

    it("calls onError callback when error occurs", () => {
      const onError = vi.fn();
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
    });

    it("renders custom fallback when provided", () => {
      const customFallback = <div>Custom error message</div>;
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });
  });

  describe("Error State Components", () => {
    it("renders NetworkError with retry button", () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} />);

      expect(screen.getByText("Bağlantı Hatası")).toBeInTheDocument();
      expect(screen.getByText("Tekrar Dene")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Tekrar Dene"));
      expect(onRetry).toHaveBeenCalled();
    });

    it("renders ServerError with appropriate message", () => {
      render(<ServerError />);

      expect(screen.getByText("Sunucu Hatası")).toBeInTheDocument();
      expect(screen.getByText(/Sunucuda bir sorun oluştu/)).toBeInTheDocument();
    });

    it("renders TimeoutError with appropriate message", () => {
      render(<TimeoutError />);

      expect(screen.getByText("Zaman Aşımı")).toBeInTheDocument();
      expect(screen.getByText(/İstek çok uzun sürdü/)).toBeInTheDocument();
    });

    it("renders DataLoadingError with retry functionality", () => {
      const onRetry = vi.fn();
      render(<DataLoadingError onRetry={onRetry} />);

      expect(screen.getByText("Veri Yükleme Hatası")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Tekrar Dene"));
      expect(onRetry).toHaveBeenCalled();
    });

    it("renders ChartError with retry functionality", () => {
      const onRetry = vi.fn();
      render(<ChartError onRetry={onRetry} />);

      expect(screen.getByText("Grafik Yüklenemedi")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Yenile"));
      expect(onRetry).toHaveBeenCalled();
    });

    it("renders EmptySearchResults with search term", () => {
      const onClearSearch = vi.fn();
      render(
        <EmptySearchResults
          searchTerm="test search"
          onClearSearch={onClearSearch}
        />
      );

      expect(screen.getByText("Sonuç Bulunamadı")).toBeInTheDocument();
      expect(screen.getByText(/test search/)).toBeInTheDocument();
      fireEvent.click(screen.getByText("Filtreleri Temizle"));
      expect(onClearSearch).toHaveBeenCalled();
    });
  });

  describe("ComponentErrorWrapper", () => {
    it("renders children when no error occurs", () => {
      render(
        <ComponentErrorWrapper>
          <div>Test content</div>
        </ComponentErrorWrapper>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("renders error state when error occurs", async () => {
      const onError = vi.fn();
      render(
        <ComponentErrorWrapper onError={onError} componentName="Test Component">
          <div>Test content</div>
        </ComponentErrorWrapper>
      );

      // Simulate an error event
      const errorEvent = new ErrorEvent("error", {
        message: "Test error",
        filename: "test.js",
        lineno: 1,
        colno: 1,
      });
      window.dispatchEvent(errorEvent);

      await waitFor(() => {
        expect(
          screen.getByText(/Test Component yüklenirken/)
        ).toBeInTheDocument();
      });
    });
  });
});

describe("Loading Components", () => {
  describe("LoadingSpinner", () => {
    it("renders with default props", () => {
      render(<LoadingSpinner />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders with custom text", () => {
      render(<LoadingSpinner text="Custom loading text" />);
      expect(screen.getByText("Custom loading text")).toBeInTheDocument();
    });

    it("renders with different sizes", () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(document.querySelector(".h-4")).toBeInTheDocument();

      rerender(<LoadingSpinner size="lg" />);
      expect(document.querySelector(".h-8")).toBeInTheDocument();
    });
  });

  describe("PageLoading", () => {
    it("renders with default message", () => {
      render(<PageLoading />);
      expect(
        screen.getByText("Değerlendirmeler Yükleniyor")
      ).toBeInTheDocument();
      expect(screen.getByText("Sayfa yükleniyor...")).toBeInTheDocument();
    });

    it("renders with custom message", () => {
      render(<PageLoading message="Custom loading message" />);
      expect(screen.getByText("Custom loading message")).toBeInTheDocument();
    });
  });

  describe("CardLoading", () => {
    it("renders with default props", () => {
      render(<CardLoading />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      render(<CardLoading title="Loading chart data..." />);
      expect(screen.getByText("Loading chart data...")).toBeInTheDocument();
    });
  });

  describe("ChartLoading", () => {
    it("renders with default title", () => {
      render(<ChartLoading />);
      expect(screen.getByText("Grafik yükleniyor...")).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      render(<ChartLoading title="Custom chart loading" />);
      expect(screen.getByText("Custom chart loading")).toBeInTheDocument();
    });
  });

  describe("DataLoadingProgress", () => {
    it("renders with progress bar", () => {
      render(<DataLoadingProgress progress={50} />);
      expect(screen.getByText("Veriler yükleniyor...")).toBeInTheDocument();
      expect(screen.getByText("%50 tamamlandı")).toBeInTheDocument();
    });

    it("renders without progress when not provided", () => {
      render(<DataLoadingProgress />);
      expect(screen.getByText("Veriler yükleniyor...")).toBeInTheDocument();
      expect(screen.queryByText(/tamamlandı/)).not.toBeInTheDocument();
    });
  });

  describe("InlineLoading", () => {
    it("renders with text", () => {
      render(<InlineLoading text="Loading..." />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders without text", () => {
      render(<InlineLoading />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("LoadingOverlay", () => {
    it("renders when visible", () => {
      render(<LoadingOverlay isVisible={true} />);
      expect(screen.getByText("Yükleniyor...")).toBeInTheDocument();
    });

    it("does not render when not visible", () => {
      render(<LoadingOverlay isVisible={false} />);
      expect(screen.queryByText("Yükleniyor...")).not.toBeInTheDocument();
    });

    it("renders with custom message", () => {
      render(<LoadingOverlay isVisible={true} message="Custom loading..." />);
      expect(screen.getByText("Custom loading...")).toBeInTheDocument();
    });
  });
});

describe("Empty State Components", () => {
  describe("NoReviewsEmpty", () => {
    it("renders no reviews message", () => {
      render(<NoReviewsEmpty />);
      expect(screen.getByText("Henüz Değerlendirme Yok")).toBeInTheDocument();
    });
  });

  describe("FilteredResultsEmpty", () => {
    it("renders with clear filters button", () => {
      const onClearFilters = vi.fn();
      render(<FilteredResultsEmpty onClearFilters={onClearFilters} />);

      expect(
        screen.getByText("Filtreye Uygun Sonuç Bulunamadı")
      ).toBeInTheDocument();
      fireEvent.click(screen.getByText("Filtreleri Temizle"));
      expect(onClearFilters).toHaveBeenCalled();
    });
  });

  describe("SearchResultsEmpty", () => {
    it("renders with search term", () => {
      render(<SearchResultsEmpty searchTerm="test" />);
      expect(screen.getByText("Arama Sonucu Bulunamadı")).toBeInTheDocument();
      expect(screen.getByText(/test/)).toBeInTheDocument();
    });

    it("renders clear search button", () => {
      const onClearSearch = vi.fn();
      render(<SearchResultsEmpty onClearSearch={onClearSearch} />);

      fireEvent.click(screen.getByText("Aramayı Temizle"));
      expect(onClearSearch).toHaveBeenCalled();
    });
  });

  describe("NoDataEmpty", () => {
    it("renders no data message", () => {
      render(<NoDataEmpty />);
      expect(screen.getByText("Veri Bulunmuyor")).toBeInTheDocument();
    });
  });

  describe("ChartEmpty", () => {
    it("renders with default props", () => {
      render(<ChartEmpty />);
      expect(screen.getByText("Veri Yok")).toBeInTheDocument();
    });

    it("renders with custom title and description", () => {
      render(
        <ChartEmpty title="Custom Title" description="Custom Description" />
      );
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Custom Description")).toBeInTheDocument();
    });
  });

  describe("RecentActivityEmpty", () => {
    it("renders recent activity empty message", () => {
      render(<RecentActivityEmpty />);
      expect(screen.getByText("Son Aktivite Yok")).toBeInTheDocument();
    });
  });

  describe("StatisticsEmpty", () => {
    it("renders statistics empty message", () => {
      render(<StatisticsEmpty />);
      expect(screen.getByText("İstatistik Yok")).toBeInTheDocument();
    });

    it("renders with retry button", () => {
      const onAction = vi.fn();
      render(<StatisticsEmpty onAction={onAction} />);

      fireEvent.click(screen.getByText("Yenile"));
      expect(onAction).toHaveBeenCalled();
    });
  });

  describe("WelcomeState", () => {
    it("renders welcome message", () => {
      render(<WelcomeState />);
      expect(
        screen.getByText("Değerlendirme Yönetimine Hoş Geldiniz")
      ).toBeInTheDocument();
    });

    it("renders get started button", () => {
      const onGetStarted = vi.fn();
      render(<WelcomeState onGetStarted={onGetStarted} />);

      fireEvent.click(screen.getByText("Başlayın"));
      expect(onGetStarted).toHaveBeenCalled();
    });
  });

  describe("MaintenanceState", () => {
    it("renders maintenance message", () => {
      render(<MaintenanceState />);
      expect(screen.getByText("Bakım Modu")).toBeInTheDocument();
    });

    it("renders custom message", () => {
      render(<MaintenanceState message="Custom maintenance message" />);
      expect(
        screen.getByText("Custom maintenance message")
      ).toBeInTheDocument();
    });
  });
});

describe("Skeleton Components", () => {
  describe("RatingsSummaryCardSkeleton", () => {
    it("renders skeleton structure", () => {
      render(<RatingsSummaryCardSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("RatingDistributionCardSkeleton", () => {
    it("renders skeleton structure", () => {
      render(<RatingDistributionCardSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("RatingTrendsChartSkeleton", () => {
    it("renders skeleton structure", () => {
      render(<RatingTrendsChartSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("CategoryBreakdownChartSkeleton", () => {
    it("renders skeleton structure", () => {
      render(<CategoryBreakdownChartSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("RecentActivityCardSkeleton", () => {
    it("renders skeleton structure", () => {
      render(<RecentActivityCardSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("ReviewCardSkeleton", () => {
    it("renders skeleton structure", () => {
      render(<ReviewCardSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("RatingsHeaderSkeleton", () => {
    it("renders skeleton structure", () => {
      render(<RatingsHeaderSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("ReviewsFilterBarSkeleton", () => {
    it("renders skeleton structure", () => {
      render(<ReviewsFilterBarSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("RatingsPageSkeleton", () => {
    it("renders full page skeleton structure", () => {
      render(<RatingsPageSkeleton />);
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });
});
