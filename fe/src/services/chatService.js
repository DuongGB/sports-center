import { apiCall } from "../config/api";

export const chatService = {
  getGuestConversation: async (phone) => {
    try {
      const response = await apiCall(`/chat/conversations/guest/${phone}`);
      return response.data || response;
    } catch (error) {
      return null;
    }
  },

  getUserConversation: async (userId) => {
    try {
      const response = await apiCall(`/chat/conversations/user/${userId}`);
      return response.data || response;
    } catch (error) {
      return null;
    }
  },

  getMessages: async (conversationId) => {
    const response = await apiCall(
      `/chat/conversations/${conversationId}/messages`,
    );
    return response.data || response;
  },

  getConversations: async (pageParam = 0, size = 5) => {
    const response = await apiCall(`/chat/conversations?page=${pageParam}&size=${size}`);
    return response.data || response;
  },

  deleteConversation: async (conversationId) => {
    const response = await apiCall(`/chat/conversations/${conversationId}`, {
      method: "DELETE",
    });
    return response.data || response;
  },

  markAsRead: async (conversationId, userType) => {
    const response = await apiCall(
      `/chat/conversations/${conversationId}/read?userType=${userType}`,
      {
        method: "PUT",
      },
    );
    return response.data || response;
  },

  sendMessage: async (data) => {
    const response = await apiCall("/chat/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || response;
  },
};
