import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { getChatHistory, streamChat } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Crown, Send, Sparkles, Loader2 } from "lucide-react";

export default function AskTheKing() {
    const { sessionId } = usePlayer();
    const { lang, t } = useLanguage();
    const [searchParams] = useSearchParams();
    const fortSlug = searchParams.get("fort");

    const quickPrompts = [t("ask_qp1"), t("ask_qp2"), t("ask_qp3"), t("ask_qp4")];

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const scrollRef = useRef(null);
    const controllerRef = useRef(null);

    useEffect(() => {
        if (!sessionId) return;
        getChatHistory(sessionId)
            .then((h) => setMessages(h.map((m) => ({ role: m.role, content: m.content }))))
            .catch(() => {});
    }, [sessionId]);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const send = (text) => {
        const msg = (text ?? input).trim();
        if (!msg || streaming || !sessionId) return;
        setInput("");
        setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
        setStreaming(true);
        controllerRef.current = streamChat({
            sessionId,
            message: msg,
            fortSlug,
            lang,
            onDelta: (delta) => {
                setMessages((m) => {
                    const copy = [...m];
                    copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + delta };
                    return copy;
                });
            },
            onDone: () => setStreaming(false),
            onError: (err) => {
                setStreaming(false);
                setMessages((m) => {
                    const copy = [...m];
                    if (copy[copy.length - 1].role === "assistant" && !copy[copy.length - 1].content) copy.pop();
                    return copy;
                });
                toast.error(t("ask_error_title"), { description: t("ask_error_desc") });
            },
        });
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const empty = messages.length === 0;

    return (
        <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-3xl flex-col md:h-[calc(100vh-8rem)]">
            <div className="flex items-center gap-3 pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-saffron/15 text-brand-saffron"><Crown className="h-5 w-5" /></span>
                <div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight">{t("ask_title")}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t("ask_subtitle")}{fortSlug ? ` · ${t("ask_focused", { fort: fortSlug })}` : ""}
                    </p>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border/60 bg-card/40 p-4" data-testid="chat-messages">
                {empty ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-saffron/15 text-brand-saffron"><Crown className="h-8 w-8" /></span>
                        <div>
                            <h2 className="font-display text-xl font-semibold">{t("ask_namaskar")}</h2>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t("ask_empty_body")}</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {quickPrompts.map((p, i) => (
                                <button key={i} type="button" data-testid={`chat-quick-prompt-${i}`} onClick={() => send(p)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm text-foreground/90 transition-colors hover:border-brand-saffron/50 hover:bg-brand-saffron/5">
                                    <Sparkles className="h-3.5 w-3.5 text-brand-gold" />{p}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")} data-testid={`chat-message-${m.role}`}>
                            <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                                m.role === "user" ? "rounded-br-sm bg-brand-ink text-brand-parchment" : "rounded-bl-sm border border-border/60 bg-card text-foreground")}>
                                {m.content ? <p className="whitespace-pre-wrap">{m.content}</p> : (
                                    <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {t("ask_thinking")}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="pt-3">
                <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-card p-2">
                    <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder={t("ask_placeholder")} rows={1}
                        data-testid="chat-composer-input" className="max-h-32 min-h-[44px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" />
                    <Button size="icon" disabled={!input.trim() || streaming} onClick={() => send()} data-testid="chat-send-button"
                        className="h-11 w-11 shrink-0 rounded-xl bg-brand-saffron text-white hover:bg-brand-saffron/90" aria-label="Send message">
                        {streaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">{t("ask_disclaimer")}</p>
            </div>
        </div>
    );
}
