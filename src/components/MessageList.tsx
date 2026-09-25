import React, { useState } from 'react';
import { Chat, Lang, Message, Theme } from '../types';
import {
  Lock,
  Check,
  CheckCheck,
  Pin,
  Clock,
  Play,
  Pause,
  Reply,
  Copy,
  Trash2,
  Code,
  ShieldCheck,
  ChevronDown,
  X,
} from 'lucide-react';

interface Props {
  chat: Chat;
  messages: Message[];
  onReply: (message: Message) => void;
  onPinMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  lang: Lang;
  theme: Theme;
  searchQuery?: string;
  onCloseSearch?: () => void;
}

export const MessageList: React.FC<Props> = ({
  chat,
  messages,
  onReply,
  onPinMessage,
  onDeleteMessage,
  lang,
  theme,
  searchQuery,
  onCloseSearch,
}) => {
  const isRu = lang === 'ru';
  const isDark = theme === 'dark';
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [inspectCipherId, setInspectCipherId] = useState<string | null>(null);

  // Filter messages if search query is provided
  const visibleMessages = searchQuery?.trim()
    ? messages.filter((m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const pinnedMsg = messages.find((m) => m.id === chat.pinnedMessageId || m.isPinned);

  const toggleVoice = (msgId: string) => {
    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(msgId);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatMsgTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Pinned Message Bar */}
      {pinnedMsg && (
        <div className={`px-4 py-2 backdrop-blur-xs border-b flex items-center justify-between z-10 select-none transition-colors ${
          isDark ? 'bg-[#111922]/90 border-[#242f3d]' : 'bg-white/95 border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-1 h-7 rounded-full bg-[#2AABEE]" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[#2AABEE] flex items-center gap-1">
                <Pin className="w-3 h-3" />
                <span>{isRu ? 'Закрепленное сообщение' : 'Pinned Message'}</span>
                <span className={isDark ? 'text-slate-400 font-normal' : 'text-slate-500 font-normal'}>· {pinnedMsg.senderName}</span>
              </div>
              <div className={`text-xs truncate max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {pinnedMsg.text}
              </div>
            </div>
          </div>
          <button
            onClick={() => onPinMessage(pinnedMsg.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs"
            title={isRu ? 'Открепить' : 'Unpin'}
          >
            ✕
          </button>
        </div>
      )}

      {/* In-chat Search Bar */}
      {searchQuery !== undefined && (
        <div className={`px-4 py-2 border-b flex items-center justify-between text-xs z-10 transition-colors ${
          isDark ? 'bg-[#141d26] border-[#242f3d] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <div>
            {isRu ? 'Результатов поиска:' : 'Search results:'}{' '}
            <span className="font-semibold text-[#2AABEE]">{visibleMessages.length}</span>
          </div>
          {onCloseSearch && (
            <button
              onClick={onCloseSearch}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1 text-[11px]"
            >
              <span>{isRu ? 'Закрыть' : 'Close'}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 transition-colors ${
        isDark ? 'telegram-dark-bg' : 'telegram-light-bg'
      }`}>
        {visibleMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className={`p-5 rounded-2xl border text-center max-w-sm ${
              isDark ? 'bg-[#17212b]/80 border-[#242f3d]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <Lock className="w-8 h-8 text-[#2AABEE] mx-auto mb-2 opacity-80" />
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isRu ? 'Сообщений пока нет' : 'No messages yet'}
              </div>
              <div className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isRu
                  ? 'Все отправляемые сообщения шифруются ключами AES-256 / Curve25519 перед отправкой.'
                  : 'All messages sent here are mathematically encrypted using client-side cryptographic keys.'}
              </div>
            </div>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            // System message
            if (msg.senderId === 'system' || msg.systemAlert) {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <div className={`px-3.5 py-1.5 rounded-full border text-[11px] flex items-center gap-2 shadow-xs text-center max-w-md ${
                    isDark ? 'bg-[#17212b]/90 border-[#242f3d] text-slate-300' : 'bg-white/90 border-slate-300 text-slate-700'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isOutgoing = msg.isOutgoing;

            return (
              <div
                key={msg.id}
                className={`flex flex-col group ${isOutgoing ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                  {/* Sender avatar for incoming messages in group */}
                  {!isOutgoing && chat.type === 'group' && (
                    <img
                      src={msg.senderAvatar || chat.avatar}
                      alt={msg.senderName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                    />
                  )}

                  {/* Message Bubble Container */}
                  <div
                    className={`relative rounded-2xl px-3.5 py-2.5 shadow-xs text-xs leading-relaxed transition-all ${
                      isOutgoing
                        ? isDark
                          ? 'bg-[#2b5278] text-slate-100 rounded-br-xs border border-[#35618b]'
                          : 'bg-[#eff6ff] text-slate-900 rounded-br-xs border border-[#bfdbfe]'
                        : isDark
                        ? 'bg-[#182533] text-slate-100 rounded-bl-xs border border-[#243447]'
                        : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200'
                    }`}
                  >
                    {/* Group sender name */}
                    {!isOutgoing && chat.type === 'group' && (
                      <div className="text-[11px] font-semibold text-[#2AABEE] mb-1 flex items-center gap-1.5">
                        <span>{msg.senderName}</span>
                      </div>
                    )}

                    {/* Quoted message preview */}
                    {msg.replyTo && (
                      <div className={`mb-2 p-2 rounded-lg border-l-2 border-[#2AABEE] text-[11px] ${
                        isDark ? 'bg-black/20 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <div className="font-semibold text-[#2AABEE]">
                          {msg.replyTo.senderName}
                        </div>
                        <div className="truncate">{msg.replyTo.text}</div>
                      </div>
                    )}

                    {/* Voice note component */}
                    {msg.media?.type === 'voice' && (
                      <div className="flex items-center gap-3 py-1 min-w-[200px]">
                        <button
                          type="button"
                          onClick={() => toggleVoice(msg.id)}
                          className="w-9 h-9 rounded-full bg-[#2AABEE] text-white flex items-center justify-center hover:bg-[#2297d2] transition-colors shrink-0"
                          aria-label="Play voice note"
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1">
                          {/* Animated / static waveform bars */}
                          <div className="flex items-center gap-0.5 h-6">
                            {(msg.media.waveData || [30, 45, 70, 85, 60, 40, 90, 75, 50, 65, 80, 55, 35, 45, 60, 30]).map(
                              (height, idx) => (
                                <div
                                  key={idx}
                                  style={{ height: `${height}%` }}
                                  className={`w-1 rounded-full transition-all ${
                                    playingVoiceId === msg.id
                                      ? 'bg-[#2AABEE] animate-pulse'
                                      : 'bg-slate-400/60'
                                  }`}
                                />
                              )
                            )}
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>0:{msg.media.duration?.toString().padStart(2, '0') || '14'}</span>
                            <span className="text-emerald-400">E2EE Voice</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text content */}
                    {msg.text && (
                      <p className="whitespace-pre-wrap break-words select-text">
                        {msg.text}
                      </p>
                    )}

                    {/* Ephemeral self-destruct timer indicator */}
                    {msg.selfDestructIn && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-amber-300/80">
                        <Clock className="w-2.5 h-2.5 animate-spin" />
                        <span>
                          {isRu ? 'Самоуничтожение:' : 'Self-destruct:'} {msg.selfDestructIn}s
                        </span>
                      </div>
                    )}

                    {/* Bubble Footer: Time + E2EE Lock + Status ticks */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300 select-none">
                      {msg.isEncrypted && (
                        <button
                          type="button"
                          onClick={() =>
                            setInspectCipherId(
                              inspectCipherId === msg.id ? null : msg.id
                            )
                          }
                          className="hover:text-emerald-400 transition-colors p-0.5"
                          title={isRu ? 'Посмотреть зашифрованный payload (Ciphertext)' : 'Inspect Ciphertext Payload'}
                        >
                          <Lock className="w-2.5 h-2.5 text-emerald-400" />
                        </button>
                      )}

                      <span className="tabular-nums font-mono opacity-80">
                        {formatMsgTime(msg.timestamp)}
                      </span>

                      {isOutgoing && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#2AABEE]" />
                          ) : msg.status === 'sent' ? (
                            <Check className="w-3 h-3 text-slate-400" />
                          ) : (
                            <Clock className="w-2.5 h-2.5 text-slate-400 animate-spin" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Ciphertext inspector drop-down */}
                    {inspectCipherId === msg.id && (
                      <div className="mt-2 p-2.5 bg-[#0e1620] border border-[#242f3d] rounded-xl text-[10px] font-mono text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-[#2AABEE] font-semibold">
                          <span>Payload E2EE (AES-256-GCM)</span>
                          <button
                            onClick={() => setInspectCipherId(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="text-slate-400">
                          IV (96-bit):{' '}
                          <span className="text-slate-200">
                            {msg.encryptedPayload?.ivHex || '4a1b920c78e1fd89012a4c'}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          Auth Tag (128-bit):{' '}
                          <span className="text-emerald-400">
                            {msg.encryptedPayload?.tagHex || '9182736450abcdef89102938'}
                          </span>
                        </div>
                        <div className="text-slate-400 break-all">
                          Ciphertext:{' '}
                          <span className="text-slate-200">
                            {msg.encryptedPayload?.ciphertextHex ||
                              '89a4bc12ef88019a3b72c91823746a5b281940fe102938'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Context quick action buttons on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#111922] border border-[#242f3d] p-1 rounded-xl shadow-md">
                    <button
                      onClick={() => onReply(msg)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded"
                      title={isRu ? 'Ответить' : 'Reply'}
                    >
                      <Reply className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => copyText(msg.text)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded"
                      title={isRu ? 'Скопировать' : 'Copy'}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onPinMessage(msg.id)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded"
                      title={isRu ? 'Закрепить' : 'Pin'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#242f3d] rounded"
                      title={isRu ? 'Удалить' : 'Delete'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
