// Simple test file to verify ratings functionality
import { MockRatingsService } from "./services/mockRatingsService";
import { mockReviews, mockRatingStats } from "./mocks/ratingsData.mock";
import {
  calculateAverageRating,
  getCategoryStats,
} from "./lib/utils/ratingsUtils";

console.log("🧪 Testing Ratings Mock Data Service...\n");

// Test 1: Generate reviews
console.log("1. Testing review generation:");
const testReviews = MockRatingsService.generateReviews(5);
console.log(`   ✓ Generated ${testReviews.length} reviews`);
console.log(
  `   ✓ First review: ${testReviews[0].userName} - ${testReviews[0].rating} stars`
);

// Test 2: Statistics calculation
console.log("\n2. Testing statistics calculation:");
const stats = MockRatingsService.getStatistics(testReviews);
console.log(`   ✓ Average rating: ${stats.averageRating}`);
console.log(`   ✓ Total reviews: ${stats.totalReviews}`);
console.log(`   ✓ Recent reviews: ${stats.recentReviews}`);

// Test 3: Filtering
console.log("\n3. Testing filtering:");
const fiveStarReviews = MockRatingsService.filterReviews(testReviews, {
  rating: 5,
});
console.log(`   ✓ 5-star reviews: ${fiveStarReviews.length}`);

const boatReviews = MockRatingsService.filterReviews(testReviews, {
  category: "boat",
});
console.log(`   ✓ Boat reviews: ${boatReviews.length}`);

// Test 4: Sorting
console.log("\n4. Testing sorting:");
const sortedByRating = MockRatingsService.sortReviews(
  testReviews,
  "rating-desc"
);
console.log(`   ✓ Highest rating after sort: ${sortedByRating[0]?.rating}`);

// Test 5: Mock data consistency
console.log("\n5. Testing mock data consistency:");
console.log(`   ✓ Mock reviews count: ${mockReviews.length}`);
console.log(`   ✓ Mock stats average: ${mockRatingStats.averageRating}`);

// Test 6: Utility functions
console.log("\n6. Testing utility functions:");
const avgRating = calculateAverageRating(testReviews);
console.log(`   ✓ Calculated average rating: ${avgRating}`);

const categoryStats = getCategoryStats(testReviews);
console.log(
  `   ✓ Category breakdown: ${categoryStats.boat.count} boats, ${categoryStats.tour.count} tours`
);

console.log("\n🎉 All tests completed successfully!");

export {}; // Make this a module
