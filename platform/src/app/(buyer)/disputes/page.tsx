"use client";

import React, { useState, useEffect, useMemo } from "react";
import PlatformHeader from "@/components/nav/header";
import PlatformFooter from "@/components/nav/footer";
import { fintechApi } from "@/lib/api/client";
import { DisputeItem, DisputeMessage } from "@/lib/types";

export default function BuyerDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected Dispute Thread Modal
  const [activeDispute, setActiveDispute] = useState<DisputeItem | null>(null);
  const [threadMessages, setThreadMessages] = useState<DisputeMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await fintechApi.getDisputes();
      if (res && res.data && Array.isArray(res.data)) {
        setDisputes(res.data);
      } else {
        setDisputes([]);
      }
    } catch (err) {
      console.warn("Disputes fetch error:", err);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleOpenThread = async (dispute: DisputeItem) => {
    setActiveDispute(dispute);
    setLoadingMessages(true);
    try {
      const res = await fintechApi.getDisputeMessages(dispute.id);
      if (res && res.data && Array.isArray(res.data)) {
        setThreadMessages(res.data);
      } else {
        setThreadMessages([]);
      }
    } catch {
      setThreadMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeDispute || !newMessageText.trim()) return;

    setIsSendingMessage(true);
    const textToSend = newMessageText.trim();
    try {
      const res = await fintechApi.sendDisputeMessage(activeDispute.id, textToSend);
      if (res && res.data) {
        setThreadMessages((prev) => [...prev, res.data]);
      }
    } catch (err: any) {
      alert(`Failed to send message: ${err.message || "Network error"}`);
    } finally {
      setNewMessageText("");
      setIsSendingMessage(false);
    }
  };

  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      if (statusFilter === "open" && d.status !== "open" && d.status !== "under_review") return false;
      if (statusFilter === "resolved" && !d.status.startsWith("resolved")) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = d.product_title.toLowerCase().includes(query);
        const matchOrder = d.order_number.toLowerCase().includes(query);
        const matchReason = d.reason.toLowerCase().includes(query);
        if (!matchTitle && !matchOrder && !matchReason) return false;
      }
      return true;
    });
  }, [disputes, statusFilter, searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#1D1D21] text-[#EDEDF0] flex flex-col selection:bg-[#8535FC]/30 selection:text-white font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#41414612_1px,transparent_1px),linear-gradient(to_bottom,#41414612_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] max-w-[100vw] h-[320px] bg-gradient-to-b from-[#EF4444]/10 via-[#8535FC]/5 to-transparent blur-3xl pointer-events-none z-0" />

      <PlatformHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-16 sm:pt-24 pb-16 relative z-10">

        {/* HERO SECTION */}
        <div className="relative mb-6 sm:mb-8 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#27272A]/85 via-[#27272A]/50 to-[#141417]/95 border border-[#414146]/60 backdrop-blur-2xl shadow-xl overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-[10px] sm:text-xs font-mono font-medium mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-ping" />
            <span>ESCROW ARBITRATION DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            Escrow Dispute & Code Inspection Desk
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 max-w-2xl">
            When you file a dispute during the 72-hour escrow inspection period, funds are immediately frozen. Our automated Tree-Sitter linters and human arbitration team examine code evidence to issue full refunds or author releases.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#141417] border border-[#414146] rounded-xl w-fit">
            {[
              { id: "all", label: `All Disputes (${disputes.length})` },
              { id: "open", label: "Open & Active" },
              { id: "resolved", label: "Resolved" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === tab.id
                    ? "bg-[#27272A] text-white shadow-sm border border-[#414146]"
                    : "text-[#A1A1AA] hover:text-[#EDEDF0]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search dispute by order or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 px-3.5 rounded-xl bg-[#141417] border border-[#414146] text-xs text-[#EDEDF0] placeholder-[#71717A] outline-none w-full sm:w-64"
          />
        </div>

        {/* DISPUTES LIST */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#A1A1AA]">Loading escrow dispute records...</div>
        ) : filteredDisputes.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#27272A]/40 border border-[#414146]/50 text-center">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Zero Active Disputes</h3>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-md mx-auto">
              You currently have no contested transactions. All purchases in your vault are securely protected by the 72-hour escrow inspection period.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDisputes.map((dispute) => {
              const isOpen = dispute.status === "open" || dispute.status === "under_review";
              return (
                <div
                  key={dispute.id}
                  className="p-5 rounded-2xl bg-[#27272A]/70 border border-[#414146]/60 backdrop-blur-xl hover:border-[#EF4444]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] uppercase">
                        {dispute.status.replace("_", " ")}
                      </span>
                      <span className="text-xs font-mono text-[#A1A1AA]">{dispute.order_number}</span>
                      <span className="text-xs text-[#71717A]">•</span>
                      <span className="text-xs text-[#A1A1AA]">
                        Opened {new Date(dispute.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white">{dispute.product_title}</h3>
                    <p className="text-xs text-[#D4D4D8] line-clamp-2 max-w-2xl bg-[#141417]/60 p-2.5 rounded-lg border border-[#414146]/40 font-mono">
                      {dispute.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <button
                      onClick={() => handleOpenThread(dispute)}
                      className="px-4 py-2 rounded-xl bg-[#141417] hover:bg-[#8535FC] text-white border border-[#414146] hover:border-[#8535FC] text-xs font-semibold transition-all flex items-center gap-2 shadow-md"
                    >
                      <svg className="w-4 h-4 text-[#8535FC] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>View Evidence & Messages</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* DISPUTE THREAD MODAL */}
      {activeDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#27272A] border border-[#414146] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#414146]/60 flex items-center justify-between bg-[#1D1D21]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444]">
                    FROZEN IN ESCROW
                  </span>
                  <span className="text-xs font-mono text-[#A1A1AA]">{activeDispute.order_number}</span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white mt-1">
                  {activeDispute.product_title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDispute(null)}
                className="text-[#A1A1AA] hover:text-white text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#141417]/50">
              {loadingMessages ? (
                <div className="py-8 text-center text-xs text-[#A1A1AA]">Loading message history...</div>
              ) : (
                threadMessages.map((msg) => {
                  const isSystem = msg.sender_id.includes("arbiter") || msg.sender_id.includes("system");
                  return (
                    <div
                      key={msg.id}
                      className={`p-3 sm:p-4 rounded-xl text-xs ${
                        isSystem
                          ? "bg-[#8535FC]/10 border border-[#8535FC]/30 text-[#EDEDF0]"
                          : "bg-[#27272A] border border-[#414146] text-[#EDEDF0]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-[#A1A1AA]">
                        <span className="font-semibold text-white">
                          {isSystem ? "🛡️ KodeDock Security Arbiter" : "👤 You (Buyer)"}
                        </span>
                        <span>{new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <div className="p-4 border-t border-[#414146]/60 bg-[#1D1D21] flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your response or technical clarification..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 h-10 px-3.5 rounded-xl bg-[#141417] border border-[#414146] focus:border-[#8535FC] text-xs text-white outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSendingMessage || !newMessageText.trim()}
                className="px-4 h-10 rounded-xl bg-[#8535FC] hover:bg-[#7822FA] text-white text-xs font-semibold shadow-md shadow-[#8535FC]/30 disabled:opacity-50 transition-all"
              >
                {isSendingMessage ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PlatformFooter />
    </div>
  );
}
