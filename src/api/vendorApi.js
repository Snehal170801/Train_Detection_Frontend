// client/src/api/vendorApi.js
import axiosInstance from "./axiosInstance";

function parseError(err) {
  if (!err.response) {
    return err.code === "ECONNABORTED" || err.message?.includes("timeout")
      ? { code: "TIMEOUT", message: "Request timed out. Please try again." }
      : { code: "NETWORK", message: "Cannot reach the server." };
  }
  const msg = err.response.data?.message || null;
  const s = err.response.status;
  if (s === 400)
    return { code: "BAD_REQUEST", message: msg || "Invalid request." };
  if (s === 401)
    return { code: "UNAUTHORIZED", message: msg || "Unauthorized." };
  if (s === 403) return { code: "FORBIDDEN", message: msg || "Access denied." };
  if (s === 404)
    return { code: "NOT_FOUND", message: msg || "Vendor not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

export const getVendorsApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/vendors", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getActiveVendorsApi = async () => {
  try {
    const res = await axiosInstance.get("/vendors/active");
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getVendorByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/vendors/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const createVendorApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/vendors", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateVendorApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/vendors/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateVendorStatusApi = async (id, isActive) => {
  try {
    const res = await axiosInstance.put(`/vendors/${id}/status`, { isActive });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteVendorApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/vendors/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
