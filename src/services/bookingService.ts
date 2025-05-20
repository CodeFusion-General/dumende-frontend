import axios from "@/lib/axios";

export const createBooking = async (data: any) => {
  try {
    const response = await axios.post("/booking", data);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}