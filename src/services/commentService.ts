import axios from "@/lib/axios";

export const getTestimonials = async () => {
  try {
    const response = await axios.get("/testimonials");
    return response.data;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    throw error;
  }
}

export const getCommentByBoatId = async (boatId: string) => {
  try {
    const response = await axios.get(`/comments/boat/${boatId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments by boat ID:", error);
    throw error;
  }
}
export const getCommentByTourId = async (tourId: string) => {
  try {
    const response = await axios.get(`/comments/tour/${tourId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments by tour ID:", error);
    throw error;
  }
}