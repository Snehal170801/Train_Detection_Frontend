// client/src/api/ticketApi.js
import axiosInstance from "./axiosInstance";

function parseError(err) {
  if (!err.response) {
    return err.code === "ECONNABORTED" || err.message?.includes("timeout")
      ? { code: "TIMEOUT", message: "Request timed out. Please try again." }
      : { code: "NETWORK", message: "Cannot reach the server." };
  }
  const msg = err.response.data?.message || null;
  const s = err.response.status;
  if (s === 400) return { code: "BAD_REQUEST", message: msg || "Invalid request." };
  if (s === 401) return { code: "UNAUTHORIZED", message: msg || "Unauthorized." };
  if (s === 403) return { code: "FORBIDDEN", message: msg || "Access denied." };
  if (s === 404) return { code: "NOT_FOUND", message: msg || "Ticket not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

export const getTicketsApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/tickets", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getTicketByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/tickets/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const raiseTicketApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/tickets", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateTicketApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const withdrawTicketApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/tickets/${id}/withdraw`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const acknowledgeTicketApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/acknowledge`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const resolveTicketApi = async (id, resolutionNotes) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/resolve`, { resolutionNotes });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const rejectTicketApi = async (id, resolutionNotes) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/reject`, { resolutionNotes });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const reopenTicketApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/reopen`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const cancelReopenApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/cancel-reopen`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Custody handover flow ────────────────────────────────────────────────

export const submitToAdminApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/submit-to-admin`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const acceptSubmissionApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/accept-submission`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const rejectSubmissionApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/reject-submission`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const confirmPickupApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/tickets/${id}/confirm-pickup`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getMyAssetsApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/assets/my", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
