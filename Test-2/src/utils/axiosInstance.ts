import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8090",
  withCredentials: true,
});

let onLogout: (() => void) | null = null;
export function setOnLogout(fn: () => void) {
  onLogout = fn;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await axiosInstance.post("/auth/refresh");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if (onLogout) onLogout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 