import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("safehaven_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("safehaven_token");
      localStorage.removeItem("safehaven_user");
    }
    return Promise.reject(error);
  }
);

export const normalizeUser = (apiUser) => {
  if (!apiUser) return null;
  return {
    id: apiUser.user_id,
    user_id: apiUser.user_id,
    name: apiUser.full_name || apiUser.name || "",
    full_name: apiUser.full_name || apiUser.name || "",
    email: apiUser.email || "",
    role: apiUser.role || "victim",
    phone: apiUser.phone || "",
    created_at: apiUser.created_at,
    updated_at: apiUser.updated_at
  };
};

export const normalizeReport = (apiReport) => ({
  id: apiReport.issue_id,
  issue_id: apiReport.issue_id,
  title: apiReport.incident_type || "Incident Report",
  incidentType: apiReport.incident_type || "General",
  description: apiReport.issue_details || "",
  location: apiReport.location || "",
  serviceNeeded: apiReport.service_needed || "",
  status: apiReport.status || "under_review",
  urgency: apiReport.status === "resolved" || apiReport.status === "solved" ? "low" : "high",
  reportedAt: apiReport.reported_at,
  updatedAt: apiReport.updated_at
});

export const normalizeResource = (apiResource) => ({
  id: apiResource.resource_id,
  title: apiResource.name,
  name: apiResource.name,
  category: apiResource.category,
  description: apiResource.description,
  phone: apiResource.phone,
  location: apiResource.location
});

export const normalizeDashboard = (payload) => payload?.dashboard || payload?.stats || {};

export const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const apiMessage = error?.response?.data?.message;

  if (apiMessage) return apiMessage;
  if (status === 403) return "You do not have permission for this action.";
  if (status === 404) return "Requested record was not found.";
  if (error.code === "ECONNABORTED") return "Request timed out. Please check your connection and try again.";
  return "Something went wrong. Please try again.";
};
