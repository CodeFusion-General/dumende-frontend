import axios from "@/lib/axios";

export const postContactForm = async (data: any) => {
  try {
    const response = await axios.post("/contact", data);
    return response.data;
  } catch (error) {
    console.error("Error posting contact form:", error);
    throw error;
  }
}

export const postAskSpecialOffer = async (data: any) => {
  try {
    const response = await axios.post("/ask-special-offer", data);
    return response.data;
  } catch (error) {
    console.error("Error posting ask special offer:", error);
    throw error;
  }
}