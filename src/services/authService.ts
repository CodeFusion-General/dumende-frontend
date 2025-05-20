import axios from "@/lib/axios";

export const register = async (data: any) => {
    try {
        const response = await axios.post("/auth/register", data);
        return response.data;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}
export const login = async (data: any) => {
    try {
        const response = await axios.post("/auth/login", data);
        return response.data;
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
}
export const logout = async () => {
    try {
        const response = await axios.post("/auth/logout");
        return response.data;
    } catch (error) {
        console.error("Error logging out user:", error);
        throw error;
    }
}
export const getUser = async () => {
    try {
        const response = await axios.get("/auth/user");
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}
export const updateUser = async (data: any) => {
    try {
        const response = await axios.put("/auth/user", data);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}
export const deleteUser = async () => {
    try {
        const response = await axios.delete("/auth/user");
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}