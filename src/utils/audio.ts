import { NotificationSound } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playNotificationSound(tone: NotificationSound, volumePercent = 80) {
  if (tone === 'silent' || volumePercent <= 0) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    const masterGain = (volumePercent / 100) * 0.35; // gentle, non-jarring output

    gainNode.gain.setValueAtTime(masterGain, now);
    gainNode.connect(ctx.destination);

    switch (tone) {
      case 'classic': {
        // Telegram classic 2-tone chime (G5 to C6)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g1 = ctx.createGain();
        const g2 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(783.99, now); // G5
        g1.gain.setValueAtTime(0.7, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc1.connect(g1);
        g1.connect(gainNode);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.5, now + 0.1); // C6
        g2.gain.setValueAtTime(0, now);
        g2.gain.setValueAtTime(0.85, now + 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc2.connect(g2);
        g2.connect(gainNode);

        osc1.start(now);
        osc1.stop(now + 0.3);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.6);
        break;
      }

      case 'aurora': {
        // Ethereal rising triad
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.07;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.4, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
          osc.connect(gain);
          gain.connect(gainNode);
          osc.start(start);
          osc.stop(start + 0.5);
        });
        break;
      }

      case 'chime': {
        // High bright bell ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1174.66, now); // D6
        gain.gain.setValueAtTime(0.75, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.65);
        break;
      }

      case 'woodblock': {
        // Snappy acoustic organic click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'cyber': {
        // Sleek electronic blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
    }
  } catch (err) {
    console.warn('Audio playback not allowed or failed:', err);
  }
}
