export const API_BASE_URL =  import.meta.env.VITE_API_URL_BASE;
export const WS_URL = import.meta.env.VITE_API_URL + "/ws";
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

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    if (!response.ok) {
      throw new Error(`Lỗi hệ thống (${response.status})`);
    }
    return await response.blob();
  }

  const text = await response.text();
  let data = {};
  
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Lỗi hệ thống (${response.status}): Vui lòng thử lại sau`);
    }
    throw new Error("Dữ liệu phản hồi không hợp lệ");
  }
  
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Có lỗi xảy ra");
  }

  return data;
};
