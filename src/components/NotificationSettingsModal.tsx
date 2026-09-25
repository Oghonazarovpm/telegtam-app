import React, { useState } from 'react';
import { Chat, ChatNotificationSettings, GlobalNotificationSettings, Lang, NotificationSound } from '../types';
import { playNotificationSound } from '../utils/audio';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Play,
  Check,
  Shield,
  Smartphone,
  Eye,
  AtSign,
  Sliders,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeChat?: Chat;
  globalSettings: GlobalNotificationSettings;
  onUpdateGlobal: (settings: GlobalNotificationSettings) => void;
  onUpdateChatSettings: (chatId: string, settings: ChatNotificationSettings) => void;
  lang: Lang;
}

const SOUNDS: { id: NotificationSound; nameRu: string; nameEn: string; descRu: string; descEn: string }[] = [
  { id: 'classic', nameRu: 'Telegram Classic', nameEn: 'Telegram Classic', descRu: 'Классический двухтональный звон', descEn: 'Iconic soft dual chime' },
  { id: 'aurora', nameRu: 'Aurora Chime', nameEn: 'Aurora Chime', descRu: 'Гармоничный кристальный аккорд', descEn: 'Harmonic crystal chords' },
  { id: 'chime', nameRu: 'Silver Bell', nameEn: 'Silver Bell', descRu: 'Яркий деликатный колокольчик', descEn: 'Bright subtle glass ping' },
  { id: 'woodblock', nameRu: 'Acoustic Click', nameEn: 'Acoustic Click', descRu: 'Короткий тихий перкуссионный щелчок', descEn: 'Organic subdued percussion click' },
  { id: 'cyber', nameRu: 'Cyber Minimal', nameEn: 'Cyber Minimal', descRu: 'Лаконичный технологичный импульс', descEn: 'Minimal tech frequency impulse' },
  { id: 'silent', nameRu: 'Без звука', nameEn: 'Silent', descRu: 'Только визуальный алерт без звука', descEn: 'Silent visual notification only' },
];

