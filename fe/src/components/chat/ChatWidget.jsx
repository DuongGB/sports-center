import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../hooks/useAuth";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { API_BASE_URL, WS_URL } from "../../config/api";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  
  // States cho khách vãng lai
  const [guestPhone, setGuestPhone] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isGuestRegistered, setIsGuestRegistered] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);
  const stompClient = useRef(null);

  useEffect(() => {
    // Tự động kéo xuống khi có tin nhắn mới
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    // Lấy thông tin conversation ban đầu
    const initChat = async () => {
      let conv = null;
      if (isAuthenticated && user) {
        conv = await chatService.getUserConversation(user.id);
      } else {
        // Kiểm tra local storage xem khách đã nhập thông tin chưa
        const storedGuestPhone = localStorage.getItem("guestPhone");
        const storedGuestName = localStorage.getItem("guestName");
        if (storedGuestPhone) {
          setGuestPhone(storedGuestPhone);
          setGuestName(storedGuestName || "Khách");
          setIsGuestRegistered(true);
          conv = await chatService.getGuestConversation(storedGuestPhone);
        }
      }

      if (conv) {
        setConversationId(conv.id);
        const history = await chatService.getMessages(conv.id);
        setMessages(history);
      }
    };

    if (isOpen) {
      initChat();
    }
  }, [isOpen, isAuthenticated, user]);

  useEffect(() => {
    if (conversationId && isOpen) {
      // Connect WebSocket
      const socket = new SockJS(`${WS_URL}`);
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe(`/topic/chat/conversation/${conversationId}`, (msg) => {
            const newMsg = JSON.parse(msg.body);
            setMessages((prev) => {
              // Tránh duplicate nếu tin nhắn do chính mình gửi
              if (prev.find((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          });
        },
      });

      client.activate();
      stompClient.current = client;

      return () => {
        client.deactivate();
      };
    }
  }, [conversationId, isOpen]);

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestPhone) return;
    
    localStorage.setItem("guestPhone", guestPhone);
    localStorage.setItem("guestName", guestName);
    setIsGuestRegistered(true);
    
    const conv = await chatService.getGuestConversation(guestPhone);
    if (conv) {
      setConversationId(conv.id);
      const history = await chatService.getMessages(conv.id);
      setMessages(history);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let senderType = "GUEST";
    let senderId = null;

    if (isAuthenticated && user) {
      senderType = user.roles?.includes("ADMIN") ? "ADMIN" : "USER";
      senderId = user.id;
    }

    const payload = {
      conversationId: conversationId,
      senderType,
      senderId,
      guestPhone: senderType === "GUEST" ? guestPhone : null,
      guestName: senderType === "GUEST" ? guestName : null,
      content: newMessage,
    };

    try {
      const sentMsg = await chatService.sendMessage(payload);
      if (!conversationId && sentMsg.conversationId) {
        setConversationId(sentMsg.conversationId);
      }
      setMessages((prev) => {
        if (prev.find((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
      setNewMessage("");
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Nút bật/tắt chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-transform transform hover:scale-105"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Box chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
            <h3 className="font-semibold text-lg">Hỗ trợ trực tuyến</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5 text-primary-foreground/80 hover:text-white" />
            </button>
          </div>

          {!isAuthenticated && !isGuestRegistered ? (
            /* Form nhập thông tin khách */
            <div className="flex-1 p-6 flex flex-col justify-center">
              <h4 className="text-center font-medium mb-4 text-foreground">Vui lòng nhập thông tin để bắt đầu chat</h4>
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Tên của bạn</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                    placeholder="Nhập tên..."
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                    placeholder="Nhập SĐT..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90"
                >
                  Bắt đầu chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Nội dung chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground mt-10">
                    Chưa có tin nhắn nào. Hãy gửi lời chào!
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe =
                      (isAuthenticated && msg.senderId === user?.id) ||
                      (!isAuthenticated && msg.senderType === "GUEST");

                    return (
                      <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none"
                          }`}
                        >
                          <div className="text-sm break-words">{msg.content}</div>
                          <div className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Ô nhập chat */}
              <div className="p-3 bg-background border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:bg-primary/90"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
