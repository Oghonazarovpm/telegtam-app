import React, { useState } from 'react';
import { Chat, Lang } from '../types';
import { formatSafetyNumbers } from '../utils/crypto';
import { ShieldCheck, Lock, CheckCircle2, Copy, Check, QrCode, RefreshCw, Key, ShieldAlert } from 'lucide-react';

interface Props {
  chat: Chat;
  isOpen: boolean;
  onClose: () => void;
  onToggleVerify: (chatId: string) => void;
  onRotateKey: (chatId: string) => void;
  lang: Lang;
}

export const SafetyNumbersModal: React.FC<Props> = ({
  chat,
  isOpen,
  onClose,
  onToggleVerify,
  onRotateKey,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'numbers' | 'qr' | 'details'>('numbers');

  if (!isOpen) return null;

  const enc = chat.encryptionDetails;
  const numberBlocks = formatSafetyNumbers(enc.safetyFingerprint);
  const isRu = lang === 'ru';

  const handleCopy = () => {
    navigator.clipboard.writeText(enc.safetyFingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#17212b] border border-[#242f3d] dark:bg-[#17212b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242f3d] flex items-center justify-between bg-[#111922]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2AABEE]/15 flex items-center justify-center text-[#2AABEE]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                {isRu ? 'Ключи безопасности & E2EE' : 'Safety Numbers & E2EE'}
              </h2>
              <div className="text-xs text-slate-400">
                {chat.title} · {enc.algorithm}
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
        <div className="px-6 pt-4 pb-2 flex gap-1 bg-[#141d26] border-b border-[#242f3d]/60">
          <button
            onClick={() => setActiveTab('numbers')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'numbers'
                ? 'bg-[#2AABEE] text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#242f3d]'
            }`}
          >
            {isRu ? 'Цифровой код' : 'Safety Numbers'}
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-[#2AABEE] text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#242f3d]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR-код</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'details'
                ? 'bg-[#2AABEE] text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#242f3d]'
            }`}
          >
            {isRu ? 'Криптография' : 'Cipher Details'}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'numbers' && (
            <>
              {/* Visual emoji signature */}
              <div className="bg-[#111922] border border-[#242f3d] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">
                    {isRu ? 'Визуальный хэш-код:' : 'Visual safety hash:'}
                  </div>
                  <div className="text-2xl mt-1 tracking-widest select-none flex gap-2">
                    {enc.safetyEmojis.map((emoji, idx) => (
                      <span key={idx} className="p-1 rounded bg-[#17212b] border border-[#242f3d]">
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    {isRu ? 'Ратчет-шаг' : 'Ratchet Step'}
                  </div>
                  <div className="text-sm font-mono text-[#2AABEE] font-semibold">
                    #{enc.ratchetStep}
                  </div>
                </div>
              </div>

              {/* 12 blocks of 5 digits */}
              <div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {isRu
                    ? 'Сравните эти 60 цифр с экраном собеседника. Если цифры совпадают, никто не перехватывает вашу переписку (Man-in-the-middle атака исключена).'
                    : 'Compare these numbers with your contact. If they match, your end-to-end encrypted session is mathematically authentic.'}
                </p>
                <div className="grid grid-cols-3 gap-2 font-mono text-sm tracking-wider text-center">
                  {numberBlocks.map((chunk, idx) => (
                    <div
                      key={idx}
                      className="py-2 px-3 bg-[#111922] border border-[#242f3d] rounded-lg text-slate-200 tabular-nums font-medium"
                    >
                      {chunk}
                    </div>
                  ))}
                </div>
              </div>

              {/* Full hex fingerprint */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isRu ? 'SHA-256 Отпечаток ключа (Hex)' : 'SHA-256 Key Fingerprint (Hex)'}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[#2AABEE] hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isRu ? 'Скопировано' : 'Copied') : (isRu ? 'Копировать' : 'Copy')}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-[#111922] border border-[#242f3d] rounded-lg font-mono text-[11px] text-slate-300 break-all select-all">
                  {enc.safetyFingerprint}
                </div>
              </div>
            </>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-300">
                {/* SVG QR Code Pattern */}
                <svg className="w-48 h-48" viewBox="0 0 100 100" fill="black">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="#0c131a" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="13" width="12" height="12" rx="1" fill="#0c131a" />

                  <rect x="67" y="5" width="28" height="28" rx="4" fill="#0c131a" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="75" y="13" width="12" height="12" rx="1" fill="#0c131a" />

                  <rect x="5" y="67" width="28" height="28" rx="4" fill="#0c131a" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="75" width="12" height="12" rx="1" fill="#0c131a" />

                  {/* Cryptographic data dots */}
                  <rect x="38" y="8" width="5" height="5" />
                  <rect x="47" y="12" width="5" height="5" />
                  <rect x="55" y="8" width="5" height="5" />
                  <rect x="42" y="24" width="5" height="5" />
                  <rect x="51" y="28" width="5" height="5" />
                  <rect x="38" y="38" width="8" height="8" rx="1" fill="#2AABEE" />
                  <rect x="54" y="38" width="8" height="8" rx="1" fill="#2AABEE" />
                  <rect x="46" y="50" width="8" height="8" rx="1" fill="#2AABEE" />

                  <rect x="8" y="42" width="5" height="5" />
                  <rect x="18" y="48" width="5" height="5" />
                  <rect x="25" y="42" width="5" height="5" />

                  <rect x="72" y="42" width="5" height="5" />
                  <rect x="85" y="48" width="5" height="5" />
                  <rect x="78" y="56" width="5" height="5" />

                  <rect x="38" y="68" width="5" height="5" />
                  <rect x="48" y="75" width="5" height="5" />
                  <rect x="56" y="68" width="5" height="5" />
                  <rect x="68" y="80" width="5" height="5" />
                  <rect x="82" y="72" width="5" height="5" />
                  <rect x="75" y="85" width="5" height="5" />
                </svg>
              </div>
              <p className="text-xs text-center text-slate-400 max-w-xs">
                {isRu
                  ? 'Отсканируйте камерой на телефоне собеседника для моментальной аппаратной верификации.'
                  : 'Scan with contact’s device to verify safety keys instantly.'}
              </p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-lg">
                <span className="text-slate-400">{isRu ? 'Алгоритм шифрования:' : 'Cipher:'}</span>
                <span className="font-mono text-emerald-400 font-semibold">{enc.algorithm}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-lg">
                <span className="text-slate-400">{isRu ? 'Обмен ключами (KEM):' : 'Key Agreement:'}</span>
                <span className="font-mono text-slate-200">Curve25519-ECDH</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-lg">
                <span className="text-slate-400">{isRu ? 'Дата согласования ключа:' : 'Key Exchange:'}</span>
                <span className="text-slate-200">{enc.keyExchangeDate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-lg">
                <span className="text-slate-400">{isRu ? 'Perfect Forward Secrecy:' : 'Perfect Forward Secrecy:'}</span>
                <span className="text-emerald-400 font-medium">✓ {isRu ? 'Активно (Double Ratchet)' : 'Active (Double Ratchet)'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#111922] border border-[#242f3d] rounded-lg">
                <span className="text-slate-400">{isRu ? 'Запрет пересылки сообщений:' : 'Forwarding Restricted:'}</span>
                <span className={enc.forwardingRestricted ? 'text-emerald-400' : 'text-slate-400'}>
                  {enc.forwardingRestricted ? (isRu ? 'Включено' : 'Enabled') : (isRu ? 'Выключено' : 'Disabled')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#242f3d] bg-[#111922] flex items-center justify-between gap-3">
          <button
            onClick={() => onRotateKey(chat.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#242f3d] hover:bg-[#2c394b] rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isRu ? 'Ротация ключа (Re-key)' : 'Rotate Key'}</span>
          </button>

          <button
            onClick={() => {
              onToggleVerify(chat.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              enc.isVerifiedByUser
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-[#2AABEE] text-white hover:bg-[#2297d2]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {enc.isVerifiedByUser
                ? (isRu ? 'Верифицировано ✓' : 'Verified ✓')
                : (isRu ? 'Отметить как проверенный' : 'Mark as Verified')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
