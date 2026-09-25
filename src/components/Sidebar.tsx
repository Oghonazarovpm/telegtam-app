import React, { useState } from 'react';
import { Chat, Lang, Theme } from '../types';
import {
  Search,
  Lock,
  Shield,
  Pin,
  BellOff,
  Plus,
  Settings,
  Sun,
  Moon,
  Globe,
  Check,
  CheckCheck,
  X,
} from 'lucide-react';

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onOpenNewGroup: () => void;
  onOpenGlobalSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  lang: Lang;
  onToggleLang: () => void;
}

export const Sidebar: React.FC<Props> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenNewGroup,
  onOpenGlobalSettings,
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
}) => {
  const isRu = lang === 'ru';
  const [filterTab, setFilterTab] = useState<'all' | 'groups' | 'secret' | 'direct'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredChats = chats.filter((c) => {
    if (filterTab === 'groups' && c.type !== 'group') return false;
    if (filterTab === 'secret' && c.type !== 'secret') return false;
    if (filterTab === 'direct' && c.type !== 'direct') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchLastMsg = c.lastMessage?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLastMsg;
    }
    return true;
  });

  // Calculate unread counts
  const unreadTotal = chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadGroups = chats
    .filter((c) => c.type === 'group')
    .reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadSecret = chats
    .filter((c) => c.type === 'secret')
    .reduce((acc, c) => acc + c.unreadCount, 0);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isDark = theme === 'dark';

  return (
    <aside 
      className={`w-full md:w-80 lg:w-96 flex flex-col h-full border-r select-none shrink-0 transition-colors ${
        isDark ? 'bg-[#111922] border-[#242f3d] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}
      aria-label={isRu ? 'Список чатов' : 'Chats list'}
    >
      {/* Top Header / App Brand & Quick Controls */}
      <div className={`p-3.5 border-b flex items-center justify-between transition-colors ${
        isDark ? 'bg-[#0e1620] border-[#242f3d]' : 'bg-[#f8fafc] border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2AABEE] to-[#10b981] flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              <span>TeleShield</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                E2EE
              </span>
            </h1>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-[#242f3d]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={isDark ? (isRu ? 'Светлая тема' : 'Light theme') : (isRu ? 'Темная тема' : 'Dark theme')}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onToggleLang}
            className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-[#242f3d]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={isRu ? 'Переключить на English' : 'Switch to Russian'}
          >
            {isRu ? 'RU' : 'EN'}
          </button>

          <button
            onClick={onOpenGlobalSettings}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-[#242f3d]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={isRu ? 'Настройки уведомлений' : 'Notification Settings'}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewGroup}
            className="p-1.5 rounded-lg bg-[#2AABEE] text-white hover:bg-[#2297d2] transition-colors ml-1 shadow-sm"
            title={isRu ? 'Создать зашифрованную группу' : 'New Encrypted Group'}
            aria-label="Create group"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className={`p-2.5 transition-colors ${isDark ? 'bg-[#0e1620]' : 'bg-[#f8fafc]'}`}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRu ? 'Поиск чатов и сообщений...' : 'Search chats & messages...'}
            className={`w-full pl-9 pr-8 py-2 border rounded-xl text-xs outline-none focus:border-[#2AABEE] transition-colors ${
              isDark
                ? 'bg-[#17212b] border-[#242f3d] text-slate-200 placeholder:text-slate-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs / Segmented Controls */}
      <div className={`px-2 pb-2 flex gap-1 border-b overflow-x-auto text-[11px] font-medium transition-colors ${
        isDark ? 'bg-[#0e1620] border-[#242f3d]' : 'bg-[#f8fafc] border-slate-200'
      }`}>
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filterTab === 'all'
              ? isDark ? 'bg-[#242f3d] text-white font-semibold' : 'bg-slate-200 text-slate-900 font-semibold'
              : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-[#17212b]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{isRu ? 'Все' : 'All'}</span>
          {unreadTotal > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#2AABEE] text-[10px] text-white font-mono">
              {unreadTotal}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('groups')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filterTab === 'groups'
              ? isDark ? 'bg-[#242f3d] text-white font-semibold' : 'bg-slate-200 text-slate-900 font-semibold'
              : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-[#17212b]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>{isRu ? 'Группы' : 'Groups'}</span>
          {unreadGroups > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#2AABEE] text-[10px] text-white font-mono">
              {unreadGroups}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('secret')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filterTab === 'secret'
              ? isDark ? 'bg-[#242f3d] text-white font-semibold' : 'bg-slate-200 text-slate-900 font-semibold'
              : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-[#17212b]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3 h-3 text-[#2AABEE]" />
          <span>{isRu ? 'Секретные' : 'Secret'}</span>
          {unreadSecret > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#2AABEE] text-[10px] text-white font-mono">
              {unreadSecret}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('direct')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            filterTab === 'direct'
              ? isDark ? 'bg-[#242f3d] text-white font-semibold' : 'bg-slate-200 text-slate-900 font-semibold'
              : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-[#17212b]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{isRu ? 'Личные' : 'Direct'}</span>
        </button>
      </div>

      {/* Chat List */}
      <div className={`flex-1 overflow-y-auto p-1.5 space-y-1 transition-colors ${isDark ? 'bg-[#111922]' : 'bg-white'}`}>
        {filteredChats.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-xs text-slate-400">
              {isRu ? 'Ничего не найдено' : 'No chats found'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isMuted = chat.notificationSettings.mutedUntil !== null;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors relative ${
                  isActive
                    ? 'bg-[#2AABEE] text-white shadow-xs'
                    : isDark
                    ? 'hover:bg-[#17212b] text-slate-200'
                    : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                {/* Avatar with lock and online indicators */}
                <div className="relative shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.isEncrypted && (
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                        isActive
                          ? 'border-[#2AABEE] bg-emerald-400'
                          : isDark
                          ? 'border-[#111922] bg-emerald-500'
                          : 'border-white bg-emerald-500'
                      }`}
                      title="E2EE Protected"
                    >
                      <Lock className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </div>

                {/* Chat text details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-semibold truncate leading-tight">
                        {chat.title}
                      </span>
                      {chat.encryptionDetails.isVerifiedByUser && (
                        <span className={`text-[10px] ${isActive ? 'text-white' : 'text-emerald-500'}`} title="Keys Verified">
                          ✓
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-mono tabular-nums shrink-0 ${
                        isActive ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs truncate ${
                        chat.isTyping
                          ? isActive
                            ? 'text-white font-medium italic'
                            : 'text-[#2AABEE] font-medium italic'
                          : isActive
                          ? 'text-white/90'
                          : isDark
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {chat.isTyping ? (
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          <span>{chat.isTyping} {isRu ? 'печатает...' : 'is typing...'}</span>
                        </span>
                      ) : (
                        chat.lastMessage || (isRu ? 'Нет сообщений' : 'No messages')
                      )}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isMuted && (
                        <BellOff
                          className={`w-3.5 h-3.5 ${
                            isActive ? 'text-white/70' : 'text-slate-400'
                          }`}
                        />
                      )}
                      {chat.isPinned && (
                        <Pin
                          className={`w-3.5 h-3.5 ${
                            isActive ? 'text-white/70' : 'text-slate-400'
                          }`}
                        />
                      )}
                      {chat.unreadCount > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-tight ${
                            isActive
                              ? 'bg-white text-[#2AABEE]'
                              : isMuted
                              ? 'bg-slate-400 text-white'
                              : 'bg-[#2AABEE] text-white'
                          }`}
                        >
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Status Ribbon */}
      <div className={`p-2.5 border-t flex items-center justify-between text-xs transition-colors ${
        isDark ? 'bg-[#0e1620] border-[#242f3d] text-slate-400' : 'bg-[#f8fafc] border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">
            ECDH-Curve25519
          </span>
        </div>
        <button
          onClick={onOpenNewGroup}
          className="text-[11px] text-[#2AABEE] hover:underline font-semibold"
        >
          + {isRu ? 'Новый чат' : 'New Chat'}
        </button>
      </div>
    </aside>
  );
};
