import axios from "@/lib/axios";

export const getTours = async () => {
  try {
    const response = await axios.get("/tours");
    return response.data;
  } catch (error) {
    console.error("Error fetching tours:", error);
    throw error;
  }
}
export const getTourById = async (id: string) => {
    try {
        const response = await axios.get(`/tours/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tour:", error);
        throw error;
    }
}
