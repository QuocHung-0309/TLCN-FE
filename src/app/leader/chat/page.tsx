"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  MessageSquare, Users, ChevronDown, ChevronRight, Send, Loader2,
  X, Search, Plane, Calendar,
} from "lucide-react";
import {
  leaderToursApi, leaderChatApi, LeaderTour, Passenger, ChatMessage,
} from "@/lib/leader/leaderApi";

function TourSkeleton() {
  return (
    <div className="animate-pulse space-y-2 p-3">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeaderChatPage() {
  const [tours, setTours]               = useState<LeaderTour[]>([]);
  const [passengersMap, setPassengersMap] = useState<Record<string, Passenger[]>>({});
  const [expandedTour, setExpandedTour] = useState<string | null>(null);
  const [loadingTours, setLoadingTours] = useState(true);
  const [loadingPax, setLoadingPax]     = useState<Record<string, boolean>>({});
  const [search, setSearch]             = useState("");

  const [activePax, setActivePax]       = useState<(Passenger & { tourTitle: string }) | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]       = useState("");
  const [chatLoading, setChatLoading]   = useState(false);
  const [sendingChat, setSendingChat]   = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load active tours
  useEffect(() => {
    (async () => {
      try {
        const all = await leaderToursApi.getMyTours();
        setTours(all.filter(t => t.status === "in_progress" || t.status === "confirmed"));
      } catch { toast.error("Không thể tải danh sách tour"); }
      finally { setLoadingTours(false); }
    })();
  }, []);

  // Expand a tour: load its passengers
  const toggleTour = async (tour: LeaderTour) => {
    const id = tour._id;
    if (expandedTour === id) { setExpandedTour(null); return; }
    setExpandedTour(id);
    if (passengersMap[id]) return;
    setLoadingPax(prev => ({ ...prev, [id]: true }));
    try {
      const res = await leaderToursApi.getPassengers(id);
      setPassengersMap(prev => ({ ...prev, [id]: res.data ?? [] }));
    } catch { toast.error("Không thể tải hành khách"); }
    finally { setLoadingPax(prev => ({ ...prev, [id]: false })); }
  };

  // Open chat with a passenger
  const openChat = async (p: Passenger, tourTitle: string) => {
    setActivePax({ ...p, tourTitle });
    setChatMessages([]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await leaderChatApi.getBookingMessages(p.code);
      setChatMessages(res.data ?? []);
    } catch { /* silent */ }
    finally { setChatLoading(false); }
  };

  // Poll when chat is open
  useEffect(() => {
    if (!activePax) return;
    const poll = async () => {
      try {
        const res = await leaderChatApi.getBookingMessages(activePax.code);
        setChatMessages(res.data ?? []);
      } catch { /* silent */ }
    };
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [activePax]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePax || !chatInput.trim() || sendingChat) return;
    setSendingChat(true);
    const content = chatInput.trim();
    setChatInput("");
    try {
      const res = await leaderChatApi.sendBookingMessage(activePax.code, content);
      setChatMessages(prev => [...prev, res.data]);
    } catch { toast.error("Không thể gửi tin nhắn"); setChatInput(content); }
    finally { setSendingChat(false); }
  };

  const filteredTours = tours.filter(t =>
    !search.trim() ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 px-6 md:px-8 py-6 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(249,115,22,0.2),transparent_55%)]" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-3 py-1 text-xs font-semibold text-orange-200 mb-3">
            <MessageSquare className="w-3 h-3" /> Chat hành khách
          </div>
          <h1 className="text-2xl font-extrabold text-white">Nhắn tin</h1>
          <p className="text-blue-200/70 text-sm mt-1">Chat trực tiếp với hành khách theo từng tour</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* LEFT — tour + passenger list */}
        <div className="w-full sm:w-80 lg:w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tour..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingTours ? (
              <TourSkeleton />
            ) : filteredTours.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-2 p-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  {search ? "Không tìm thấy tour" : "Chưa có tour đang chạy"}
                </p>
              </div>
            ) : (
              filteredTours.map(tour => {
                const isOpen = expandedTour === tour._id;
                const pax    = passengersMap[tour._id] ?? [];
                const loading = loadingPax[tour._id];
                return (
                  <div key={tour._id} className="border-b border-slate-100 last:border-0">
                    {/* Tour row */}
                    <button
                      onClick={() => toggleTour(tour)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                        ${isOpen ? "bg-blue-900 text-white" : "bg-blue-50 text-blue-600"}`}>
                        <Plane className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{tour.title}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {fmtDate(tour.startDate)} – {fmtDate(tour.endDate)}
                          <span className="mx-1">·</span>
                          <Users className="w-3 h-3" />
                          {tour.bookedCount ?? 0} khách
                        </p>
                      </div>
                      {isOpen
                        ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </button>

                    {/* Passengers */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden bg-slate-50 border-t border-slate-100"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                          ) : pax.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-5">Chưa có hành khách</p>
                          ) : (
                            pax.map(p => {
                              const name = p.userId?.fullName ?? p.fullName ?? "—";
                              const init = name.split(" ").map((n:string) => n[0]).slice(-2).join("").toUpperCase();
                              const isActive = activePax?._id === p._id;
                              return (
                                <button
                                  key={p._id}
                                  onClick={() => openChat(p, tour.title)}
                                  className={`w-full flex items-center gap-3 px-5 py-3 transition-colors text-left
                                    ${isActive ? "bg-blue-50 border-l-2 border-blue-600" : "hover:bg-white border-l-2 border-transparent"}`}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                                    {init}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                                    <p className="text-xs text-slate-400 truncate">#{p.code}</p>
                                  </div>
                                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-300"}`} />
                                </button>
                              );
                            })
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT — chat panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {!activePax ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-600">Chọn hành khách để bắt đầu nhắn tin</p>
              <p className="text-sm text-slate-400 max-w-xs">
                Mở rộng tour ở bên trái và chọn tên hành khách để xem và gửi tin nhắn.
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-white flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                  {(activePax.userId?.fullName ?? activePax.fullName ?? "?")
                    .split(" ").map((n:string) => n[0]).slice(-2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">
                    {activePax.userId?.fullName ?? activePax.fullName ?? "Khách hàng"}
                  </p>
                  <p className="text-xs text-slate-400">
                    #{activePax.code} · {activePax.tourTitle}
                  </p>
                </div>
                <button
                  onClick={() => setActivePax(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Chưa có tin nhắn</p>
                    <p className="text-xs text-slate-400">Bắt đầu cuộc trò chuyện với hành khách</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    if (msg.isSystem) {
                      return (
                        <div key={msg._id || i} className="text-center">
                          <span className="text-xs text-slate-400 bg-slate-200 px-3 py-1 rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }
                    const isLeader = msg.fromRole === "leader";
                    return (
                      <div key={msg._id || i} className={`flex ${isLeader ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm
                          ${isLeader
                            ? "bg-blue-900 text-white rounded-br-sm"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                          }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isLeader ? "text-blue-300" : "text-slate-400"}`}>
                            {new Date(msg.createdAt).toLocaleString("vi-VN", {
                              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendChat} className="flex gap-2 p-4 border-t border-slate-200 bg-white flex-shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`Nhắn tin với ${activePax.userId?.fullName ?? "hành khách"}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                />
                <button type="submit" disabled={!chatInput.trim() || sendingChat}
                  className="px-4 py-2.5 rounded-xl bg-blue-900 text-white font-medium hover:bg-blue-800 disabled:opacity-40 transition-colors flex items-center gap-2 text-sm">
                  {sendingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
