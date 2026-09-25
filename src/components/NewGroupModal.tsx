import React, { useState } from 'react';
import { Chat, EncryptionAlgorithm, Lang, User } from '../types';
import { generateSafetyEmojis } from '../utils/crypto';
import { Shield, Lock, Users, Check, Clock, Plus } from 'lucide-react';
import avatarGroup from '../assets/images/avatar_group_devs_1790334954639.jpg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  availableContacts: User[];
  currentUser: User;
  onCreateGroup: (group: Chat) => void;
  lang: Lang;
}

export const NewGroupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  availableContacts,
  currentUser,
  onCreateGroup,
  lang,
}) => {
  const isRu = lang === 'ru';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    availableContacts.slice(0, 2).map((c) => c.id)
  );
  const [algorithm, setAlgorithm] = useState<EncryptionAlgorithm>('AES-256-GCM');
  const [autoDeleteTime, setAutoDeleteTime] = useState<number>(0);
  const [forwardingRestricted, setForwardingRestricted] = useState(true);

  if (!isOpen) return null;

  const toggleContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      if (selectedContacts.length > 1) {
        setSelectedContacts(selectedContacts.filter((c) => c !== id));
      }
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const members = [
      ...availableContacts.filter((c) => selectedContacts.includes(c.id)),
      currentUser,
    ];

    const randomHex = Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const newGroup: Chat = {
      id: `group_${Date.now()}`,
      type: 'group',
      title: title.trim(),
      avatar: avatarGroup,
      isEncrypted: true,
      unreadCount: 0,
      isPinned: false,
      members,
      encryptionDetails: {
        algorithm,
        safetyFingerprint: randomHex,
        safetyEmojis: generateSafetyEmojis(randomHex),
        keyExchangeDate: isRu ? 'Только что (Создана)' : 'Just now (Created)',
        ratchetStep: 1,
        isVerifiedByUser: true,
        forwardingRestricted,
        screenshotProtection: true,
      },
      notificationSettings: {
        enabled: true,
        mutedUntil: null,
        soundTone: 'classic',
        showPreview: true,
        mentionOnly: false,
        vibration: 'default',
      },
      autoDeleteTime,
      description: description.trim() || (isRu ? 'Зашифрованная группа' : 'Encrypted group'),
      lastMessage: isRu ? 'Группа успешно создана и защищена E2EE' : 'Group created and encrypted with E2EE',
      lastMessageTime: Date.now(),
    };

    onCreateGroup(newGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#17212b] border border-[#242f3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-[#242f3d] flex items-center justify-between bg-[#111922]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2AABEE]/15 flex items-center justify-center text-[#2AABEE]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                {isRu ? 'Новая зашифрованная группа' : 'New Encrypted Group'}
              </h2>
              <div className="text-xs text-slate-400">
                {isRu ? 'E2EE сквозное шифрование сессии' : 'End-to-End Encrypted Session'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#242f3d] transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-5">
          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isRu ? 'Название группы *' : 'Group Name *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRu ? 'Напр., Quantum Security Team' : 'e.g. Quantum Security Team'}
                className="w-full px-3.5 py-2.5 bg-[#111922] border border-[#242f3d] focus:border-[#2AABEE] rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isRu ? 'Описание / Назначение ключей' : 'Description'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isRu ? 'Краткое описание группы' : 'Group description / intent'}
                className="w-full px-3.5 py-2 bg-[#111922] border border-[#242f3d] focus:border-[#2AABEE] rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Cryptographic Algorithm Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {isRu ? 'Алгоритм шифрования сессии' : 'Cryptographic Cipher'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'AES-256-GCM', name: 'AES-256-GCM', sub: 'NIST Standard' },
                { id: 'ChaCha20-Poly1305', name: 'ChaCha20', sub: 'High-speed' },
                { id: 'Curve25519-Ratchet', name: 'Double Ratchet', sub: 'Signal Protocol' },
              ].map((algo) => (
                <div
                  key={algo.id}
                  onClick={() => setAlgorithm(algo.id as EncryptionAlgorithm)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                    algorithm === algo.id
                      ? 'bg-[#2AABEE]/15 border-[#2AABEE] text-slate-100'
                      : 'bg-[#111922] border-[#242f3d] text-slate-400 hover:bg-[#15202b]'
                  }`}
                >
                  <div className="text-xs font-semibold">{algo.name}</div>
                  <div className="text-[10px] text-slate-500">{algo.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {isRu ? 'Выберите участников' : 'Select Members'} ({selectedContacts.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {availableContacts.map((contact) => {
                const isSelected = selectedContacts.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => toggleContact(contact.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#15202b] border-[#2AABEE]/60'
                        : 'bg-[#111922] border-[#242f3d] hover:bg-[#15202b]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-medium text-slate-200">{contact.name}</div>
                        <div className="text-[10px] text-slate-400">{contact.handle}</div>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#2AABEE] border-[#2AABEE] text-white'
                          : 'border-slate-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ephemeral auto-delete timer */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {isRu ? 'Таймер самоуничтожения сообщений' : 'Auto-Delete Ephemeral Timer'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 0, labelRu: 'Откл', labelEn: 'Off' },
                { sec: 300, labelRu: '5 мин', labelEn: '5m' },
                { sec: 3600, labelRu: '1 час', labelEn: '1h' },
                { sec: 86400, labelRu: '24 часа', labelEn: '24h' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.sec}
                  onClick={() => setAutoDeleteTime(opt.sec)}
                  className={`py-2 text-xs rounded-xl font-medium border transition-colors ${
                    autoDeleteTime === opt.sec
                      ? 'bg-[#2AABEE] text-white border-[#2AABEE]'
                      : 'bg-[#111922] border-[#242f3d] text-slate-300 hover:bg-[#15202b]'
                  }`}
                >
                  {isRu ? opt.labelRu : opt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Security policy toggle */}
          <label className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-xl cursor-pointer">
            <div>
              <div className="text-xs font-medium text-slate-200">
                {isRu ? 'Запрет пересылки и сохранения' : 'Restrict Message Forwarding'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isRu ? 'Сообщения защищены от копирования во внешние чаты' : 'Disallow copy/paste and export outside this secure channel'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={forwardingRestricted}
              onChange={(e) => setForwardingRestricted(e.target.checked)}
              className="w-4 h-4 accent-[#2AABEE] rounded"
            />
          </label>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#242f3d] hover:bg-[#2c394b] rounded-lg transition-colors"
            >
              {isRu ? 'Отмена' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2AABEE] hover:bg-[#2297d2] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRu ? 'Создать группу' : 'Create Group'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
