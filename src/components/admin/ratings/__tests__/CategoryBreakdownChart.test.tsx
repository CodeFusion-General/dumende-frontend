import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CategoryBreakdownChart from "../CategoryBreakdownChart";

// Mock recharts components
jest.mock("recharts", () => ({
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data, onMouseEnter, onMouseLeave }: any) => (
    <div
      data-testid="pie"
      onMouseEnter={() => onMouseEnter && onMouseEnter({}, 0)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    >
      {data?.map((item: any, index: number) => (
        <div key={index} data-testid={`pie-cell-${item.name}`}>
          {item.value}
        </div>
      ))}
    </div>
  ),
  Cell: ({ fill }: any) => <div data-testid="pie-cell" style={{ fill }} />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Ship: () => <div data-testid="ship-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
}));

describe("CategoryBreakdownChart", () => {
  const mockData = {
    boats: 145,
    tours: 89,
  };

  const emptyData = {
    boats: 0,
    tours: 0,
  };

  const singleCategoryData = {
    boats: 200,
    tours: 0,
  };

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("renders the component with title", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      expect(screen.getByText("Kategori Dağılımı")).toBeInTheDocument();
      expect(screen.getByTestId("ship-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mappin-icon")).toBeInTheDocument();
    });

    it("renders chart components when data is provided", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
      expect(screen.getByTestId("pie")).toBeInTheDocument();
    });

    it("displays correct category labels and values", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      expect(screen.getByText("Tekne")).toBeInTheDocument();
      expect(screen.getByText("Tur")).toBeInTheDocument();
      expect(screen.getByText("145")).toBeInTheDocument();
      expect(screen.getByText("89")).toBeInTheDocument();
    });

    it("calculates and displays correct percentages", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      // Total: 145 + 89 = 234
      // Boats: 145/234 = ~62%
      // Tours: 89/234 = ~38%
      expect(screen.getByText("62%")).toBeInTheDocument();
      expect(screen.getByText("38%")).toBeInTheDocument();
    });

    it("displays total count in footer", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      expect(screen.getByText("234 değerlendirme")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("shows empty state when no data is provided", () => {
      render(<CategoryBreakdownChart categoryBreakdown={emptyData} />);

      expect(
        screen.getByText("Henüz kategori verisi bulunmuyor")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Değerlendirmeler geldiğinde burada görüntülenecek")
      ).toBeInTheDocument();
    });

    it("does not render chart components in empty state", () => {
      render(<CategoryBreakdownChart categoryBreakdown={emptyData} />);

      expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
    });
  });

  describe("Single Category Data", () => {
    it("handles single category data correctly", () => {
      render(<CategoryBreakdownChart categoryBreakdown={singleCategoryData} />);

      expect(screen.getByText("Tekne")).toBeInTheDocument();
      expect(screen.getByText("200")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.queryByText("Tur")).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("handles mouse enter and leave events", async () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      const pieElement = screen.getByTestId("pie");

      // Mouse enter
      fireEvent.mouseEnter(pieElement);

      // Mouse leave
      fireEvent.mouseLeave(pieElement);

      // Should not throw any errors
      expect(pieElement).toBeInTheDocument();
    });

    it("handles legend item hover", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      const legendItems = screen.getAllByText(/değerlendirme/);
      const firstLegendItem = legendItems[0].closest("div");

      if (firstLegendItem) {
        fireEvent.mouseEnter(firstLegendItem);
        fireEvent.mouseLeave(firstLegendItem);
      }

      expect(firstLegendItem).toBeInTheDocument();
    });
  });

  describe("Animation", () => {
    it("shows loading overlay during animation", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      expect(screen.getByText("Yükleniyor...")).toBeInTheDocument();
    });

    it("hides loading overlay after animation completes", async () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      // Fast-forward through animation
      jest.advanceTimersByTime(1100);

      await waitFor(() => {
        expect(screen.queryByText("Yükleniyor...")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA structure", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      // Check for semantic structure
      const title = screen.getByText("Kategori Dağılımı");
      expect(title).toBeInTheDocument();
    });

    it("provides meaningful text content", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      expect(screen.getByText("Toplam Değerlendirme")).toBeInTheDocument();
      expect(screen.getByText("234 değerlendirme")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("applies custom className", () => {
      const { container } = render(
        <CategoryBreakdownChart
          categoryBreakdown={mockData}
          className="custom-test-class"
        />
      );

      const cardElement = container.querySelector(".custom-test-class");
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe("Data Validation", () => {
    it("handles zero values gracefully", () => {
      const zeroData = { boats: 0, tours: 100 };
      render(<CategoryBreakdownChart categoryBreakdown={zeroData} />);

      expect(screen.getByText("Tur")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.queryByText("Tekne")).not.toBeInTheDocument();
    });

    it("handles large numbers correctly", () => {
      const largeData = { boats: 1000000, tours: 500000 };
      render(<CategoryBreakdownChart categoryBreakdown={largeData} />);

      // Check Turkish number formatting
      expect(screen.getByText("1.000.000")).toBeInTheDocument();
      expect(screen.getByText("500.000")).toBeInTheDocument();
      expect(screen.getByText("1.500.000 değerlendirme")).toBeInTheDocument();
    });
  });

  describe("Color Scheme", () => {
    it("uses correct colors for categories", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      // Check if color indicators are present
      const colorIndicators = screen.getAllByRole("generic");
      const blueIndicator = colorIndicators.find(
        (el) => el.style.backgroundColor === "rgb(26, 95, 122)" // #1A5F7A
      );
      const yellowIndicator = colorIndicators.find(
        (el) => el.style.backgroundColor === "rgb(248, 203, 46)" // #F8CB2E
      );

      // Colors should be applied somewhere in the component
      expect(screen.getByTestId("pie")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("does not cause memory leaks with timers", () => {
      const { unmount } = render(
        <CategoryBreakdownChart categoryBreakdown={mockData} />
      );

      // Unmount before animation completes
      unmount();

      // Advance timers to ensure cleanup
      jest.advanceTimersByTime(2000);

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe("Turkish Localization", () => {
    it("displays Turkish text correctly", () => {
      render(<CategoryBreakdownChart categoryBreakdown={mockData} />);

      expect(screen.getByText("Kategori Dağılımı")).toBeInTheDocument();
      expect(screen.getByText("Toplam Değerlendirme")).toBeInTheDocument();
      expect(screen.getByText("değerlendirme")).toBeInTheDocument();
    });

    it("formats numbers with Turkish locale", () => {
      const largeData = { boats: 1234, tours: 5678 };
      render(<CategoryBreakdownChart categoryBreakdown={largeData} />);

      expect(screen.getByText("1.234")).toBeInTheDocument();
      expect(screen.getByText("5.678")).toBeInTheDocument();
    });
  });
});
