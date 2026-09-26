import { useState, useEffect, useRef, useCallback } from "react";

const LANG_VOICE_PREFS = {
    en: ["en-IN", "en-GB", "en-US", "en"],
    hi: ["hi-IN", "hi"],
    mr: ["mr-IN", "mr", "hi-IN", "hi"],
};
const LANG_BCP47 = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };

/**
 * Text-to-speech narration using the Web Speech API (SpeechSynthesis).
 * Supports language selection; gracefully falls back if a voice is missing.
 */
export function useNarration() {
    const supported = typeof window !== "undefined" && "speechSynthesis" in window;
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!supported) return;
        const warm = () => window.speechSynthesis.getVoices();
        warm();
        window.speechSynthesis.onvoiceschanged = warm;
        return () => {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {
                /* noop */
            }
        };
    }, [supported]);

    const pickVoice = useCallback((lang) => {
        const voices = window.speechSynthesis.getVoices() || [];
        const prefs = LANG_VOICE_PREFS[lang] || LANG_VOICE_PREFS.en;
        for (const p of prefs) {
            const v = voices.find((vc) => vc.lang && vc.lang.toLowerCase().startsWith(p.toLowerCase()));
            if (v) return v;
        }
        return voices.find((v) => /^en/i.test(v.lang)) || voices[0] || null;
    }, []);

    const stop = useCallback(() => {
        if (!supported) return;
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    }, [supported]);

    const play = useCallback(
        (text, lang = "en") => {
            if (!supported || !text) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.95;
            u.pitch = 1;
            u.lang = LANG_BCP47[lang] || "en-IN";
            const v = pickVoice(lang);
            if (v) u.voice = v;
            u.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
            };
            u.onerror = () => {
                setIsPlaying(false);
                setIsPaused(false);
            };
            window.speechSynthesis.speak(u);
            setIsPlaying(true);
            setIsPaused(false);
        },
        [supported, pickVoice]
    );

    const pause = useCallback(() => {
        if (!supported) return;
        window.speechSynthesis.pause();
        setIsPaused(true);
    }, [supported]);

    const resume = useCallback(() => {
        if (!supported) return;
        window.speechSynthesis.resume();
        setIsPaused(false);
    }, [supported]);

    return { supported, isPlaying, isPaused, play, pause, resume, stop };
}
