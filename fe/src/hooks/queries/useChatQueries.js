import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chatService";

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useConversations() {
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => chatService.getConversations(),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: ["chat", "messages", conversationId],
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutes for messages
  });
}
