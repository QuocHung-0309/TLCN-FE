"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Info, HelpCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

const CONFIG = {
  danger: {
    icon: Trash2,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    ring: "ring-rose-100",
    confirmBtn: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/25",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    ring: "ring-amber-100",
    confirmBtn: "bg-amber-500 hover:bg-amber-600 shadow-amber-400/25",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    ring: "ring-blue-100",
    confirmBtn: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25",
  },
} as const;

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmDialogProps) {
  const cfg = CONFIG[type] ?? CONFIG.warning;
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-[2px]"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl bg-white shadow-2xl shadow-slate-900/15 border border-slate-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-start gap-4 p-6 pb-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg} ring-1 ${cfg.ring}`}>
                  <Icon size={20} className={cfg.iconColor} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{message}</p>
                </div>
                <button
                  onClick={onCancel}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 px-6 pb-6 pt-2">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${cfg.confirmBtn}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
