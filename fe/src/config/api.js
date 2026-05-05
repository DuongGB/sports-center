export const API_BASE_URL =  import.meta.env.VITE_API_URL_BASE;

export const apiCall = async (endpoint, options = {}) => {
  const accessToken = localStorage.getItem("accessToken");
  const headers = {
    ...options.headers,
  };

  // Only set default Content-Type to JSON if body is NOT FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Có lỗi xảy ra");
  }

  return data;
};
