import { useState } from 'react';

// Define the Review interface
export interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  tourName?: string;
  boatName?: string;
}

export const useRatingsData = (initialReviews: Review[]) => {
  const [sorting, setSorting] = useState<string>('newest');
  const [filters, setFilters] = useState({
    fiveStars: false,
    fourStars: false,
    threeStars: false,
    twoStars: false,
    oneStars: false,
  });
  
  // Calculate summary data
  const totalReviews = initialReviews.length;
  const averageRating = initialReviews.length > 0 
    ? initialReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;
  const lastMonthReviews = initialReviews.filter(
    (review) => new Date(review.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  // Calculate rating distribution
  const ratingCounts = {
    5: initialReviews.filter((r) => r.rating === 5).length,
    4: initialReviews.filter((r) => r.rating === 4).length,
    3: initialReviews.filter((r) => r.rating === 3).length,
    2: initialReviews.filter((r) => r.rating === 2).length,
    1: initialReviews.filter((r) => r.rating === 1).length,
  };

  const ratingDistribution = [
    { name: '5 ⭐', count: ratingCounts[5], color: '#2ecc71' },
    { name: '4 ⭐', count: ratingCounts[4], color: '#f39c12' },
    { name: '3 ⭐', count: ratingCounts[3], color: '#f39c12' },
    { name: '2 ⭐', count: ratingCounts[2], color: '#e74c3c' },
    { name: '1 ⭐', count: ratingCounts[1], color: '#e74c3c' },
  ];

  // Apply filters
  const filteredReviews = initialReviews.filter((review) => {
    // If no stars filter is selected, show all
    const anyStarFilterActive = Object.values(filters).some(value => value);
    if (!anyStarFilterActive) return true;
    
    // Otherwise, filter by stars
    if (review.rating === 5 && filters.fiveStars) return true;
    if (review.rating === 4 && filters.fourStars) return true;
    if (review.rating === 3 && filters.threeStars) return true;
    if (review.rating === 2 && filters.twoStars) return true;
    if (review.rating === 1 && filters.oneStars) return true;
    
    return false;
  });

  // Apply sorting
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sorting) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const handleFilterChange = (name: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const resetFilters = () => {
    setFilters({
      fiveStars: false,
      fourStars: false,
      threeStars: false,
      twoStars: false,
      oneStars: false,
    });
    setSorting('newest');
  };

  return {
    sorting,
    filters,
    totalReviews,
    averageRating,
    lastMonthReviews,
    ratingDistribution,
    sortedReviews,
    setSorting,
    handleFilterChange,
    resetFilters
  };
};
