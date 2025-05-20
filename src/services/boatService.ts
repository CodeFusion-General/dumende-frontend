import axios from "@/lib/axios";

export const getBoats = async () => {
    try {
        const response = await axios.get("/boats");
        return response.data;
    } catch (error) {
        console.error("Error fetching boats:", error);
        throw error;
    }
    }

export const getBoatById = async (id: string) => {
    try {
        const response = await axios.get(`/boats/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching boat:", error);
        throw error;
    }
}