import React, { useState } from 'react';
import { Chat, Lang, Theme } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Bell,
  BellOff,
  Search,
  MoreVertical,
  Clock,
  Key,
  Users,
  Lock,
  ChevronLeft,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface Props {
  chat: Chat;
  onOpenSafetyNumbers: () => void;
  onOpenNotifications: () => void;
  onToggleInfoDrawer: () => void;
  onBackMobile?: () => void;
  onRotateKey: (chatId: string) => void;
  onClearChat: (chatId: string) => void;
  onToggleSearch: () => void;
  isSearchActive: boolean;
  lang: Lang;
  theme: Theme;
}

export const ChatHeader: React.FC<Props> = ({
  chat,
  onOpenSafetyNumbers,
  onOpenNotifications,
  onToggleInfoDrawer,
  onBackMobile,
  onRotateKey,
  onClearChat,
  onToggleSearch,
  isSearchActive,
  lang,
  theme,
}) => {
  const isRu = lang === 'ru';
  const isDark = theme === 'dark';
  const [menuOpen, setMenuOpen] = useState(false);
  const isMuted = chat.notificationSettings.mutedUntil !== null;
  const isVerified = chat.encryptionDetails.isVerifiedByUser;

  const autoDeleteLabels: { [key: number]: string } = {
    0: '',
    30: '30s',
    300: '5m',
    3600: '1h',
    86400: '24h',
    604800: '7d',
  };

  return (
    <header className={`h-16 px-4 border-b flex items-center justify-between z-20 shrink-0 select-none transition-colors ${
      isDark ? 'bg-[#111922] border-[#242f3d] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Left: Mobile back + Avatar + Title & Status */}
      <div className="flex items-center gap-3 min-w-0">
        {onBackMobile && (
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={onToggleInfoDrawer}
          className="relative cursor-pointer shrink-0 group"
          title={isRu ? 'Открыть информацию о чате' : 'Open chat info'}
        >
          <img
            src={chat.avatar}
            alt={chat.title}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover group-hover:opacity-90 transition-opacity"
          />
          {chat.isEncrypted && (
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border flex items-center justify-center ${
              isDark ? 'border-[#111922]' : 'border-white'
            }`}>
              <Lock className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        <div
          onClick={onToggleInfoDrawer}
          className="cursor-pointer min-w-0"
          title={isRu ? 'Открыть профиль' : 'Open profile'}
        >
          <div className="flex items-center gap-1.5">
            <h2 className={`text-sm font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {chat.title}
            </h2>
            {isVerified && (
              <span 
                className="text-xs text-emerald-500 font-bold"
                title={isRu ? 'Ключи безопасности проверены' : 'Safety numbers verified'}
              >
                ✓
              </span>
            )}
            {chat.autoDeleteTime > 0 && (
              <span
                className="flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30"
                title={isRu ? 'Таймер автоудаления активен' : 'Auto-delete timer active'}
              >
                <Clock className="w-2.5 h-2.5" />
                <span>{autoDeleteLabels[chat.autoDeleteTime]}</span>
              </span>
            )}
          </div>

          <div className="text-xs truncate flex items-center gap-1.5">
            {chat.isTyping ? (
              <span className="text-[#2AABEE] font-medium animate-pulse">
                {chat.isTyping} {isRu ? 'печатает...' : 'is typing...'}
              </span>
            ) : chat.type === 'group' ? (
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                {chat.members.length} {isRu ? 'участников' : 'members'} ·{' '}
                <span className="text-emerald-500 font-mono text-[11px]">E2EE {chat.encryptionDetails.algorithm}</span>
              </span>
            ) : (
              <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>{isRu ? 'в сети' : 'online'} · E2EE</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Safety Fingerprint Button */}
        <button
          onClick={onOpenSafetyNumbers}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isVerified
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
              : isDark
              ? 'bg-[#242f3d] text-slate-300 border-transparent hover:text-white hover:bg-[#2c394b]'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={isRu ? 'Проверить ключи E2EE' : 'Verify E2EE Safety Keys'}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isVerified ? (isRu ? 'Защищено' : 'Verified') : (isRu ? 'Ключи' : 'Keys')}
          </span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className={`p-2 rounded-lg transition-colors ${
            isMuted
              ? 'text-amber-500 hover:bg-amber-500/10'
              : isDark
              ? 'text-slate-300 hover:text-white hover:bg-[#242f3d]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={
            isMuted
              ? isRu
                ? 'Уведомления отключены (Настроить)'
                : 'Muted (Customize)'
              : isRu
              ? 'Уведомления активны (Настроить)'
              : 'Alerts active (Customize)'
          }
          aria-label="Notification settings"
        >
          {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        </button>

        {/* In-chat search toggle */}
        <button
          onClick={onToggleSearch}
          className={`p-2 rounded-lg transition-colors ${
            isSearchActive
              ? 'bg-[#2AABEE] text-white'
              : isDark
              ? 'text-slate-300 hover:text-white hover:bg-[#242f3d]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={isRu ? 'Поиск в переписке' : 'Search messages'}
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* More options menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-[#242f3d]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-xl py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100 ${
              isDark ? 'bg-[#17212b] border-[#242f3d] text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onToggleInfoDrawer();
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                  isDark ? 'hover:bg-[#242f3d]' : 'hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRu ? 'Данные чата' : 'Chat Info'}</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSafetyNumbers();
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                  isDark ? 'hover:bg-[#242f3d]' : 'hover:bg-slate-100'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRu ? 'Отпечаток ключа' : 'Key Fingerprint'}</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRotateKey(chat.id);
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                  isDark ? 'hover:bg-[#242f3d]' : 'hover:bg-slate-100'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#2AABEE]" />
                <span>{isRu ? 'Ротация ключа (Ratchet)' : 'Rotate Ratchet Key'}</span>
              </button>

              <div className={`my-1 border-t ${isDark ? 'border-[#242f3d]' : 'border-slate-200'}`} />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onClearChat(chat.id);
                }}
                className={`w-full px-3 py-2 text-left text-red-500 flex items-center gap-2 ${
                  isDark ? 'hover:bg-[#242f3d]' : 'hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRu ? 'Очистить историю' : 'Clear History'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
