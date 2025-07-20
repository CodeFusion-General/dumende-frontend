import {
  MockReviewData,
  MockRatingStats,
  FilterOptions,
  SortOption,
  RatingDistribution,
  RatingTrend,
} from "../types/ratings.types";

export class MockRatingsService {
  private static readonly TURKISH_NAMES = [
    "Ahmet Yılmaz",
    "Mehmet Demir",
    "Ayşe Kaya",
    "Fatma Çelik",
    "Mustafa Şahin",
    "Emine Yıldız",
    "Ali Özkan",
    "Hatice Aydın",
    "Hüseyin Özdemir",
    "Zeynep Arslan",
    "İbrahim Doğan",
    "Elif Kılıç",
    "Ömer Aslan",
    "Seda Polat",
    "Burak Kara",
    "Merve Akın",
    "Emre Güneş",
    "Cansu Türk",
    "Kemal Bulut",
    "Deniz Öztürk",
  ];

  private static readonly TURKISH_LOCATIONS = [
    "İstanbul",
    "Antalya",
    "Bodrum",
    "Marmaris",
    "Kaş",
    "Fethiye",
    "Çeşme",
    "Ayvalık",
    "Datça",
    "Göcek",
    "Kalkan",
    "Kuşadası",
  ];

  private static readonly BOAT_NAMES = [
    "Deniz Yıldızı",
    "Mavi Rüya",
    "Ege Prensesi",
    "Akdeniz Güneşi",
    "Beyaz Yelken",
    "Altın Balık",
    "Turkuaz",
    "Delfin",
    "Poseidon",
    "Neptün",
    "Sirena",
    "Odyssey",
  ];

  private static readonly TOUR_NAMES = [
    "Gün Batımı Turu",
    "Koy Turu",
    "Balık Tutma Turu",
    "Dalış Turu",
    "Romantik Akşam Yemeği",
    "Aile Eğlence Turu",
    "Özel Tekne Turu",
    "Snorkeling Macerası",
    "Sahil Keşfi",
    "Mavi Yolculuk",
  ];

  private static readonly POSITIVE_COMMENTS = [
    "Harika bir deneyimdi! Tekne çok temiz ve mürettebat çok ilgiliydi.",
    "Mükemmel bir gün geçirdik. Kesinlikle tekrar tercih edeceğim.",
    "Çok profesyonel hizmet. Her şey planlandığı gibiydi.",
    "Ailecek çok eğlendik. Çocuklar bayıldı!",
    "Manzara muhteşemdi, yemekler lezzetliydi.",
    "Kaptan çok deneyimli ve güler yüzlüydü.",
    "Fiyat performans açısından çok başarılı.",
    "Temizlik ve hijyen konusunda çok titizler.",
  ];

  private static readonly NEUTRAL_COMMENTS = [
    "Genel olarak iyi bir deneyimdi ama bazı eksiklikler vardı.",
    "Fena değildi ama beklentilerimin biraz altındaydı.",
    "Ortalama bir hizmet. İdare eder.",
    "Bazı konularda gelişim gösterebilirler.",
    "Fiyata göre makul bir hizmet.",
    "Tekne eski ama kullanılabilir durumda.",
  ];

  private static readonly NEGATIVE_COMMENTS = [
    "Maalesef beklediğimizi bulamadık. Hizmet kalitesi düşüktü.",
    "Tekne temiz değildi ve mürettebat ilgisizdi.",
    "Programda belirtilen aktiviteler yapılmadı.",
    "Yemekler soğuk ve lezzetsizdi.",
    "Çok pahalı, karşılığını alamadık.",
    "Geç kaldılar ve özür bile dilemediler.",
  ];

