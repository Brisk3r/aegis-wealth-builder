// Speech Synthesis, Speech Recognition & Tactile Haptic Utilities for Aegis Comfort OS

export class PalliativeSpeech {
  private static synth: SpeechSynthesis | null = null;
  private static isSpeakingState = false;

  // Initialize Speech
  private static getSynth(): SpeechSynthesis | null {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis;
    }
    return null;
  }

  // Text to Speech Read-Aloud
  public static speak(text: string, onEnd?: () => void): boolean {
    const synth = this.getSynth();
    if (!synth) return false;

    this.stop();

    // Clean text for speech
    const cleanText = text
      .replace(/[=\*\[\]#\-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Slightly slower, calm cadence for palliative handover
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeakingState = true;
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
      if (onEnd) onEnd();
    };

    synth.speak(utterance);
    return true;
  }

  public static stop(): void {
    const synth = this.getSynth();
    if (synth) {
      synth.cancel();
      this.isSpeakingState = false;
    }
  }

  public static isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  // Tactile Haptic Feedback
  public static triggerHaptic(pattern: 'light' | 'medium' | 'success' | 'warning' | 'error' = 'light'): void {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        switch (pattern) {
          case 'light':
            navigator.vibrate(15);
            break;
          case 'medium':
            navigator.vibrate(35);
            break;
          case 'success':
            navigator.vibrate([20, 50, 20]);
            break;
          case 'warning':
            navigator.vibrate([40, 60, 40]);
            break;
          case 'error':
            navigator.vibrate([60, 40, 60, 40, 60]);
            break;
        }
      } catch {
        // Fallback silently if vibration blocked
      }
    }
  }

  // Live Speech Recognition Helper
  public static createSpeechRecognizer(
    onResult: (transcript: string) => void,
    onError?: (err: unknown) => void
  ): { start: () => void; stop: () => void; isSupported: boolean } {
    if (typeof window === 'undefined') {
      return { start: () => {}, stop: () => {}, isSupported: false };
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: (e: unknown) => void;
      };
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: (e: unknown) => void;
      };
    };

    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return { start: () => {}, stop: () => {}, isSupported: false };
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      onResult(currentTranscript);
    };

    if (onError) {
      recognition.onerror = onError;
    }

    return {
      start: () => {
        try {
          recognition.start();
        } catch {
          // Already active or error
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // Inactive
        }
      },
      isSupported: true,
    };
  }
}