export const NotificationSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeChat,
  globalSettings,
  onUpdateGlobal,
  onUpdateChatSettings,
  lang,
}) => {
  const isRu = lang === 'ru';
  const [tab, setTab] = useState<'chat' | 'global'>(activeChat ? 'chat' : 'global');

  if (!isOpen) return null;

  // Local chat settings copy
  const chatSettings = activeChat ? activeChat.notificationSettings : null;

  const handleTestSound = (sound: NotificationSound) => {
    playNotificationSound(sound, globalSettings.soundVolume);
  };

  const handleMutePreset = (hours: number | null) => {
    if (!activeChat || !chatSettings) return;
    let mutedUntil: number | null = null;
    if (hours === -1) {
      mutedUntil = -1; // Forever
    } else if (hours !== null) {
      mutedUntil = Date.now() + hours * 3600 * 1000;
    }
    onUpdateChatSettings(activeChat.id, {
      ...chatSettings,
      enabled: hours === null,
      mutedUntil,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#17212b] border border-[#242f3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242f3d] flex items-center justify-between bg-[#111922]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2AABEE]/15 flex items-center justify-center text-[#2AABEE]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                {isRu ? 'Настройки уведомлений' : 'Notification Settings'}
              </h2>
              <div className="text-xs text-slate-400">
                {activeChat ? activeChat.title : (isRu ? 'Глобальные параметры' : 'Global system settings')}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#242f3d] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 pb-2 flex gap-1 bg-[#141d26] border-b border-[#242f3d]/60">
          {activeChat && (
            <button
              onClick={() => setTab('chat')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                tab === 'chat'
                  ? 'bg-[#2AABEE] text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#242f3d]'
              }`}
            >
              <span>{isRu ? 'Для этого чата' : 'Current Chat'}</span>
            </button>
          )}
          <button
            onClick={() => setTab('global')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === 'global'
                ? 'bg-[#2AABEE] text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#242f3d]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isRu ? 'Общие настройки звука' : 'Global Preferences'}</span>
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {tab === 'chat' && activeChat && chatSettings && (
            <>
              {/* Mute Presets Card */}
              <div className="bg-[#111922] border border-[#242f3d] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">
                    {isRu ? 'Режим уведомлений' : 'Alert Status'}
                  </span>
                  <span className="text-xs font-mono">
                    {chatSettings.mutedUntil === null ? (
                      <span className="text-emerald-400 font-medium">● {isRu ? 'Включены' : 'Active'}</span>
                    ) : chatSettings.mutedUntil === -1 ? (
                      <span className="text-amber-400 font-medium">✕ {isRu ? 'Заглушен навсегда' : 'Muted forever'}</span>
                    ) : (
                      <span className="text-amber-400 font-medium">⏳ {isRu ? 'Временно заглушен' : 'Temporarily muted'}</span>
                    )}
                  </span>
                </div>

                {/* Quick mute action buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => handleMutePreset(null)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors border ${
                      chatSettings.mutedUntil === null
                        ? 'bg-[#2AABEE] text-white border-[#2AABEE]'
                        : 'bg-[#17212b] border-[#242f3d] text-slate-300 hover:bg-[#242f3d]'
                    }`}
                  >
                    {isRu ? 'Включить' : 'Unmute'}
                  </button>
                  <button
                    onClick={() => handleMutePreset(1)}
                    className="px-2.5 py-1.5 text-xs rounded-lg font-medium bg-[#17212b] border border-[#242f3d] text-slate-300 hover:bg-[#242f3d] transition-colors"
                  >
                    {isRu ? 'На 1 час' : '1 Hour'}
                  </button>
                  <button
                    onClick={() => handleMutePreset(8)}
                    className="px-2.5 py-1.5 text-xs rounded-lg font-medium bg-[#17212b] border border-[#242f3d] text-slate-300 hover:bg-[#242f3d] transition-colors"
                  >
                    {isRu ? 'На 8 часов' : '8 Hours'}
                  </button>
                  <button
                    onClick={() => handleMutePreset(-1)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors border ${
                      chatSettings.mutedUntil === -1
                        ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                        : 'bg-[#17212b] border-[#242f3d] text-slate-300 hover:bg-[#242f3d]'
                    }`}
                  >
                    {isRu ? 'Навсегда' : 'Forever'}
                  </button>
                </div>
              </div>

              {/* Custom Tone Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    {isRu ? 'Индивидуальный сигнал для этого чата' : 'Custom Tone For This Chat'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {isRu ? 'Нажмите значок Play для прослушивания' : 'Click Play to preview'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {SOUNDS.map((s) => (
                    <div
                      key={s.id}
                      onClick={() =>
                        onUpdateChatSettings(activeChat.id, {
                          ...chatSettings,
                          soundTone: s.id,
                        })
                      }
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        chatSettings.soundTone === s.id
                          ? 'bg-[#2AABEE]/10 border-[#2AABEE]/50 text-slate-100'
                          : 'bg-[#111922] border-[#242f3d] text-slate-300 hover:bg-[#15202b]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            chatSettings.soundTone === s.id
                              ? 'border-[#2AABEE] bg-[#2AABEE]'
                              : 'border-slate-500'
                          }`}
                        >
                          {chatSettings.soundTone === s.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">
                            {isRu ? s.nameRu : s.nameEn}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {isRu ? s.descRu : s.descEn}
                          </div>
                        </div>
                      </div>

                      {s.id !== 'silent' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestSound(s.id);
                          }}
                          className="p-1.5 rounded-lg bg-[#242f3d] text-slate-300 hover:text-white hover:bg-[#2AABEE] transition-colors"
                          title={isRu ? 'Прослушать' : 'Preview tone'}
                          aria-label="Play tone preview"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy & Notification Content */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-medium text-slate-300">
                  {isRu ? 'Приватность и упоминания' : 'Privacy & Mentions'}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-xl cursor-pointer hover:bg-[#15202b]">
                    <div className="flex items-center gap-2.5">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs font-medium text-slate-200">
                          {isRu ? 'Показывать текст в уведомлении' : 'Show message preview'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {isRu ? 'Скрыть текст на экране блокировки при выключении' : 'Hide sensitive message text from preview popups'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={chatSettings.showPreview}
                      onChange={(e) =>
                        onUpdateChatSettings(activeChat.id, {
                          ...chatSettings,
                          showPreview: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#2AABEE] rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-xl cursor-pointer hover:bg-[#15202b]">
                    <div className="flex items-center gap-2.5">
                      <AtSign className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs font-medium text-slate-200">
                          {isRu ? 'Звук только при @упоминании' : 'Only @Mentions'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {isRu ? 'Не беспокоить при обычных сообщениях в этой группе' : 'Notify with audio only when you are explicitly mentioned'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={chatSettings.mentionOnly}
                      onChange={(e) =>
                        onUpdateChatSettings(activeChat.id, {
                          ...chatSettings,
                          mentionOnly: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#2AABEE] rounded"
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {tab === 'global' && (
            <div className="space-y-5">
              {/* Master Volume */}
              <div className="bg-[#111922] border border-[#242f3d] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#2AABEE]" />
                    <span className="text-xs font-semibold text-slate-200">
                      {isRu ? 'Громкость уведомлений' : 'Notification Volume'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#2AABEE] font-bold">
                    {globalSettings.soundVolume}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={globalSettings.soundVolume}
                    onChange={(e) =>
                      onUpdateGlobal({
                        ...globalSettings,
                        soundVolume: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-[#2AABEE] cursor-pointer"
                  />
                  <Volume2 className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Global Default Tone */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  {isRu ? 'Стандартный звуковой сигнал (по умолчанию)' : 'Default Notification Tone'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SOUNDS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        onUpdateGlobal({ ...globalSettings, soundTone: s.id });
                        handleTestSound(s.id);
                      }}
                      className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-colors flex items-center justify-between ${
                        globalSettings.soundTone === s.id
                          ? 'bg-[#2AABEE]/15 border-[#2AABEE] text-slate-100'
                          : 'bg-[#111922] border-[#242f3d] text-slate-300 hover:bg-[#15202b]'
                      }`}
                    >
                      <span>{isRu ? s.nameRu : s.nameEn}</span>
                      <Play className="w-3 h-3 text-slate-400 hover:text-white" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Toggles */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-300">
                  {isRu ? 'Общие переключатели' : 'System Toggles'}
                </div>

                <label className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-xl cursor-pointer">
                  <span className="text-xs text-slate-200">
                    {isRu ? 'Всплывающие баннеры в приложении (Toast)' : 'In-App Toast Banners'}
                  </span>
                  <input
                    type="checkbox"
                    checked={globalSettings.inAppBanners}
                    onChange={(e) =>
                      onUpdateGlobal({ ...globalSettings, inAppBanners: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#2AABEE] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-xl cursor-pointer">
                  <span className="text-xs text-slate-200">
                    {isRu ? 'Счетчики непрочитанных на вкладках' : 'Unread Badges on Folders'}
                  </span>
                  <input
                    type="checkbox"
                    checked={globalSettings.badgeCounters}
                    onChange={(e) =>
                      onUpdateGlobal({ ...globalSettings, badgeCounters: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#2AABEE] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-xl cursor-pointer">
                  <span className="text-xs text-slate-200">
                    {isRu ? 'Звук для зашифрованных групп' : 'Audible Alerts For Group Chats'}
                  </span>
                  <input
                    type="checkbox"
                    checked={globalSettings.groupChatAlerts}
                    onChange={(e) =>
                      onUpdateGlobal({ ...globalSettings, groupChatAlerts: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#2AABEE] rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#242f3d] bg-[#111922] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#2AABEE] hover:bg-[#2297d2] rounded-lg transition-colors"
          >
            {isRu ? 'Готово' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
