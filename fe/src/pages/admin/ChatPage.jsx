import { useState, useEffect, useRef } from "react";
import { chatService } from "../../services/chatService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { API_BASE_URL, WS_URL } from "../../config/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Send, Search, User, Phone, MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useConversations, useMessages } from "../../hooks/queries/useChatQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading: loadingConvs } = useConversations();
  const { data: messages = [], isLoading: loadingMsgs } = useMessages(selectedConvId);
  
  const messagesEndRef = useRef(null);
  const stompClient = useRef(null);

  // Đánh dấu đã đọc khi chọn conversation
  useEffect(() => {
    if (selectedConvId) {
      chatService.markAsRead(selectedConvId, "ADMIN").catch(console.error);
    }
  }, [selectedConvId]);

  // Cuộn xuống dòng tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Kết nối WebSocket (Admin subscribe tất cả hoặc có kênh riêng báo có tin nhắn mới)
  useEffect(() => {
    const socket = new SockJS(`${WS_URL}`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/chat/admin", (msg) => {
          const newMsg = JSON.parse(msg.body);
          
          // Cập nhật messages cache nếu đang mở đúng conversation
          if (selectedConvId === newMsg.conversationId) {
            queryClient.setQueryData(["chat", "messages", newMsg.conversationId], (old) => {
              const prev = old || [];
              if (prev.find((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            chatService.markAsRead(newMsg.conversationId, "ADMIN");
          }

          // Cập nhật conversations cache
          queryClient.setQueryData(["chat", "conversations"], (old) => {
            const prev = old || [];
            const index = prev.findIndex((c) => c.id === newMsg.conversationId);
            let updatedList = [...prev];
            
            if (index !== -1) {
              const updatedConv = { 
                ...updatedList[index], 
                lastMessage: newMsg.content, 
                lastMessageAt: newMsg.createdAt 
              };
              updatedList.splice(index, 1);
              updatedList.unshift(updatedConv);
            } else {
              // Reload conversations if it's a new one we don't have
              queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
            }
            return updatedList;
          });
        });
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [selectedConvId]);

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
      queryClient.setQueryData(["chat", "conversations"], (old) => {
        const prev = old || [];
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
        return updatedList;
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

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background rounded-lg border shadow-sm overflow-hidden">
      {/* Sidebar danh sách chat */}
      <div className="w-80 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Hỗ trợ khách hàng</h2>
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

        <div className="flex-1 overflow-y-auto">
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
                    <span className="font-semibold text-sm line-clamp-1">{name} {isGuest && "(Khách)"}</span>
                    {c.lastMessageAt && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true, locale: vi })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {c.lastMessage || "Chưa có tin nhắn"}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-muted/10">
        {selectedConvId && selectedConv ? (
          <>
            {/* Header */}
            <div className="h-16 border-b flex items-center px-6 bg-card">
              <div className="flex-1">
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
                      <div key={msg.id || index} className="flex justify-center my-2">
                        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl px-5 py-2.5 max-w-[85%]">
                          <span className="text-lg">🤖</span>
                          <div>
                            <span className="inline-block px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded text-[10px] font-semibold mb-1">BOT</span>
                            <div className="text-sm text-indigo-700 dark:text-indigo-300">{msg.content}</div>
                            <div className="text-xs text-indigo-400 mt-0.5 text-right">
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
