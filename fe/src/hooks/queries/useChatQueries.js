import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chatService";

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useConversations(page = 0, size = 6) {
  return useQuery({
    queryKey: ["chat", "conversations", page],
    queryFn: () => chatService.getConversations(page, size),
    staleTime: DEFAULT_STALE_TIME,
    keepPreviousData: true,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId) => chatService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
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
