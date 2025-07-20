import React from 'react';
import { RatingTrendsChartDemo, RatingTrendsChartExample } from './components/admin/ratings';

// This is a simple test component to verify that the imports work correctly
const TestImports: React.FC = () => {
  return (
    <div>
      <h1>Test Imports</h1>
      <p>If you can see this, the imports are working correctly.</p>
      
      <h2>Demo Component</h2>
      <RatingTrendsChartDemo />
      
      <h2>Example Component</h2>
      <RatingTrendsChartExample />
    </div>
  );
};

export default TestImports;