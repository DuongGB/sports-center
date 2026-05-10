import { apiCall } from "../config/api";

export const chatAiService = {
  sendMessage: async (message) => {
    const response = await apiCall("/chat/ai", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return response.data || response;
  },
};
