import React from 'react';
import { Chat, Lang, Theme, User } from '../types';
import {
  ShieldCheck,
  Bell,
  Clock,
  Key,
  Users,
  Lock,
  UserPlus,
  Shield,
  FileText,
  AlertCircle,
  Copy,
  CheckCircle,
} from 'lucide-react';

interface Props {
  chat: Chat;
  isOpen: boolean;
  onClose: () => void;
  onOpenSafetyNumbers: () => void;
  onOpenNotifications: () => void;
  onSetAutoDelete: (seconds: number) => void;
  onAddMember: () => void;
  lang: Lang;
  theme: Theme;
}

export const GroupInfoDrawer: React.FC<Props> = ({
  chat,
  isOpen,
  onClose,
  onOpenSafetyNumbers,
  onOpenNotifications,
  onSetAutoDelete,
  onAddMember,
  lang,
  theme,
}) => {
  const isRu = lang === 'ru';
  const isDark = theme === 'dark';
  if (!isOpen) return null;

  const enc = chat.encryptionDetails;
  const isMuted = chat.notificationSettings.mutedUntil !== null;

  const autoDeleteLabels: { [key: number]: { ru: string; en: string } } = {
    0: { ru: 'Отключено', en: 'Off' },
    30: { ru: '30 секунд', en: '30 sec' },
    300: { ru: '5 минут', en: '5 min' },
    3600: { ru: '1 час', en: '1 hour' },
    86400: { ru: '24 часа', en: '24 hours' },
    604800: { ru: '7 дней', en: '7 days' },
  };

  return (
    <aside 
      className={`w-80 md:w-96 border-l flex flex-col h-full shrink-0 z-30 transition-colors shadow-xl ${
        isDark ? 'bg-[#17212b] border-[#242f3d] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}
      aria-label={isRu ? 'Информация о чате' : 'Chat information'}
    >
      {/* Header */}
      <div className={`h-14 px-4 border-b flex items-center justify-between transition-colors ${
        isDark ? 'bg-[#111922] border-[#242f3d]' : 'bg-[#f8fafc] border-slate-200'
      }`}>
        <span className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {chat.type === 'group'
            ? (isRu ? 'Информация о группе' : 'Group Info')
            : (isRu ? 'Информация о контакте' : 'Chat Info')}
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#242f3d] transition-colors"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Profile Card */}
        <div className={`flex flex-col items-center text-center p-4 border rounded-2xl transition-colors ${
          isDark ? 'bg-[#111922] border-[#242f3d]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="relative">
            <img
              src={chat.avatar}
              alt={chat.title}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#2AABEE]/30"
            />
            {chat.isEncrypted && (
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-black shadow-md"
                title={isRu ? 'Сквозное шифрование активно' : 'E2EE Active'}
              >
                <Lock className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          <h3 className={`mt-3 text-base font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{chat.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {chat.type === 'group'
              ? `${chat.members.length} ${isRu ? 'участников' : 'participants'} · ${enc.algorithm}`
              : `${enc.algorithm} · ${isRu ? 'Секретная сессия' : 'Secret Session'}`}
          </p>

          {chat.description && (
            <p className={`text-xs mt-2.5 px-2 leading-relaxed p-2 rounded-lg border text-left w-full ${
              isDark ? 'bg-[#17212b] border-[#242f3d]/60 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              {chat.description}
            </p>
          )}
        </div>

        {/* E2EE Safety Verification Widget */}
        <div 
          onClick={onOpenSafetyNumbers}
          className={`p-3.5 border rounded-xl cursor-pointer transition-colors group ${
            isDark ? 'bg-[#111922] hover:bg-[#15202b] border-[#242f3d]' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#2AABEE] transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isRu ? 'Сквозное шифрование (E2EE)' : 'End-to-End Encryption'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {enc.isVerifiedByUser
                    ? (isRu ? 'Ключи верифицированы ✓' : 'Keys verified ✓')
                    : (isRu ? 'Нажмите для проверки хэшей' : 'Click to verify safety keys')}
                </div>
              </div>
            </div>
            <div className="text-lg tracking-widest">
              {enc.safetyEmojis.slice(0, 2).join('')}
            </div>
          </div>
        </div>

        {/* Custom Notifications Action */}
        <div 
          onClick={onOpenNotifications}
          className={`p-3.5 border rounded-xl cursor-pointer transition-colors flex items-center justify-between group ${
            isDark ? 'bg-[#111922] hover:bg-[#15202b] border-[#242f3d]' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMuted ? 'bg-amber-500/15 text-amber-500' : 'bg-[#2AABEE]/15 text-[#2AABEE]'}`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-semibold group-hover:text-[#2AABEE] transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isRu ? 'Уведомления и звук' : 'Notifications & Sound'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isMuted
                  ? (isRu ? 'Звук отключен' : 'Muted')
                  : `${isRu ? 'Звук:' : 'Tone:'} ${chat.notificationSettings.soundTone}`}
              </div>
            </div>
          </div>
          <span className="text-xs text-[#2AABEE] font-medium">
            {isRu ? 'Настроить' : 'Customize'}
          </span>
        </div>

        {/* Auto-Delete Messages Timer */}
        <div className={`p-3.5 border rounded-xl space-y-2 ${
          isDark ? 'bg-[#111922] border-[#242f3d]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <Clock className="w-4 h-4 text-[#2AABEE]" />
              <span>{isRu ? 'Автоудаление сообщений' : 'Auto-Delete Timer'}</span>
            </div>
            <span className="text-xs font-mono text-emerald-500 font-semibold">
              {autoDeleteLabels[chat.autoDeleteTime]?.[lang] || (isRu ? 'Отключено' : 'Off')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[0, 300, 86400].map((sec) => (
              <button
                key={sec}
                onClick={() => onSetAutoDelete(sec)}
                className={`py-1.5 px-2 text-[11px] rounded-lg font-medium transition-colors border ${
                  chat.autoDeleteTime === sec
                    ? 'bg-[#2AABEE] text-white border-[#2AABEE]'
                    : isDark
                    ? 'bg-[#17212b] border-[#242f3d] text-slate-300 hover:bg-[#242f3d]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {sec === 0
                  ? (isRu ? 'Откл' : 'Off')
                  : sec === 300
                  ? (isRu ? '5 мин' : '5m')
                  : (isRu ? '24 часа' : '24h')}
              </button>
            ))}
          </div>
        </div>

        {/* Member List for Group Chats */}
        {chat.type === 'group' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Users className="w-3.5 h-3.5 text-[#2AABEE]" />
                <span>{isRu ? 'Участники' : 'Members'} ({chat.members.length})</span>
              </div>
              <button
                onClick={onAddMember}
                className="flex items-center gap-1 text-[11px] text-[#2AABEE] hover:underline"
              >
                <UserPlus className="w-3 h-3" />
                <span>{isRu ? 'Добавить' : 'Add member'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {chat.members.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-2 rounded-xl border ${
                    isDark ? 'bg-[#111922] border-[#242f3d]/70' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold truncate flex items-center gap-1 ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        <span>{member.name}</span>
                        {member.isVerified && (
                          <span className="text-[10px] text-emerald-500 font-mono" title="Public Key Verified">✓</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {member.handle}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isDark ? 'text-slate-400 bg-[#17212b] border-[#242f3d]' : 'text-slate-600 bg-white border-slate-200'
                  }`}>
                    {member.id === 'user_me'
                      ? (isRu ? 'Вы' : 'You')
                      : member.status === 'online'
                      ? (isRu ? 'в сети' : 'online')
                      : (isRu ? 'был недавно' : 'offline')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
