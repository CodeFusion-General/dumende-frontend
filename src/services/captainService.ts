import axios from "@/lib/axios";

export const postCompanyInfo = async (data: any) => {
    try {
        const response = await axios.post("/captain/company-info", data);
        return response.data;
    } catch (error) {
        console.error("Error posting company info:", error);
        throw error;
    }
}

export const postCaptainInfo = async (data: any) => {
    try {
        const response = await axios.post("/captain/captain-info", data);
        return response.data;
    } catch (error) {
        console.error("Error posting captain info:", error);
        throw error;
    }
}

export const getCompanyInfo = async () => {
    try {
        const response = await axios.get("/captain/company-info");
        return response.data;
    } catch (error) {
        console.error("Error fetching company info:", error);
        throw error;
    }
}

export const getCaptainInfo = async () => {
    try {
        const response = await axios.get("/captain/captain-info");
        return response.data;
    } catch (error) {
        console.error("Error fetching captain info:", error);
        throw error;
    }
}