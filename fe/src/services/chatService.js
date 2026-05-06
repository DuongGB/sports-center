import { apiCall } from "../config/api";

export const chatService = {
  getGuestConversation: async (phone) => {
    try {
      const response = await apiCall(`/v1/chat/conversations/guest/${phone}`);
      return response.data || response;
    } catch (error) {
      return null;
    }
  },

  getUserConversation: async (userId) => {
    try {
      const response = await apiCall(`/v1/chat/conversations/user/${userId}`);
      return response.data || response;
    } catch (error) {
      return null;
    }
  },

  getMessages: async (conversationId) => {
    const response = await apiCall(`/v1/chat/conversations/${conversationId}/messages`);
    return response.data || response;
  },

  getConversations: async () => {
    const response = await apiCall("/v1/chat/conversations");
    return response.data || response;
  },

  markAsRead: async (conversationId, userType) => {
    const response = await apiCall(`/v1/chat/conversations/${conversationId}/read?userType=${userType}`, {
      method: "PUT",
    });
    return response.data || response;
  },

  sendMessage: async (data) => {
    const response = await apiCall("/v1/chat/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || response;
  },
};
