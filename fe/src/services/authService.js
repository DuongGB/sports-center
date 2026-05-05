import { apiCall } from "@/config/api";

export const authService = {
  forgotPassword: (email) => apiCall("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  }),
  resetPassword: (token, newPassword) => apiCall("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword })
  })
};
