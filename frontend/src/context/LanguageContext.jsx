import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import ui from "@/i18n/ui.json";

const LanguageContext = createContext(null);
const LANG_KEY = "kc_lang";

export const LANGUAGES = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "mr", label: "Marathi", native: "मराठी" },
];

export const LanguageProvider = ({ children }) => {
    const [lang, setLangState] = useState("en");

    useEffect(() => {
        try {
            const stored = localStorage.getItem(LANG_KEY);
            if (stored && ui[stored]) setLangState(stored);
        } catch (e) {
            /* noop */
        }
    }, []);

    const setLang = useCallback((code) => {
        if (!ui[code]) return;
        setLangState(code);
        try {
            localStorage.setItem(LANG_KEY, code);
        } catch (e) {
            /* noop */
        }
    }, []);

    const t = useCallback(
        (key, vars) => {
            const dict = ui[lang] || ui.en;
            let s = dict[key] ?? ui.en[key] ?? key;
            if (vars) {
                for (const [k, v] of Object.entries(vars)) {
                    s = s.split(`{${k}}`).join(String(v));
                }
            }
            return s;
        },
        [lang]
    );

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
    return ctx;
};
