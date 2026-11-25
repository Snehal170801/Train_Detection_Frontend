// client/src/api/dashboardApi.js
import api from "./axiosInstance.js";

export const getDashboardStatsApi = () => api.get("/dashboard/stats");
