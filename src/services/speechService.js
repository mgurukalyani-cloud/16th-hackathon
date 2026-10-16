/**
 * AgriSense Multilingual Speech Synthesis (TTS) Service
 * Supports Indian regional languages via Web Speech API.
 * Gracefully informs users if the specific regional voice is not installed in the browser/OS.
 */

class SpeechService {
  constructor() {
    this.voices = [];
    if (this.isSupported()) {
      this.loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.isSupported()) return;
    this.voices = window.speechSynthesis.getVoices();
  }

  findVoiceForLocale(locale, ttsCode) {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }

    const targetCodes = [
      ttsCode,
      locale,
      locale?.split('-')[0],
      ttsCode?.split('-')[0]
    ].filter(Boolean);

    for (const code of targetCodes) {
      const match = this.voices.find(v => 
        v.lang.toLowerCase() === code.toLowerCase() ||
        v.lang.toLowerCase().startsWith(code.toLowerCase())
      );
      if (match) return match;
    }

    // Default fallback voice (English / system default)
    return this.voices.find(v => v.default) || this.voices[0] || null;
  }

  speak(text, langMeta, onStart, onEnd, onError) {
    if (!this.isSupported()) {
      return {
        success: false,
        reason: 'UNSUPPORTED',
        message: 'Web Speech API is not supported in this browser.'
      };
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    if (!text || text.trim() === '') {
      return { success: false, reason: 'EMPTY_TEXT' };
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const matchedVoice = this.findVoiceForLocale(langMeta.locale, langMeta.ttsCode);

    const hasExactVoice = matchedVoice && (
      matchedVoice.lang.toLowerCase().startsWith(langMeta.code) ||
      (langMeta.ttsCode && matchedVoice.lang.toLowerCase().startsWith(langMeta.ttsCode.toLowerCase().split('-')[0]))
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = langMeta.locale || 'en-IN';
    }

    utterance.rate = 0.95; // Slightly slower for clarity across regional Indian dialects
    utterance.pitch = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);

    return {
      success: true,
      hasExactVoice: Boolean(hasExactVoice),
      voiceName: matchedVoice ? matchedVoice.name : 'System Default',
      message: hasExactVoice
        ? `Speaking in ${langMeta.nativeName} (${langMeta.name})`
        : `Native voice for ${langMeta.name} is not installed on this device. Using ${matchedVoice?.name || 'system fallback'}.`
    };
  }

  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
