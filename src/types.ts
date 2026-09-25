export type Theme = 'dark' | 'light';
export type Lang = 'ru' | 'en';

export type EncryptionAlgorithm = 'AES-256-GCM' | 'ChaCha20-Poly1305' | 'Curve25519-Ratchet';

export type NotificationSound = 'classic' | 'aurora' | 'chime' | 'woodblock' | 'cyber' | 'silent';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing';
  lastSeen?: string;
  publicKeyFingerprint?: string;
  isVerified?: boolean;
}

export interface EncryptionDetails {
  algorithm: EncryptionAlgorithm;
  safetyFingerprint: string;
  safetyEmojis: string[];
  keyExchangeDate: string;
  ratchetStep: number;
  isVerifiedByUser: boolean;
  forwardingRestricted: boolean;
  screenshotProtection: boolean;
}

export interface ChatNotificationSettings {
  enabled: boolean;
  mutedUntil: number | null; // null = active, -1 = forever, or timestamp ms
  soundTone: NotificationSound;
  showPreview: boolean;
  mentionOnly: boolean;
  vibration: 'default' | 'subtle' | 'none';
}

export interface GlobalNotificationSettings {
  masterEnabled: boolean;
  soundTone: NotificationSound;
  soundVolume: number; // 0 - 100
  previewMode: 'all' | 'sender_only' | 'hidden';
  desktopNotifications: boolean;
  inAppBanners: boolean;
  groupChatAlerts: boolean;
  directChatAlerts: boolean;
  badgeCounters: boolean;
}

export interface MediaAttachment {
  type: 'image' | 'voice' | 'file';
  url?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number; // seconds for voice
  waveData?: number[];
}

export interface EncryptedPayload {
  ciphertextHex: string;
  ivHex: string;
  tagHex: string;
  keyId: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  isOutgoing: boolean;
  status: 'sending' | 'sent' | 'read';
  isEncrypted: boolean;
  encryptedPayload?: EncryptedPayload;
  selfDestructIn?: number; // seconds
  expiresAt?: number;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  media?: MediaAttachment;
  systemAlert?: string;
  isPinned?: boolean;
}

export interface Chat {
  id: string;
  type: 'group' | 'secret' | 'direct';
  title: string;
  avatar: string;
  isEncrypted: boolean;
  unreadCount: number;
  isPinned: boolean;
  pinnedMessageId?: string;
  members: User[];
  encryptionDetails: EncryptionDetails;
  notificationSettings: ChatNotificationSettings;
  autoDeleteTime: number; // seconds, 0 = off
  description?: string;
  isTyping?: string | null;
  lastMessage?: string;
  lastMessageTime?: number;
}
