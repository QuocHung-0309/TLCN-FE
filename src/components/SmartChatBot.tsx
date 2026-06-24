"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Send,
  X,
  Minimize2,
  Loader2,
  Headset,
  Trash2,
  AlertTriangle,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import useUser from "#/src/hooks/useUser";
import {
  sendChatbotMessage,
  type ChatbotMessage,
  type TourCard,
} from "@/lib/chatbot/chatbotApi";
import {
  getSupportMessages,
  sendSupportMessage,
  startSupportChat,
  type ChatMessage,
  ROLE_LABELS,
  isStaffRole,
} from "@/lib/chat/chatApi";
import { toast } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "ai" | "human";

type DisplayMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tours?: TourCard[];
  timestamp: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n?.toLocaleString("vi-VN") + "đ";
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function genId() {
  return Math.random().toString(36).slice(2);
}

// ─── Tour Mini Card ────────────────────────────────────────────────────────────

function TourMiniCard({ tour }: { tour: TourCard }) {
  const slug = tour.destinationSlug || "tour";
  const href = `/user/destination/${slug}/${tour._id}`;

  return (
    <Link
      href={href}
      className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
    >
      {tour.images?.[0] ? (
        <img
          src={tour.images[0]}
          alt={tour.title}
          className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="h-16 w-20 flex-shrink-0 rounded-lg bg-orange-50 flex items-center justify-center text-orange-300">
          <Bot size={20} />
        </div>
      )}
      <div className="flex flex-col justify-between min-w-0">
        <p className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
          {tour.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {tour.destination && (
            <span className="text-[10px] text-slate-500">{tour.destination}</span>
          )}
          {tour.time && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] text-slate-500">{tour.time}</span>
            </>
          )}
        </div>
        {tour.priceAdult > 0 && (
          <p className="text-xs font-bold text-orange-500 mt-0.5">
            từ {formatPrice(tour.priceAdult)}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SmartChatBot() {
  const { user, isAuthenticated } = useUser();

  // Widget state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<Mode>("ai");

  // AI mode state
  const [aiHistory, setAiHistory] = useState<ChatbotMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Human mode state
  const [supportId, setSupportId] = useState<string | null>(null);
  const [humanMessages, setHumanMessages] = useState<ChatMessage[]>([]);
  const [humanSending, setHumanSending] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Guest form (for human escalation if not logged in)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, humanMessages, mode]);

  // ── Welcome message when opening ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && displayMessages.length === 0 && mode === "ai") {
      const name = user?.fullName ? `, ${user.fullName.split(" ").pop()}` : "";
      setDisplayMessages([
        {
          id: genId(),
          role: "assistant",
          content: `Xin chào${name}! Mình là Smart Tour Assistant của AHH Travel.\n\nMình có thể giúp bạn:\n• Gợi ý tour phù hợp với ngân sách và sở thích\n• Tư vấn lịch trình, điểm đến\n• Hỗ trợ đặt tour và thanh toán\n\nBạn muốn đi đâu hoặc cần mình giúp gì?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen]);

  // ── Poll human messages ──────────────────────────────────────────────────────
  const loadHumanMessages = useCallback(
    async (sid: string) => {
      try {
        const res = await getSupportMessages(sid);
        setHumanMessages(res.data || []);
      } catch {
        // ignore
      }
    },
    []
  );

  useEffect(() => {
    if (mode === "human" && supportId && isOpen) {
      loadHumanMessages(supportId);
      pollRef.current = setInterval(() => loadHumanMessages(supportId), 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [mode, supportId, isOpen, loadHumanMessages]);

  // ── Send AI message ──────────────────────────────────────────────────────────
  const handleSendAI = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");

    const userMsg: ChatbotMessage = { role: "user", content: text };
    const newHistory = [...aiHistory, userMsg];
    setAiHistory(newHistory);

    setDisplayMessages((prev) => [
      ...prev,
      {
        id: genId(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      },
    ]);

    setLoading(true);
    try {
      const res = await sendChatbotMessage(newHistory, {
        name: user?.fullName || guestName,
        email: user?.email || guestEmail,
      });

      const assistantMsg: ChatbotMessage = {
        role: "assistant",
        content: res.reply,
      };
      setAiHistory([...newHistory, assistantMsg]);

      setDisplayMessages((prev) => [
        ...prev,
        {
          id: genId(),
          role: "assistant",
          content: res.reply,
          tours: res.tours?.length ? res.tours : undefined,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Escalate to human if Claude decided so
      if (res.action?.type === "escalate") {
        setSupportId(res.action.supportId);
        setMode("human");
        setDisplayMessages((prev) => [
          ...prev,
          {
            id: genId(),
            role: "system",
            content: "Đang kết nối bạn với nhân viên hỗ trợ...",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setDisplayMessages((prev) => [
        ...prev,
        {
          id: genId(),
          role: "assistant",
          content: "Xin lỗi, mình gặp sự cố kỹ thuật. Bạn vui lòng thử lại sau nhé.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ── Send Human message ───────────────────────────────────────────────────────
  const handleSendHuman = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || humanSending || !supportId) return;

    setInput("");
    setHumanSending(true);
    try {
      await sendSupportMessage(supportId, {
        content: text,
        name: user?.fullName || guestName,
        email: user?.email || guestEmail,
      });
      await loadHumanMessages(supportId);
    } catch {
      toast.error("Không gửi được tin nhắn");
    } finally {
      setHumanSending(false);
    }
  };

  // ── Manual escalate to human ─────────────────────────────────────────────────
  const handleEscalateManual = async () => {
    if (isConnecting) return;
    if (supportId) {
      setMode("human");
      setInput("");
      return;
    }
    setIsConnecting(true);
    try {
      const lastUserMsg =
        [...aiHistory].reverse().find((m) => m.role === "user")?.content ||
        "Yêu cầu hỗ trợ từ chatbot";
      const res = await startSupportChat({
        name: user?.fullName || guestName || "Khách",
        email: user?.email || guestEmail || "",
        content: lastUserMsg,
      });
      setSupportId(res.supportId);
      setMode("human");
      setInput("");
    } catch {
      toast.error("Không thể kết nối hỗ trợ viên lúc này");
    } finally {
      setIsConnecting(false);
    }
  };

  // ── End chat ─────────────────────────────────────────────────────────────────
  const handleEndChat = () => {
    setShowEndConfirm(false);
    setMode("ai");
    setSupportId(null);
    setHumanMessages([]);
    setAiHistory([]);
    setDisplayMessages([]);
    setInput("");
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (mode === "ai") handleSendAI();
      else handleSendHuman();
    }
  };

  const isSending = mode === "ai" ? loading : humanSending;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-105 active:scale-95 transition-all"
            aria-label="Mở Smart Tour Assistant"
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={
              isMinimized
                ? { opacity: 1, y: 0, scale: 1, height: "auto" }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 border border-slate-100"
            style={{ maxHeight: isMinimized ? "auto" : "min(560px, calc(100dvh - 120px))" }}
          >
            {/* Header */}
            <div
              className={`flex items-center gap-3 px-4 py-3 ${
                mode === "human"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700"
                  : "bg-gradient-to-r from-orange-500 to-orange-600"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                {mode === "human" ? (
                  <Headset size={18} className="text-white" />
                ) : (
                  <Bot size={18} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">
                  {mode === "human" ? "Hỗ trợ trực tuyến" : "Smart Tour Assistant"}
                </p>
                <p className="text-[11px] text-white/70">
                  {mode === "human"
                    ? `#${supportId}`
                    : "Trợ lý AI • AHH Travel"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {mode === "ai" && (
                  <button
                    onClick={handleEscalateManual}
                    disabled={isConnecting}
                    title="Kết nối hỗ trợ viên"
                    className="rounded-lg p-1.5 text-white/70 hover:bg-white/15 hover:text-white transition-colors disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Headset size={15} />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized((v) => !v)}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                >
                  <Minimize2 size={15} />
                </button>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50 min-h-0 max-h-[400px]">
                  {/* ── AI mode messages ── */}
                  {mode === "ai" &&
                    displayMessages.map((msg) => {
                      if (msg.role === "system") {
                        return (
                          <div key={msg.id} className="flex justify-center">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] text-blue-600 border border-blue-100">
                              {msg.content}
                            </span>
                          </div>
                        );
                      }

                      const isUser = msg.role === "user";
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex w-full ${isUser ? "justify-end" : "justify-start"} gap-2`}
                        >
                          {!isUser && (
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 mt-1">
                              <Sparkles size={13} />
                            </div>
                          )}
                          <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                                isUser
                                  ? "rounded-tr-none bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                  : "rounded-tl-none bg-white text-slate-800 border border-slate-100"
                              }`}
                            >
                              {isUser ? (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              ) : (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="mb-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
                                    ol: ({ children }) => <ol className="mb-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
                                    li: ({ children }) => <li className="leading-snug">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                    a: ({ href, children }) => (
                                      <a href={href} className="underline underline-offset-2 opacity-80 hover:opacity-100" target="_blank" rel="noopener noreferrer">{children}</a>
                                    ),
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              )}
                            </div>

                            {/* Tour cards */}
                            {msg.tours && msg.tours.length > 0 && (
                              <div className="mt-2 w-full space-y-2">
                                {msg.tours.map((tour) => (
                                  <TourMiniCard key={tour._id} tour={tour} />
                                ))}
                              </div>
                            )}

                            <span className="mt-1 px-1 text-[9px] text-slate-400">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          {isUser && (
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 mt-1">
                              <UserCircle2 size={13} />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                  {/* AI loading */}
                  {mode === "ai" && loading && (
                    <div className="flex justify-start gap-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                        <Sparkles size={13} />
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-white border border-slate-100 px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Human mode messages ── */}
                  {mode === "human" &&
                    humanMessages.map((msg, idx) => {
                      const isMe =
                        msg.fromRole === "user" || msg.fromRole === "guest";
                      const isSupport = isStaffRole(msg.fromRole);

                      return (
                        <motion.div
                          key={msg._id || idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {isSupport && (
                            <div className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-1">
                              <Headset size={13} />
                            </div>
                          )}
                          <div className={`flex max-w-[80%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {isSupport && (
                              <span className="mb-0.5 ml-1 text-[10px] font-medium text-blue-600">
                                {ROLE_LABELS[msg.fromRole] || "Hỗ trợ viên"}
                              </span>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                                isMe
                                  ? "rounded-tr-none bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                  : "rounded-tl-none bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <span className="mt-1 px-1 text-[9px] text-slate-400">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}

                  {/* Human mode — no messages yet */}
                  {mode === "human" && humanMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <Loader2 size={20} className="animate-spin text-blue-400" />
                      <p className="text-xs text-slate-400">
                        Đang kết nối với hỗ trợ viên...
                      </p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input footer */}
                <div className="border-t border-slate-100 bg-white p-3 z-10">
                  <form
                    onSubmit={mode === "ai" ? handleSendAI : handleSendHuman}
                    className="flex items-end gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-orange-400 transition-all"
                  >
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        mode === "human"
                          ? "Nhập tin nhắn cho hỗ trợ viên..."
                          : "Hỏi về tour, điểm đến, giá cả..."
                      }
                      className="max-h-24 w-full resize-none bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isSending}
                      className={`mb-1 rounded-full p-2 text-white active:scale-95 transition-all disabled:bg-slate-300 ${
                        mode === "human"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      {isSending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </form>

                  <div className="mt-2 flex items-center justify-between px-1">
                    {mode === "human" ? (
                      <button
                        onClick={() => setShowEndConfirm(true)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={11} /> Kết thúc
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-300">
                        AI có thể mắc lỗi • Nhấn Enter để gửi
                      </span>
                    )}
                    {mode === "human" && (
                      <button
                        onClick={() => { setMode("ai"); setInput(""); }}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-orange-500 transition-colors"
                      >
                        <Bot size={11} /> Quay lại AI
                      </button>
                    )}
                  </div>
                </div>

                {/* End chat confirm */}
                <AnimatePresence>
                  {showEndConfirm && (
                    <>
                      <motion.button
                        type="button"
                        aria-label="Đóng"
                        onClick={() => setShowEndConfirm(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[50] bg-black/30 backdrop-blur-[2px]"
                      />
                      <motion.div
                        role="dialog"
                        aria-modal="true"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        className="absolute inset-x-0 bottom-0 z-[60] p-4"
                      >
                        <div className="rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                                <AlertTriangle size={18} />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-800">
                                  Kết thúc cuộc trò chuyện?
                                </h4>
                                <p className="mt-1 text-xs text-slate-500">
                                  Toàn bộ lịch sử chat sẽ bị xóa. Bạn có chắc không?
                                </p>
                              </div>
                              <button
                                onClick={() => setShowEndConfirm(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => setShowEndConfirm(false)}
                                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={handleEndChat}
                                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-500/25"
                              >
                                Kết thúc
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
