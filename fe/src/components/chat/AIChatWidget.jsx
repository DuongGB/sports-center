import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, MapPin, Clock, DollarSign, ChevronRight } from "lucide-react";
import { chatAiService } from "../../services/chatAiService";

const QUICK_SUGGESTIONS = [
  { label: "Xem danh sách sân", icon: "🏟️" },
  { label: "Giá sân bóng đá", icon: "⚽" },
  { label: "Sân cầu lông", icon: "🏸" },
  { label: "Cách đặt sân", icon: "📋" },
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (text) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMsg = { role: "user", content: messageText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await chatAiService.sendMessage(messageText);
      const aiMsg = {
        role: "ai",
        content: response.reply,
        courts: response.courts || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = {
        role: "ai",
        content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau! 😔",
        courts: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const formatContent = (content) => {
    if (!content) return "";
    // Convert **bold** to <strong>
    let formatted = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Convert newlines
    formatted = formatted.replace(/\n/g, "<br/>");
    return formatted;
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "linear-gradient(135deg, #8b5cf6, #a78bfa)",
        }}
        title="AI Trợ lý"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div
          className="absolute bottom-16 left-0 w-[360px] sm:w-[400px] h-[560px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border/50"
          style={{
            animation: "slideUp 0.3s ease-out",
            background: "var(--background, #fff)",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-[15px]">AI Trợ lý</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-xs">Powered by Gemini AI ✨</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center px-2">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #ede9fe, #e0e7ff)" }}>
                    <Sparkles className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="font-semibold text-foreground text-base">Xin chào! 👋</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tôi có thể giúp bạn tìm sân, xem giá và hướng dẫn đặt sân.
                  </p>
                </div>

                {/* Quick Suggestions */}
                <div className="space-y-2">
                  {QUICK_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s.label)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-left group"
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="flex-1 text-sm font-medium text-foreground">{s.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-white shadow-sm"
                          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-start">
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{ background: "linear-gradient(135deg, #ede9fe, #e0e7ff)" }}>
                          <Bot className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="max-w-[95%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm bg-card border border-border/50 shadow-sm text-foreground">
                            <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                          </div>

                          {/* Court Cards */}
                          {msg.courts && msg.courts.length > 0 && (
                            <div className="space-y-2 max-w-[95%]">
                              {msg.courts.slice(0, 3).map((court, ci) => (
                                <CourtCard key={ci} court={court} />
                              ))}
                              {msg.courts.length > 3 && (
                                <p className="text-xs text-muted-foreground text-center">
                                  ... và {msg.courts.length - 3} sân khác
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2 items-start">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #ede9fe, #e0e7ff)" }}>
                      <Bot className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-card border border-border/50 shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-background border-t border-border/50">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Hỏi về sân, giá..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-border/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 bg-background text-foreground disabled:opacity-50 placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white disabled:opacity-40 transition-all hover:shadow-md disabled:hover:shadow-none"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Powered by Google Gemini AI ✨
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function CourtCard({ court }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm text-foreground">{court.name}</h4>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {court.sportType}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>{court.location}</span>
        </div>
        {court.openTime && court.closeTime && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{court.openTime} - {court.closeTime}</span>
          </div>
        )}
      </div>

      {court.prices && court.prices.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/30">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-amber-500" />
            <span className="text-xs font-medium text-foreground">Bảng giá:</span>
          </div>
          <div className="space-y-0.5">
            {court.prices.map((p, i) => (
              <div key={i} className="flex justify-between text-xs text-muted-foreground">
                <span>{p.startTime} - {p.endTime}</span>
                <span className="font-semibold text-foreground">
                  {new Intl.NumberFormat("vi-VN").format(p.price)} VND
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
