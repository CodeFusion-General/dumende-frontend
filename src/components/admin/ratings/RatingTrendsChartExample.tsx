import React, { useState } from "react";
import RatingTrendsChart from "./RatingTrendsChart";
import { RatingTrend } from "@/types/ratings.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data sets for the example
const generateExampleData = (scenario: string): RatingTrend[] => {
  const data: RatingTrend[] = [];
  const today = new Date();
  
  // Base patterns for different scenarios
  const patterns = {
    improving: (i: number) => 3.0 + (i / 90) * 1.5 + Math.random() * 0.3,
    declining: (i: number) => 4.5 - (i / 90) * 1.5 + Math.random() * 0.3,
    stable: (i: number) => 4.0 + Math.random() * 0.4 - 0.2,
    seasonal: (i: number) => 3.5 + Math.sin(i / 15) * 0.8 + Math.random() * 0.2,
  };
  
  const patternFn = patterns[scenario as keyof typeof patterns] || patterns.stable;
  
  // Generate data for the last 90 days
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Apply the selected pattern with some randomness
    const rating = Math.max(1.0, Math.min(5.0, patternFn(90 - i)));
    
    // Count between 5 and 25 with some variation based on weekends (more reviews)
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCount = isWeekend ? 15 : 10;
    const count = Math.max(1, Math.round(baseCount + Math.random() * 10));
    
    data.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      rating,
      count
    });
  }
  
  return data;
};

const RatingTrendsChartExample: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string>("improving");
  
  // Generate data for the selected scenario
  const exampleData = React.useMemo(
    () => generateExampleData(activeScenario),
    [activeScenario]
  );
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Rating Trends Chart Examples
      </h1>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="mb-4 text-gray-600">
            Select different scenarios to see how the chart displays various rating trends.
            Each scenario represents a common pattern seen in customer ratings.
          </p>
          
          <Tabs value={activeScenario} onValueChange={setActiveScenario}>
            <TabsList className="mb-4">
              <TabsTrigger value="improving">Improving</TabsTrigger>
              <TabsTrigger value="declining">Declining</TabsTrigger>
              <TabsTrigger value="stable">Stable</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="improving" className="mt-0">
              <p className="text-sm text-gray-500 mb-2">
                Shows a business that's steadily improving its ratings over time.
              </p>
            </TabsContent>
            <TabsContent value="declining" className="mt-0">
              <p className="text-sm text-gray-500 mb-2">
                Demonstrates a concerning downward trend in customer satisfaction.
              </p>
            </TabsContent>
            <TabsContent value="stable" className="mt-0">
              <p className="text-sm text-gray-500 mb-2">
                Represents consistent performance with minor fluctuations.
              </p>
            </TabsContent>
            <TabsContent value="seasonal" className="mt-0">
              <p className="text-sm text-gray-500 mb-2">
                Shows cyclical patterns that might indicate seasonal factors.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <RatingTrendsChart trends={exampleData} />
      
      <div className="mt-6 text-center">
        <Button 
          variant="outline" 
          onClick={() => setActiveScenario(
            ["improving", "declining", "stable", "seasonal"][
              Math.floor(Math.random() * 4)
            ]
          )}
        >
          Random Scenario
        </Button>
      </div>
    </div>
  );
};

export default RatingTrendsChartExample;