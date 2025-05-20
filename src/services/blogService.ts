import axios from "@/lib/axios";

export const getBLogPosts = async () => {
  try {
    const response = await axios.get("/blog/posts");
    return response.data;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw error;
  }
}

export const getBlogPostById = async (id: string) => {
  try {
    const response = await axios.get(`/blog/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw error;
  }
}