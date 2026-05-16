import { useState, useEffect, useRef } from "react";
import { chatService } from "../../services/chatService";
import { API_BASE_URL } from "../../config/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Send, Search, User, Phone, MessageCircle, ArrowLeft, Trash2, Bot, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useConversations, useMessages, useDeleteConversation } from "../../hooks/queries/useChatQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/toast";

export default function ChatPage() {
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);

  const { data, isLoading: loadingConvs } = useConversations(page, 6);
  const { data: messages = [], isLoading: loadingMsgs } = useMessages(selectedConvId);
  const deleteMutation = useDeleteConversation();

  const conversations = data?.content || [];
  const totalPages = data?.totalPages || 0;
  
  const messagesEndRef = useRef(null);
  const selectedConvIdRef = useRef(selectedConvId);
  
  // Đồng bộ ID cuộc trò chuyện hiện tại lên queryCache để AdminLayout (chứa WebSocket) biết được
  useEffect(() => {
    queryClient.setQueryData(["activeChatId"], selectedConvId);
    return () => queryClient.setQueryData(["activeChatId"], null);
  }, [selectedConvId, queryClient]);

  useEffect(() => {
    selectedConvIdRef.current = selectedConvId;
    if (!selectedConvId) return;

    const cachedPage = queryClient.getQueryData(["chat", "conversations", page]);
    const conv = cachedPage?.content?.find(c => c.id === selectedConvId);

    // Chỉ gọi API markAsRead nếu thực sự có tin nhắn chưa đọc
    if (conv && conv.unreadCount > 0) {
      chatService.markAsRead(selectedConvId, "ADMIN").catch(console.error);
      // Đánh dấu đã đọc trong cache local
      queryClient.setQueryData(["chat", "conversations", page], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          content: oldData.content.map(c => c.id === selectedConvId ? { ...c, unreadCount: 0 } : c)
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConvId]);

  // Cuộn xuống dòng tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Kết nối WebSocket đã được chuyển sang AdminLayout để duy trì liên tục

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId) return;

    try {
      const payload = {
        conversationId: selectedConvId,
        senderType: "ADMIN",
        senderId: user?.id,
        content: newMessage,
      };

      const sentMsg = await chatService.sendMessage(payload);
      
      // Cập nhật messages cache
      queryClient.setQueryData(["chat", "messages", selectedConvId], (old) => {
        const prev = old || [];
        if (prev.find((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });

      setNewMessage("");

      // Cập nhật conversations cache
      queryClient.setQueryData(["chat", "conversations", page], (oldData) => {
        if (!oldData) return oldData;
        
        const prev = oldData.content || [];
        const index = prev.findIndex((c) => c.id === selectedConvId);
        let updatedList = [...prev];
        if (index !== -1) {
          updatedList[index] = {
            ...updatedList[index],
            lastMessage: sentMsg.content,
            lastMessageAt: sentMsg.createdAt
          };
          const target = updatedList.splice(index, 1)[0];
          updatedList.unshift(target);
        }
        return { ...oldData, content: updatedList };
      });
    } catch (error) {
      console.error("Gửi tin nhắn lỗi:", error);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.userFullName || c.guestName || "Khách ẩn danh";
    const phone = c.guestPhone || "";
    return name.toLowerCase().includes(search.toLowerCase()) || phone.includes(search);
  });

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const handleDelete = (convId) => {
    showToast.confirm(
      "Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?",
      () => {
        deleteMutation.mutate(convId, {
          onSuccess: () => {
            if (selectedConvId === convId) {
              setSelectedConvId(null);
            }
            showToast.success("Đã xóa cuộc trò chuyện");
          }
        });
      },
      "Xóa"
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background rounded-lg border shadow-sm overflow-hidden relative">
      {/* Sidebar danh sách chat */}
      <div className={`w-full md:w-80 border-r flex flex-col bg-card ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Hỗ trợ khách hàng</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => queryClient.invalidateQueries(["chat", "conversations"])}
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loadingConvs ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Đang tải cuộc trò chuyện...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy cuộc trò chuyện nào</div>
          ) : (
            filteredConversations.map((c) => {
              const name = c.userFullName || c.guestName || "Khách ẩn danh";
              const isGuest = !c.userFullName;
              
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConvId === c.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm line-clamp-1 flex items-center gap-2">
                      {name} {isGuest && "(Khách)"}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      {c.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true, locale: vi })}
                        </span>
                      )}
                      {c.unreadCount > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full mt-0.5 shadow-sm">
                          {c.unreadCount > 99 ? '99+' : c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-1 ${c.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {c.lastMessage || "Chưa có tin nhắn"}
                  </p>
                </div>
              );
            })
          )}
          
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between border-t border-muted/50">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm bg-muted text-foreground hover:bg-muted/80 rounded-md transition-colors disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-muted-foreground">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm bg-muted text-foreground hover:bg-muted/80 rounded-md transition-colors disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className={`flex-1 flex flex-col bg-muted/10 ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConvId && selectedConv ? (
          <>
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-card">
              <div className="flex items-center">
                <button 
                  className="md:hidden mr-3 p-1.5 bg-muted rounded-full hover:bg-muted/80"
                  onClick={() => setSelectedConvId(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-lg">
                    {selectedConv.userFullName || selectedConv.guestName || "Khách ẩn danh"}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    {selectedConv.userFullName ? (
                      <span className="flex items-center"><User className="w-4 h-4 mr-1"/> Thành viên</span>
                    ) : (
                      <span className="flex items-center"><Phone className="w-4 h-4 mr-1"/> {selectedConv.guestPhone}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(selectedConv.id)}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                title="Xóa cuộc trò chuyện"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMsgs ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Đang tải tin nhắn...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10">
                  Chưa có tin nhắn nào.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isAdmin = msg.senderType === "ADMIN";
                  const isBot = msg.senderType === "BOT";

                  if (isBot) {
                    return (
                      <div key={msg.id || index} className="flex gap-3 justify-start my-4 group">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-200/50 dark:border-indigo-700/30">
                          <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 space-y-1.5 max-w-[85%]">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">AI Assistant</span>
                             <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          </div>
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
                            <div className="text-[14px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                            <div className="text-[10px] text-slate-400 mt-2 text-right">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id || index} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                          isAdmin
                            ? "bg-primary text-primary-foreground rounded-br-none shadow-md"
                            : "bg-card border text-foreground rounded-bl-none shadow-sm"
                        }`}
                      >
                        <div className="text-[15px] whitespace-pre-wrap">{msg.content}</div>
                        <div className={`text-xs mt-1 text-right ${isAdmin ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-card border-t">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}
