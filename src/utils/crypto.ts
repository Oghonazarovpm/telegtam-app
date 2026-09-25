import { EncryptedPayload, EncryptionAlgorithm } from '../types';

// Convert ArrayBuffer to Hex string
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate realistic AES-256-GCM encrypted payload
export async function simulateEncrypt(
  text: string,
  algorithm: EncryptionAlgorithm = 'AES-256-GCM'
): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Generate pseudo-random ciphertext and auth tag
  const dummyTag = window.crypto.getRandomValues(new Uint8Array(16));
  const dummyCipher = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    dummyCipher[i] = data[i] ^ (iv[i % 12] + i * 3);
  }

  return {
    ciphertextHex: bufToHex(dummyCipher.buffer),
    ivHex: bufToHex(iv.buffer),
    tagHex: bufToHex(dummyTag.buffer),
    keyId: `KEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  };
}

// Visual emoji fingerprint generator
const EMOJI_POOL = ['🛡️', '⚡', '🔑', '🌊', '🪐', '🦅', '💎', '🔥', '🌲', '🌙', '🧭', '🔮', '⚓', '🏔️', '🧬', '🛸'];

export function generateSafetyEmojis(seed: string): string[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  return [
    EMOJI_POOL[absHash % EMOJI_POOL.length],
    EMOJI_POOL[(absHash >> 4) % EMOJI_POOL.length],
    EMOJI_POOL[(absHash >> 8) % EMOJI_POOL.length],
    EMOJI_POOL[(absHash >> 12) % EMOJI_POOL.length],
  ];
}

// Formats a 64-character hex key into 12 groups of 5-digit verification numbers
export function formatSafetyNumbers(fingerprint: string): string[] {
  const clean = fingerprint.replace(/[^0-9a-fA-F]/g, '');
  const chunks: string[] = [];
  for (let i = 0; i < 12; i++) {
    const slice = clean.slice((i * 4) % clean.length, ((i * 4) % clean.length) + 4) || 'a1b2';
    const num = (parseInt(slice, 16) % 90000) + 10000;
    chunks.push(num.toString());
  }
  return chunks;
}
