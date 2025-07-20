import React from "react";
import RatingTrendsChart from "./RatingTrendsChart";
import { RatingTrend } from "@/types/ratings.types";

// Sample data for the demo
const generateDemoData = (): RatingTrend[] => {
  const data: RatingTrend[] = [];
  const today = new Date();
  
  // Generate data for the last 90 days
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Generate some random but realistic data
    // Ratings between 3.0 and 5.0 with some variation
    const baseRating = 4.0;
    const variation = Math.sin(i / 10) * 0.5; // Creates a wave pattern
    const rating = Math.max(3.0, Math.min(5.0, baseRating + variation));
    
    // Count between 1 and 20 with some variation
    const count = Math.max(1, Math.round(10 + Math.sin(i / 5) * 8));
    
    data.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      rating,
      count
    });
  }
  
  return data;
};

const RatingTrendsChartDemo: React.FC = () => {
  const demoData = React.useMemo(() => generateDemoData(), []);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Rating Trends Chart Demo
      </h1>
      <p className="mb-4 text-gray-600">
        This is a demo of the RatingTrendsChart component with sample data.
        The chart shows rating trends over time with interactive features.
      </p>
      <RatingTrendsChart trends={demoData} />
    </div>
  );
};

export default RatingTrendsChartDemo;