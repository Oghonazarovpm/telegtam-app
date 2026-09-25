import React, { useState, useRef, useEffect } from 'react';
import { Lang, Message, Theme } from '../types';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  Clock,
  X,
  FileText,
  Image as ImageIcon,
  Shield,
  Square,
} from 'lucide-react';

interface Props {
  onSendMessage: (text: string, options?: { replyTo?: Message; selfDestructIn?: number; mediaType?: 'voice' | 'file' | 'image' }) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  autoDeleteDefault: number;
  lang: Lang;
  theme: Theme;
}

const EMOJIS = ['🛡️', '🔑', '🔒', '⚡', '🚀', '👍', '🔥', '✨', '👀', '🤝', '💯', '🦾', '🎯', '💡', '✅'];

export const MessageInput: React.FC<Props> = ({
  onSendMessage,
  replyingTo,
  onCancelReply,
  autoDeleteDefault,
  lang,
  theme,
}) => {
  const isRu = lang === 'ru';
  const isDark = theme === 'dark';
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [ephemeralTime, setEphemeralTime] = useState<number>(autoDeleteDefault);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEphemeralTime(autoDeleteDefault);
  }, [autoDeleteDefault]);

  // Voice recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setRecordDuration(0);
      interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSend = () => {
    if (!text.trim() && !isRecording) return;

    if (isRecording) {
      // Send simulated encrypted voice note
      onSendMessage('', {
        replyTo: replyingTo || undefined,
        selfDestructIn: ephemeralTime > 0 ? ephemeralTime : undefined,
        mediaType: 'voice',
      });
      setIsRecording(false);
      return;
    }

    onSendMessage(text.trim(), {
      replyTo: replyingTo || undefined,
      selfDestructIn: ephemeralTime > 0 ? ephemeralTime : undefined,
    });

    setText('');
    setShowEmoji(false);
    if (replyingTo) onCancelReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const handleSendAttachment = (type: 'file' | 'image') => {
    setShowAttachMenu(false);
    const mockText =
      type === 'file'
        ? (isRu ? '📎 security_audit_report_2026.pdf (Зашифровано)' : '📎 security_audit_report_2026.pdf (Encrypted)')
        : (isRu ? '🖼️ architecture_diagram_v2.png (Зашифровано)' : '🖼️ architecture_diagram_v2.png (Encrypted)');

    onSendMessage(mockText, {
      replyTo: replyingTo || undefined,
      selfDestructIn: ephemeralTime > 0 ? ephemeralTime : undefined,
      mediaType: type,
    });
  };

  return (
    <div className={`p-3 border-t relative z-20 transition-colors ${
      isDark ? 'bg-[#111922] border-[#242f3d]' : 'bg-white border-slate-200'
    }`}>
      {/* Reply Banner */}
      {replyingTo && (
        <div className={`mb-2 px-3 py-1.5 border rounded-xl flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-150 ${
          isDark ? 'bg-[#17212b] border-[#242f3d]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1 h-6 rounded-full bg-[#2AABEE]" />
            <div className="min-w-0">
              <span className="font-semibold text-[#2AABEE] block truncate">
                {isRu ? 'Ответ на сообщение:' : 'Replying to:'} {replyingTo.senderName}
              </span>
              <span className={`block truncate text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {replyingTo.text}
              </span>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
            title={isRu ? 'Отменить ответ' : 'Cancel reply'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div className={`absolute bottom-16 left-12 p-3 border rounded-2xl shadow-2xl grid grid-cols-5 gap-2 text-xl z-30 animate-in fade-in zoom-in-95 duration-100 ${
          isDark ? 'bg-[#17212b] border-[#242f3d]' : 'bg-white border-slate-200'
        }`}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className={`p-1.5 rounded-lg transition-transform hover:scale-125 ${
                isDark ? 'hover:bg-[#242f3d]' : 'hover:bg-slate-100'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Popover */}
      {showAttachMenu && (
        <div className={`absolute bottom-16 left-3 w-52 border rounded-xl shadow-2xl py-1 text-xs z-30 animate-in fade-in zoom-in-95 duration-100 ${
          isDark ? 'bg-[#17212b] border-[#242f3d] text-slate-200' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <button
            type="button"
            onClick={() => handleSendAttachment('file')}
            className={`w-full px-3 py-2 text-left flex items-center gap-2.5 ${
              isDark ? 'hover:bg-[#242f3d]' : 'hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-[#2AABEE]" />
            <span>{isRu ? 'Зашифрованный файл' : 'Encrypted Document'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendAttachment('image')}
            className={`w-full px-3 py-2 text-left flex items-center gap-2.5 ${
              isDark ? 'hover:bg-[#242f3d]' : 'hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            <span>{isRu ? 'Безопасное фото' : 'Secure Image'}</span>
          </button>
        </div>
      )}

      {/* Main Input Row */}
      <div className="flex items-center gap-2">
        {/* Attachment menu button */}
        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={`p-2 rounded-xl transition-colors shrink-0 ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#242f3d]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={isRu ? 'Прикрепить зашифрованное вложение' : 'Attach encrypted file'}
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input Box or Recording Mode */}
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-3 py-2 bg-red-950/30 border border-red-500/40 rounded-xl text-xs text-red-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono font-medium">
                {isRu ? 'Запись E2EE аудио:' : 'Recording E2EE Audio:'} 0:
                {recordDuration.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecording(false)}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                {isRu ? 'Отмена' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="px-3 py-1 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
              >
                {isRu ? 'Отправить' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          <div className={`flex-1 relative flex items-center border focus-within:border-[#2AABEE] rounded-xl transition-colors ${
            isDark ? 'bg-[#17212b] border-[#242f3d]' : 'bg-slate-50 border-slate-200'
          }`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRu ? 'Зашифрованное сообщение...' : 'End-to-end encrypted message...'}
              className={`w-full pl-3 pr-10 py-2.5 bg-transparent text-xs outline-none resize-none max-h-32 ${
                isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'
              }`}
            />

            {/* Emoji toggle */}
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              aria-label="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Ephemeral Timer Selector Button */}
        {!isRecording && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const cycles = [0, 30, 300, 3600, 86400];
                const nextIdx = (cycles.indexOf(ephemeralTime) + 1) % cycles.length;
                setEphemeralTime(cycles[nextIdx]);
              }}
              className={`p-2 rounded-xl transition-colors border ${
                ephemeralTime > 0
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-[#242f3d]'
              }`}
              title={
                ephemeralTime > 0
                  ? `${isRu ? 'Самоуничтожение:' : 'Self-destruct:'} ${
                      ephemeralTime === 30 ? '30s' : ephemeralTime === 300 ? '5m' : ephemeralTime === 3600 ? '1h' : '24h'
                    }`
                  : isRu ? 'Таймер автоудаления: выкл' : 'Self-destruct: off'
              }
              aria-label="Toggle self-destruct timer"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Voice or Send Button */}
        {!isRecording && text.trim().length === 0 ? (
          <button
            type="button"
            onClick={() => setIsRecording(true)}
            className="p-2.5 rounded-xl bg-[#242f3d] text-slate-300 hover:text-white hover:bg-[#2c394b] transition-colors shrink-0"
            title={isRu ? 'Записать голосовое сообщение' : 'Record voice note'}
            aria-label="Record voice note"
          >
            <Mic className="w-4 h-4" />
          </button>
        ) : (
          !isRecording && (
            <button
              type="button"
              onClick={handleSend}
              className="p-2.5 rounded-xl bg-[#2AABEE] text-white hover:bg-[#2297d2] transition-colors shadow-sm shrink-0"
              title={isRu ? 'Отправить' : 'Send'}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )
        )}
      </div>
    </div>
  );
};
