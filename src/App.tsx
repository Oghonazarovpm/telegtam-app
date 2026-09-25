import React, { useState, useEffect } from 'react';
import {
  Chat,
  ChatNotificationSettings,
  GlobalNotificationSettings,
  Lang,
  Message,
  Theme,
  User,
} from './types';
import {
  CURRENT_USER,
  INITIAL_CHATS,
  INITIAL_GLOBAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
  CONTACT_ALEX,
  CONTACT_ELENA,
  CONTACT_MARCUS,
} from './data/initialData';
import { simulateEncrypt } from './utils/crypto';
import { playNotificationSound } from './utils/audio';

import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { SafetyNumbersModal } from './components/SafetyNumbersModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { GroupInfoDrawer } from './components/GroupInfoDrawer';
import { NewGroupModal } from './components/NewGroupModal';
import { ToastNotification, ToastData } from './components/ToastNotification';
import { Shield, Lock } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Lang>('ru');

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('teleshield_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('teleshield_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [globalNotifications, setGlobalNotifications] = useState<GlobalNotificationSettings>(() => {
    const saved = localStorage.getItem('teleshield_global_notifs');
    return saved ? JSON.parse(saved) : INITIAL_GLOBAL_NOTIFICATIONS;
  });

  const [activeChatId, setActiveChatId] = useState<string>('chat_group_core');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Modals & Panels
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  // In-chat search
  const [isChatSearchActive, setIsChatSearchActive] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Toast
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('teleshield_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('teleshield_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('teleshield_global_notifs', JSON.stringify(globalNotifications));
  }, [globalNotifications]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const activeMessages = activeChat ? messages[activeChat.id] || [] : [];

  // Toggle Theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle Lang
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  // Sending a message
  const handleSendMessage = async (
    text: string,
    options?: {
      replyTo?: Message;
      selfDestructIn?: number;
      mediaType?: 'voice' | 'file' | 'image';
    }
  ) => {
    if (!activeChat) return;

    // Simulate real WebCrypto payload
    const encPayload = await simulateEncrypt(text || 'Voice/Media Payload', activeChat.encryptionDetails.algorithm);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      chatId: activeChat.id,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      text,
      timestamp: Date.now(),
      isOutgoing: true,
      status: 'sending',
      isEncrypted: activeChat.isEncrypted,
      encryptedPayload: encPayload,
      selfDestructIn: options?.selfDestructIn || (activeChat.autoDeleteTime > 0 ? activeChat.autoDeleteTime : undefined),
      replyTo: options?.replyTo
        ? {
            id: options.replyTo.id,
            senderName: options.replyTo.senderName,
            text: options.replyTo.text,
          }
        : undefined,
      media: options?.mediaType === 'voice'
        ? {
            type: 'voice',
            duration: 6,
            waveData: [25, 40, 65, 80, 50, 70, 90, 60, 45, 85, 95, 70, 40, 30, 20],
          }
        : undefined,
    };

    // Update message state
    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }));

    // Update chat last message
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              lastMessage: options?.mediaType === 'voice' ? (lang === 'ru' ? 'Вы: Голосовое сообщение' : 'You: Voice message') : `Вы: ${text}`,
              lastMessageTime: Date.now(),
            }
          : c
      )
    );

    // Mark as sent after 400ms, then read after 900ms
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat.id]: (prev[activeChat.id] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'sent' } : m
        ),
      }));
    }, 400);

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat.id]: (prev[activeChat.id] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'read' } : m
        ),
      }));
    }, 1100);

    // Simulated peer reply in group or secret chat
    if (activeChat.members.length > 1) {
      const respondent =
        activeChat.members.find((m) => m.id !== CURRENT_USER.id) || CONTACT_ELENA;

      // Set typing indicator after 1.2s
      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) => (c.id === activeChat.id ? { ...c, isTyping: respondent.name } : c))
        );
      }, 1200);

      // Deliver reply after 2.8s
      setTimeout(async () => {
        setChats((prev) =>
          prev.map((c) => (c.id === activeChat.id ? { ...c, isTyping: null } : c))
        );

        const repliesRu = [
          'Подтверждаю. Дешифрование пакета по AES-GCM прошло успешно, контрольная сумма совпала.',
          'Ключевая пара валидирована. Хэш безопасности сверен.',
          'Принято в защищенный анклав. Задержка ратчета нулевая.',
          'Согласен. Все входящие логи шифруются на клиенте без передачи мастер-ключа.',
        ];

        const repliesEn = [
          'Confirmed. Packet decrypted cleanly via AES-GCM with zero signature mismatch.',
          'Keypair validated against the safety fingerprint. Session is tamper-proof.',
          'Stored securely in enclave memory. Ratchet step updated.',
          'Agreed. Zero plaintext is exposed outside our peer node.',
        ];

        const randomReply =
          lang === 'ru'
            ? repliesRu[Math.floor(Math.random() * repliesRu.length)]
            : repliesEn[Math.floor(Math.random() * repliesEn.length)];

        const replyPayload = await simulateEncrypt(randomReply, activeChat.encryptionDetails.algorithm);

        const incomingMsg: Message = {
          id: `msg_inc_${Date.now()}`,
          chatId: activeChat.id,
          senderId: respondent.id,
          senderName: respondent.name,
          senderAvatar: respondent.avatar,
          text: randomReply,
          timestamp: Date.now(),
          isOutgoing: false,
          status: 'read',
          isEncrypted: true,
          encryptedPayload: replyPayload,
          selfDestructIn: activeChat.autoDeleteTime > 0 ? activeChat.autoDeleteTime : undefined,
        };

        setMessages((prev) => ({
          ...prev,
          [activeChat.id]: [...(prev[activeChat.id] || []), incomingMsg],
        }));

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat.id
              ? {
                  ...c,
                  lastMessage: `${respondent.name}: ${randomReply}`,
                  lastMessageTime: Date.now(),
                }
              : c
          )
        );

        // Check notification sound rules
        const chatNotif = activeChat.notificationSettings;
        const isMuted = chatNotif.mutedUntil !== null;

        if (!isMuted && globalNotifications.masterEnabled) {
          const toneToPlay = chatNotif.soundTone !== 'silent' ? chatNotif.soundTone : globalNotifications.soundTone;
          playNotificationSound(toneToPlay, globalNotifications.soundVolume);
        }

        // Trigger in-app toast
        if (globalNotifications.inAppBanners) {
          setActiveToast({
            id: `toast_${Date.now()}`,
            chatId: activeChat.id,
            chatTitle: activeChat.title,
            senderName: respondent.name,
            senderAvatar: respondent.avatar,
            text: randomReply,
            isEncrypted: activeChat.isEncrypted,
            showPreview: chatNotif.showPreview,
          });
        }
      }, 3000);
    }
  };

  // Toggle Verification of Safety Numbers
  const handleToggleVerify = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              encryptionDetails: {
                ...c.encryptionDetails,
                isVerifiedByUser: !c.encryptionDetails.isVerifiedByUser,
              },
            }
          : c
      )
    );
  };

  // Rotate Key (Ratchet step advancement)
  const handleRotateKey = (chatId: string) => {
    const randomHex = Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              encryptionDetails: {
                ...c.encryptionDetails,
                safetyFingerprint: randomHex,
                ratchetStep: c.encryptionDetails.ratchetStep + 1,
                keyExchangeDate: lang === 'ru' ? 'Только что (Ротация)' : 'Just now (Rotated)',
              },
            }
          : c
      )
    );

    // Post system message
    const sysMsg: Message = {
      id: `msg_sys_rot_${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'TeleShield Protocol',
      text:
        lang === 'ru'
          ? 'Ключи сессии успешно ротированы (Double Ratchet forward secrecy). Прошлые сообщения необратимо защищены.'
          : 'Session keys rotated via Double Ratchet forward secrecy. Prior communications are cryptographically sealed.',
      timestamp: Date.now(),
      isOutgoing: false,
      status: 'read',
      isEncrypted: true,
      systemAlert: 'key_rotated',
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));
  };

  // Clear chat
  const handleClearChat = (chatId: string) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [],
    }));
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, lastMessage: '', unreadCount: 0 }
          : c
      )
    );
  };

  // Pin message
  const handlePinMessage = (messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) =>
        m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
      ),
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              pinnedMessageId: c.pinnedMessageId === messageId ? undefined : messageId,
            }
          : c
      )
    );
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).filter((m) => m.id !== messageId),
    }));
  };

  // Update chat notification settings
  const handleUpdateChatSettings = (chatId: string, settings: ChatNotificationSettings) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, notificationSettings: settings }
          : c
      )
    );
  };

  // Update auto delete time
  const handleSetAutoDelete = (seconds: number) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, autoDeleteTime: seconds }
          : c
      )
    );

    const sysMsg: Message = {
      id: `msg_sys_autodel_${Date.now()}`,
      chatId: activeChatId,
      senderId: 'system',
      senderName: 'TeleShield Protocol',
      text:
        seconds === 0
          ? (lang === 'ru' ? 'Таймер автоудаления отключен.' : 'Auto-delete timer disabled.')
          : `${lang === 'ru' ? 'Таймер автоудаления установлен на' : 'Auto-delete timer set to'} ${
              seconds === 30 ? '30s' : seconds === 300 ? '5m' : seconds === 3600 ? '1h' : '24h'
            }.`,
      timestamp: Date.now(),
      isOutgoing: false,
      status: 'read',
      isEncrypted: true,
      systemAlert: 'auto_delete_updated',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), sysMsg],
    }));
  };

  // Create new group
  const handleCreateGroup = (newGroup: Chat) => {
    setChats((prev) => [newGroup, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newGroup.id]: [
        {
          id: `msg_init_${Date.now()}`,
          chatId: newGroup.id,
          senderId: 'system',
          senderName: 'TeleShield Protocol',
          text:
            lang === 'ru'
              ? `Зашифрованная группа "${newGroup.title}" создана. Алгоритм: ${newGroup.encryptionDetails.algorithm}.`
              : `Encrypted group "${newGroup.title}" created. Cipher: ${newGroup.encryptionDetails.algorithm}.`,
          timestamp: Date.now(),
          isOutgoing: false,
          status: 'read',
          isEncrypted: true,
          systemAlert: 'group_created',
        },
      ],
    }));
    setActiveChatId(newGroup.id);
  };

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#0c131a] text-slate-100'
          : 'bg-[#eef2f6] text-slate-800'
      }`}
    >
      {/* Toast popup */}
      <ToastNotification
        toast={activeToast}
        onDismiss={() => setActiveToast(null)}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setActiveToast(null);
        }}
        lang={lang}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setChats((prev) =>
              prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
            );
          }}
          onOpenNewGroup={() => setIsNewGroupModalOpen(true)}
          onOpenGlobalSettings={() => setIsNotificationModalOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          lang={lang}
          onToggleLang={handleToggleLang}
        />

        {/* Chat Main Viewport */}
        {activeChat ? (
          <main className={`flex-1 flex flex-col h-full overflow-hidden relative transition-colors ${
            theme === 'dark' ? 'bg-[#0c131a]' : 'bg-[#eef2f6]'
          }`}>
            <ChatHeader
              chat={activeChat}
              onOpenSafetyNumbers={() => setIsSafetyModalOpen(true)}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
              onToggleInfoDrawer={() => setIsGroupInfoOpen(!isGroupInfoOpen)}
              onRotateKey={handleRotateKey}
              onClearChat={handleClearChat}
              onToggleSearch={() => {
                setIsChatSearchActive(!isChatSearchActive);
                if (isChatSearchActive) setChatSearchQuery('');
              }}
              isSearchActive={isChatSearchActive}
              lang={lang}
              theme={theme}
            />

            {/* In-chat search input if active */}
            {isChatSearchActive && (
              <div className={`px-4 py-2 border-b flex items-center gap-2 transition-colors ${
                theme === 'dark' ? 'bg-[#111922] border-[#242f3d]' : 'bg-slate-100 border-slate-200'
              }`}>
                <input
                  type="text"
                  autoFocus
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'ru'
                      ? 'Поиск по сообщениям в этом чате...'
                      : 'Search messages in this conversation...'
                  }
                  className={`w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:border-[#2AABEE] ${
                    theme === 'dark'
                      ? 'bg-[#17212b] border-[#242f3d] text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  onClick={() => {
                    setIsChatSearchActive(false);
                    setChatSearchQuery('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1"
                >
                  {lang === 'ru' ? 'Отмена' : 'Cancel'}
                </button>
              </div>
            )}

            <div className="flex-1 flex overflow-hidden">
              {/* Message Feed */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <MessageList
                  chat={activeChat}
                  messages={activeMessages}
                  onReply={(msg) => setReplyingTo(msg)}
                  onPinMessage={handlePinMessage}
                  onDeleteMessage={handleDeleteMessage}
                  lang={lang}
                  theme={theme}
                  searchQuery={isChatSearchActive ? chatSearchQuery : undefined}
                  onCloseSearch={() => {
                    setIsChatSearchActive(false);
                    setChatSearchQuery('');
                  }}
                />

                <MessageInput
                  onSendMessage={handleSendMessage}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  autoDeleteDefault={activeChat.autoDeleteTime}
                  lang={lang}
                  theme={theme}
                />
              </div>

              {/* Chat Info Right Drawer */}
              {isGroupInfoOpen && (
                <GroupInfoDrawer
                  chat={activeChat}
                  isOpen={isGroupInfoOpen}
                  onClose={() => setIsGroupInfoOpen(false)}
                  onOpenSafetyNumbers={() => setIsSafetyModalOpen(true)}
                  onOpenNotifications={() => setIsNotificationModalOpen(true)}
                  onSetAutoDelete={handleSetAutoDelete}
                  onAddMember={() => setIsNewGroupModalOpen(true)}
                  lang={lang}
                  theme={theme}
                />
              )}
            </div>
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center telegram-dark-bg text-center p-6">
            <div className="p-6 rounded-2xl bg-[#17212b] border border-[#242f3d] max-w-sm">
              <Shield className="w-12 h-12 text-[#2AABEE] mx-auto mb-3" />
              <h2 className="text-sm font-semibold text-slate-100">
                {lang === 'ru' ? 'Выберите зашифрованный чат' : 'Select an encrypted chat'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'ru'
                  ? 'Сообщения защищены сквозным шифрованием E2EE на всех устройствах.'
                  : 'All conversations are protected with verifiable end-to-end encryption.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Safety Numbers Modal */}
      {activeChat && (
        <SafetyNumbersModal
          chat={activeChat}
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
          onToggleVerify={handleToggleVerify}
          onRotateKey={handleRotateKey}
          lang={lang}
        />
      )}

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        activeChat={activeChat}
        globalSettings={globalNotifications}
        onUpdateGlobal={setGlobalNotifications}
        onUpdateChatSettings={handleUpdateChatSettings}
        lang={lang}
      />

      {/* New Encrypted Group Modal */}
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        availableContacts={[CONTACT_ELENA, CONTACT_ALEX, CONTACT_MARCUS]}
        currentUser={CURRENT_USER}
        onCreateGroup={handleCreateGroup}
        lang={lang}
      />
    </div>
  );
}
