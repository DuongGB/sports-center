import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../hooks/useAuth";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { WS_URL } from "../../config/api";
import { useTheme } from "../theme-provider";

export default function ChatWidget() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  // Màu sắc theo theme
  const colors = {
    // Container chính
    boxBg: isDark ? "#1e293b" : "#ffffff",
    boxBorder: isDark ? "#334155" : "#e2e8f0",
    // Vùng tin nhắn
    chatAreaBg: isDark ? "#0f172a" : "#f8fafc",
    // Tin nhắn của tôi
    myMsgBg: isDark ? "#3b82f6" : "#2563eb",
    myMsgText: "#ffffff",
    myMsgTime: "rgba(255,255,255,0.7)",
    // Tin nhắn đối phương
    theirMsgBg: isDark ? "#334155" : "#ffffff",
    theirMsgText: isDark ? "#f1f5f9" : "#1e293b",
    theirMsgBorder: isDark ? "#475569" : "#e2e8f0",
    theirMsgTime: isDark ? "#94a3b8" : "#94a3b8",
    // BOT bubble
    botBg: isDark ? "rgba(79,70,229,0.25)" : "#f1f5f9",
    botBorder: isDark ? "#4338ca" : "#e2e8f0",
    botText: isDark ? "#f1f5f9" : "#1e293b",
    botTime: isDark ? "#94a3b8" : "#94a3b8",
    // Input area
    inputAreaBg: isDark ? "#1e293b" : "#ffffff",
    inputAreaBorder: isDark ? "#334155" : "#e2e8f0",
    inputBg: isDark ? "#0f172a" : "#ffffff",
    inputBorder: isDark ? "#475569" : "#cbd5e1",
    inputText: isDark ? "#f1f5f9" : "#1e293b",
    inputPlaceholder: isDark ? "#64748b" : "#94a3b8",
    // Form khách
    formBg: isDark ? "#1e293b" : "#ffffff",
    formTitleText: isDark ? "#f1f5f9" : "#1e293b",
    labelText: isDark ? "#94a3b8" : "#64748b",
    // Trống
    emptyText: isDark ? "#64748b" : "#94a3b8",
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    const initChat = async () => {
      let conv = null;
      if (isAuthenticated && user) {
        conv = await chatService.getUserConversation(user.id);
      } else {
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
      const socket = new SockJS(`${WS_URL}`);
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: async () => {
          client.subscribe(
            `/topic/chat/conversation/${conversationId}`,
            (msg) => {
              const newMsg = JSON.parse(msg.body);
              setMessages((prev) => {
                if (prev.find((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            },
          );
          
          try {
            const history = await chatService.getMessages(conversationId);
            setMessages(history);
          } catch (error) {
            console.error("Failed to fetch messages on WS connect", error);
          }
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
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform transform hover:scale-105"
        style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Box chat */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            background: colors.boxBg,
            border: `1px solid ${colors.boxBorder}`,
            animation: "chatSlideIn 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="p-4 flex justify-between items-center"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-[15px]">Hỗ trợ trực tuyến</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/75 text-xs">Đang trực tuyến</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5 text-white/75 hover:text-white transition-colors" />
            </button>
          </div>

          {!isAuthenticated && !isGuestRegistered ? (
            /* Form nhập thông tin khách */
            <div
              className="flex-1 p-6 flex flex-col justify-center"
              style={{ background: colors.formBg }}
            >
              <h4
                className="text-center font-semibold mb-5 text-base"
                style={{ color: colors.formTitleText }}
              >
                Vui lòng nhập thông tin để bắt đầu chat
              </h4>
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm mb-1.5 font-medium"
                    style={{ color: colors.labelText }}
                  >
                    Tên của bạn
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm transition-all"
                    style={{
                      background: colors.inputBg,
                      border: `1.5px solid ${colors.inputBorder}`,
                      color: colors.inputText,
                    }}
                    placeholder="Nhập tên..."
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm mb-1.5 font-medium"
                    style={{ color: colors.labelText }}
                  >
                    Số điện thoại <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm transition-all"
                    style={{
                      background: colors.inputBg,
                      border: `1.5px solid ${colors.inputBorder}`,
                      color: colors.inputText,
                    }}
                    placeholder="Nhập SĐT..."
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                >
                  Bắt đầu chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Nội dung chat */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ background: colors.chatAreaBg }}
              >
                {messages.length === 0 ? (
                  <div
                    className="text-center text-sm mt-10"
                    style={{ color: colors.emptyText }}
                  >
                    Chưa có tin nhắn nào. Hãy gửi lời chào! 👋
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe =
                      (isAuthenticated && msg.senderId === user?.id) ||
                      (!isAuthenticated && msg.senderType === "GUEST");
                    const isBot = msg.senderType === "BOT";

                    if (isBot) {
                      return (
                        <div key={msg.id || index} className="flex justify-center my-2">
                          <div
                            className="flex items-center gap-2 rounded-xl px-4 py-2.5 max-w-[90%]"
                            style={{
                              background: colors.botBg,
                              border: `1px solid ${colors.botBorder}`,
                            }}
                          >
                            <span className="text-base">🤖</span>
                            <div>
                              <div
                                className="text-sm font-medium"
                                style={{ color: colors.botText }}
                              >
                                {msg.content}
                              </div>
                              <div
                                className="text-[10px] mt-0.5"
                                style={{ color: colors.botTime }}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className="max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm"
                          style={
                            isMe
                              ? {
                                  background: colors.myMsgBg,
                                  color: colors.myMsgText,
                                  borderRadius: "18px 18px 4px 18px",
                                }
                              : {
                                  background: colors.theirMsgBg,
                                  color: colors.theirMsgText,
                                  border: `1px solid ${colors.theirMsgBorder}`,
                                  borderRadius: "18px 18px 18px 4px",
                                }
                          }
                        >
                          <div className="text-sm break-words">{msg.content}</div>
                          <div
                            className="text-[10px] mt-1"
                            style={{
                              color: isMe ? colors.myMsgTime : colors.theirMsgTime,
                            }}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Ô nhập chat */}
              <div
                className="p-3"
                style={{
                  background: colors.inputAreaBg,
                  borderTop: `1px solid ${colors.inputAreaBorder}`,
                }}
              >
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition-all"
                    style={{
                      background: colors.inputBg,
                      border: `1.5px solid ${colors.inputBorder}`,
                      color: colors.inputText,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2.5 rounded-full text-white disabled:opacity-40 transition-all hover:shadow-md disabled:hover:shadow-none"
                    style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
