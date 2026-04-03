export const API_BASE_URL = "http://localhost:8080/api";

export const apiCall = async (endpoint, options = {}) => {
  const accessToken = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
};
