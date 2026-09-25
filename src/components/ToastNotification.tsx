import React, { useEffect } from 'react';
import { Lang } from '../types';
import { Bell, Lock, X } from 'lucide-react';

export interface ToastData {
  id: string;
  chatId: string;
  chatTitle: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  isEncrypted: boolean;
  showPreview: boolean;
}

interface Props {
  toast: ToastData | null;
  onDismiss: () => void;
  onSelectChat: (chatId: string) => void;
  lang: Lang;
}

export const ToastNotification: React.FC<Props> = ({
  toast,
  onDismiss,
  onSelectChat,
  lang,
}) => {
  const isRu = lang === 'ru';

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <aside 
      className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200"
      aria-label={isRu ? 'Уведомление' : 'Notification alert'}
    >
      <div 
        onClick={() => {
          onSelectChat(toast.chatId);
          onDismiss();
        }}
        className="cursor-pointer bg-[#17212b] border border-[#242f3d] hover:border-[#2AABEE]/60 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 backdrop-blur-md text-slate-100 group transition-all"
      >
        <div className="relative shrink-0">
          <img
            src={toast.senderAvatar}
            alt={toast.senderName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#2AABEE]/40"
          />
          {toast.isEncrypted && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {toast.senderName}
            </span>
            <span className="text-[10px] text-[#2AABEE] font-medium truncate">
              {toast.chatTitle}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            {toast.showPreview
              ? toast.text
              : (isRu ? '🔒 Новое зашифрованное сообщение' : '🔒 New encrypted message')}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-[#242f3d]"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