  private static generateUserInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static generateRandomDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString().split("T")[0];
  }

  private static generateComment(rating: number): string {
    if (rating >= 4) {
      return this.getRandomElement(this.POSITIVE_COMMENTS);
    } else if (rating >= 3) {
      return this.getRandomElement(this.NEUTRAL_COMMENTS);
    } else {
      return this.getRandomElement(this.NEGATIVE_COMMENTS);
    }
  }

  static generateReviews(count: number = 50): MockReviewData[] {
    const reviews: MockReviewData[] = [];

    for (let i = 0; i < count; i++) {
      const userName = this.getRandomElement(this.TURKISH_NAMES);
      const category = Math.random() > 0.6 ? "boat" : "tour";
      const entityName =
        category === "boat"
          ? this.getRandomElement(this.BOAT_NAMES)
          : this.getRandomElement(this.TOUR_NAMES);

      // Generate rating with realistic distribution (more 4-5 stars)
      const ratingRandom = Math.random();
      let rating: number;
      if (ratingRandom < 0.4) rating = 5;
      else if (ratingRandom < 0.7) rating = 4;
      else if (ratingRandom < 0.85) rating = 3;
      else if (ratingRandom < 0.95) rating = 2;
      else rating = 1;

      reviews.push({
        id: `review-${i + 1}`,
        userName,
        userInitials: this.generateUserInitials(userName),
        rating,
        comment: this.generateComment(rating),
        date: this.generateRandomDate(90),
        category,
        entityName,
        entityId: `${category}-${Math.floor(Math.random() * 20) + 1}`,
        isVerified: Math.random() > 0.3,
        helpfulCount: Math.floor(Math.random() * 15),
        location: this.getRandomElement(this.TURKISH_LOCATIONS),
      });
    }

    return reviews.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  static getStatistics(reviews?: MockReviewData[]): MockRatingStats {
    const reviewData = reviews || this.generateReviews();

    const totalReviews = reviewData.length;
    const averageRating =
      reviewData.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    // Recent reviews (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReviews = reviewData.filter(
      (review) => new Date(review.date) >= sevenDaysAgo
    ).length;

    // Rating distribution
    const distribution = [1, 2, 3, 4, 5].map((stars) => ({
      stars,
      count: reviewData.filter((review) => review.rating === stars).length,
    }));

    // Generate trends for last 30 days
    const trends: RatingTrend[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayReviews = reviewData.filter((review) => review.date === dateStr);
      const dayRating =
        dayReviews.length > 0
          ? dayReviews.reduce((sum, review) => sum + review.rating, 0) /
            dayReviews.length
          : 0;

      trends.push({
        date: dateStr,
        rating: dayRating,
        count: dayReviews.length,
      });
    }

    // Category breakdown
    const categoryBreakdown = {
      boats: reviewData.filter((review) => review.category === "boat").length,
      tours: reviewData.filter((review) => review.category === "tour").length,
    };

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      recentReviews,
      distribution,
      trends,
      categoryBreakdown,
    };
  }

  static filterReviews(
    reviews: MockReviewData[],
    filters: FilterOptions
  ): MockReviewData[] {
    return reviews.filter((review) => {
      // Rating filter
      if (filters.rating && review.rating !== filters.rating) {
        return false;
      }

      // Category filter
      if (
        filters.category &&
        filters.category !== "all" &&
        review.category !== filters.category
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const reviewDate = new Date(review.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (reviewDate < startDate || reviewDate > endDate) {
          return false;
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          review.userName.toLowerCase().includes(searchLower) ||
          review.comment.toLowerCase().includes(searchLower) ||
          review.entityName.toLowerCase().includes(searchLower) ||
          review.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      // Verified filter
      if (
        filters.isVerified !== undefined &&
        review.isVerified !== filters.isVerified
      ) {
        return false;
      }

      // Location filter
      if (filters.location && review.location !== filters.location) {
        return false;
      }

      return true;
    });
  }

  static sortReviews(
    reviews: MockReviewData[],
    sortBy: SortOption
  ): MockReviewData[] {
    const sortedReviews = [...reviews];

    switch (sortBy) {
      case "date-desc":
        return sortedReviews.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case "date-asc":
        return sortedReviews.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      case "rating-desc":
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case "rating-asc":
        return sortedReviews.sort((a, b) => a.rating - b.rating);
      case "helpful-desc":
        return sortedReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
      case "helpful-asc":
        return sortedReviews.sort((a, b) => a.helpfulCount - b.helpfulCount);
      default:
        return sortedReviews;
    }
  }

  static getRatingDistribution(
    reviews: MockReviewData[]
  ): RatingDistribution[] {
    const totalReviews = reviews.length;

    return [1, 2, 3, 4, 5].map((stars) => {
      const count = reviews.filter((review) => review.rating === stars).length;
      const percentage =
        totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

      return {
        stars,
        count,
        percentage,
      };
    });
  }

  static getRecentActivity(
    reviews: MockReviewData[],
    days: number = 7
  ): MockReviewData[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return reviews
      .filter((review) => new Date(review.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }

  static getLocationStats(
    reviews: MockReviewData[]
  ): Array<{ location: string; count: number; averageRating: number }> {
    const locationMap = new Map<
      string,
      { count: number; totalRating: number }
    >();

    reviews.forEach((review) => {
      const existing = locationMap.get(review.location) || {
        count: 0,
        totalRating: 0,
      };
      locationMap.set(review.location, {
        count: existing.count + 1,
        totalRating: existing.totalRating + review.rating,
      });
    });

    return Array.from(locationMap.entries())
      .map(([location, stats]) => ({
        location,
        count: stats.count,
        averageRating: Math.round((stats.totalRating / stats.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
