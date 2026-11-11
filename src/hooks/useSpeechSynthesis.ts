import { useState, useEffect, useRef, useCallback } from "react";
import { Language } from "../types";

export interface SpeechSynthesisHook {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  currentSentence: string;
  currentSentenceIndex: number;
  totalSentences: number;
  progressPercent: number;
  speak: (text: string, lang?: Language) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  replay: () => void;
}

/**
 * Splits text into natural sentence chunks for Web SpeechSynthesis.
 * Avoids browser cut-off timeouts on lengthy paragraphs.
 */
function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  // Clean markdown / bullet artifacts
  const clean = text
    .replace(/[#*_`]/g, "")
    .replace(/^[•\-*]\s+/gm, "")
    .trim();

  // Split on sentence boundaries (. ! ? or newline)
  const rawChunks = clean.split(/(?<=[.!?])\s+|\n+/);
  const sentences: string[] = [];

  for (const chunk of rawChunks) {
    const trimmed = chunk.trim();
    if (trimmed.length > 0) {
      // If a sentence is very long (> 250 chars), break at commas or semicolons
      if (trimmed.length > 250) {
        const subParts = trimmed.split(/(?<=[,;])\s+/);
        for (const sub of subParts) {
          const subTrimmed = sub.trim();
          if (subTrimmed.length > 0) sentences.push(subTrimmed);
        }
      } else {
        sentences.push(trimmed);
      }
    }
  }

  return sentences.length > 0 ? sentences : [clean];
}

export function useSpeechSynthesis(initialLang: Language = "en"): SpeechSynthesisHook {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRateState] = useState<number>(1.0);
  const [pitch, setPitchState] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [currentSentence, setCurrentSentence] = useState<string>("");

  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const rateRef = useRef<number>(1.0);
  const pitchRef = useRef<number>(1.0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const langRef = useRef<Language>(initialLang);

  sentencesRef.current = sentences;
  currentIndexRef.current = currentSentenceIndex;
  isPlayingRef.current = isPlaying;
  rateRef.current = rate;
  pitchRef.current = pitch;
  voiceRef.current = selectedVoice;
  langRef.current = initialLang;

  // Initialize SpeechSynthesis and load voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Auto-select a matching voice for initial language if none chosen
        if (!voiceRef.current && availableVoices.length > 0) {
          const langCode =
            initialLang === "hi" ? "hi" : initialLang === "ur" ? "ur" : "en";
          const matched = availableVoices.find(
            (v) =>
              v.lang.toLowerCase().startsWith(langCode) ||
              (langCode === "en" && v.lang.toLowerCase().includes("en"))
          );
          if (matched) {
            setSelectedVoice(matched);
          }
        }
      };

      updateVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    } else {
      setIsSupported(false);
    }
  }, [initialLang]);

  // Play a specific sentence index from sentencesRef
  const playSentenceAtIndex = useCallback((index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const allSentences = sentencesRef.current;
    if (index < 0 || index >= allSentences.length) {
      // Completed reading all sentences
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIndex(0);
      setCurrentSentence("");
      return;
    }

    window.speechSynthesis.cancel();

    const textToRead = allSentences[index];
    setCurrentSentenceIndex(index);
    setCurrentSentence(textToRead);
    setIsPlaying(true);
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rateRef.current;
    utterance.pitch = pitchRef.current;

    // Determine language tag
    const lang = langRef.current;
    if (lang === "hi") {
      utterance.lang = "hi-IN";
    } else if (lang === "ur") {
      utterance.lang = "ur-PK";
    } else {
      utterance.lang = "en-US";
    }

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        const nextIdx = index + 1;
        if (nextIdx < allSentences.length) {
          playSentenceAtIndex(nextIdx);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentSentenceIndex(0);
          setCurrentSentence("");
        }
      }
    };

    utterance.onerror = (e) => {
      // If error is canceled/interrupted, don't cascade errors
      if (e.error === "canceled" || e.error === "interrupted") {
        return;
      }
      console.warn("SpeechSynthesis error:", e.error);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Public Speak method
  const speak = useCallback(
    (text: string, lang?: Language) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        console.warn("SpeechSynthesis is not supported in this environment.");
        return;
      }

      if (lang) {
        langRef.current = lang;
      }

      const chunks = splitIntoSentences(text);
      if (chunks.length === 0) return;

      setSentences(chunks);
      sentencesRef.current = chunks;
      setCurrentSentenceIndex(0);
      setIsPlaying(true);
      setIsPaused(false);

      playSentenceAtIndex(0);
    },
    [playSentenceAtIndex]
  );

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIndex(0);
      setCurrentSentence("");
    }
  }, []);

  const skipNext = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < sentencesRef.current.length) {
      playSentenceAtIndex(nextIdx);
    } else {
      stop();
    }
  }, [playSentenceAtIndex, stop]);

  const skipPrevious = useCallback(() => {
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    playSentenceAtIndex(prevIdx);
  }, [playSentenceAtIndex]);

  const replay = useCallback(() => {
    if (sentencesRef.current.length > 0) {
      playSentenceAtIndex(0);
    }
  }, [playSentenceAtIndex]);

  const setRate = useCallback(
    (newRate: number) => {
      setRateState(newRate);
      rateRef.current = newRate;
      // If currently playing, replay current sentence with new rate smoothly
      if (isPlayingRef.current && !isPaused) {
        playSentenceAtIndex(currentIndexRef.current);
      }
    },
    [isPaused, playSentenceAtIndex]
  );

  const setPitch = useCallback((newPitch: number) => {
    setPitchState(newPitch);
    pitchRef.current = newPitch;
  }, []);

  const totalSentences = sentences.length;
  const progressPercent =
    totalSentences > 0
      ? Math.round(((currentSentenceIndex + 1) / totalSentences) * 100)
      : 0;

  return {
    isSupported,
    isPlaying,
    isPaused,
    rate,
    setRate,
    pitch,
    setPitch,
    voices,
    selectedVoice,
    setSelectedVoice,
    currentSentence,
    currentSentenceIndex,
    totalSentences,
    progressPercent,
    speak,
    pause,
    resume,
    stop,
    skipNext,
    skipPrevious,
    replay,
  };
}
