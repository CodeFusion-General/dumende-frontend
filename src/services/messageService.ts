import axios from "@/lib/axios";

export const sendMessage = async (data: any) => {
  try {
    const response = await axios.post("/message", data);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
export const sendContactForm = async (data: any) => {
  try {
    const response = await axios.post("/contact", data);
    return response.data;
  } catch (error) {
    console.error("Error sending contact form:", error);
    throw error;
  }
}