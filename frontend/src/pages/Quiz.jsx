import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFortQuiz, getGeneralQuiz, getFort, submitQuiz } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ScrollText, ChevronRight, Trophy, Award, Medal, RotateCcw, CheckCircle2, XCircle, Crown, User } from "lucide-react";

const BADGE_META = {
    Gold: { icon: Trophy, cls: "text-brand-gold", ring: "ring-brand-gold/40", bg: "bg-brand-gold/15" },
    Silver: { icon: Medal, cls: "text-slate-400", ring: "ring-slate-300/40", bg: "bg-slate-300/15" },
    Bronze: { icon: Award, cls: "text-amber-700", ring: "ring-amber-600/40", bg: "bg-amber-600/15" },
    "Keep Learning": { icon: ScrollText, cls: "text-brand-teal", ring: "ring-brand-teal/40", bg: "bg-brand-teal/15" },
};

const badgeKey = (b) => "badge_" + (b || "").replace(/\s/g, "");

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function Quiz() {
    const { slug } = useParams();
    const { name, requireName } = usePlayer();
    const { lang, t } = useLanguage();

    const { data: rawQuestions = [], isLoading } = useQuery({
        queryKey: ["quiz", slug || "general", lang],
        queryFn: () => (slug ? getFortQuiz(slug, lang) : getGeneralQuiz(lang)),
    });
    const { data: fort } = useQuery({
        queryKey: ["fort", slug, lang],
        queryFn: () => getFort(slug, lang),
        enabled: !!slug,
    });

    const questions = useMemo(() => {
        if (!rawQuestions.length) return [];
        const shuffled = shuffle(rawQuestions);
        return slug ? shuffled : shuffled.slice(0, 8);
    }, [rawQuestions, slug]);

    const [phase, setPhase] = useState("intro");
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const start = () => {
        requireName(() => {
            setAnswers({});
            setCurrent(0);
            setResult(null);
            setPhase("playing");
        });
    };

    const q = questions[current];
    const selected = q ? answers[q.id] : undefined;
    const progress = questions.length ? Math.round((current / questions.length) * 100) : 0;

    const choose = (idx) => {
        if (!q) return;
        setAnswers((a) => ({ ...a, [q.id]: idx }));
    };

    const next = async () => {
        if (current < questions.length - 1) {
            setCurrent((c) => c + 1);
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                player_name: name,
                fort_slug: slug || null,
                lang,
                answers: questions.map((qq) => ({ question_id: qq.id, selected_index: answers[qq.id] ?? -1 })),
            };
            const res = await submitQuiz(payload);
            setResult(res);
            setPhase("result");
        } catch (e) {
            toast.error(t("quiz_submit_error"), { description: t("quiz_submit_error_desc") });
        } finally {
            setSubmitting(false);
        }
    };

    const restart = () => {
        setPhase("intro");
        setAnswers({});
        setCurrent(0);
        setResult(null);
    };

    const title = slug && fort ? t("quiz_title_fort", { fort: fort.name }) : t("quiz_title_general");

    if (phase === "intro") {
        return (
            <div className="mx-auto max-w-2xl">
                <Card className="overflow-hidden rounded-2xl border-border/70">
                    <div className="relative bg-secondary/50 p-8 text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-saffron/15 text-brand-saffron">
                            <ScrollText className="h-7 w-7" />
                        </span>
                        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">{title}</h1>
                        <p className="mt-2 text-muted-foreground">
                            {isLoading ? t("quiz_preparing") : t("quiz_count", { count: questions.length })}
                        </p>
                        {name && (
                            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm text-muted-foreground">
                                <User className="h-3.5 w-3.5" /> {t("quiz_playing_as")} <strong className="text-foreground">{name}</strong>
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
                        <Button size="lg" disabled={isLoading || questions.length === 0} onClick={start} data-testid="quiz-start-button" className="gap-2 bg-brand-saffron text-white hover:bg-brand-saffron/90">
                            {t("quiz_start")}<ChevronRight className="h-4 w-4" />
                        </Button>
                        {slug && (
                            <Button asChild size="lg" variant="outline"><Link to={`/fort/${slug}`}>{t("quiz_back_fort")}</Link></Button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    if (phase === "playing") {
        if (!q) return <Skeleton className="h-64 w-full rounded-2xl" />;
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                        <span data-testid="quiz-progress-label">{t("quiz_qprogress", { current: current + 1, total: questions.length })}</span>
                        <span className="tabular-nums">{t("quiz_answered", { count: Object.keys(answers).length })}</span>
                    </div>
                    <Progress value={progress} className="h-2" data-testid="quiz-progress-bar" />
                </div>

                <Card className="rounded-2xl border-border/70 p-6">
                    <h2 className="font-display text-2xl font-semibold leading-snug" data-testid="quiz-question-prompt">{q.prompt}</h2>
                    <div className="mt-5 space-y-3">
                        {q.options.map((opt, i) => {
                            const isSel = selected === i;
                            return (
                                <button key={i} type="button" data-testid={`quiz-answer-option-${i}`} onClick={() => choose(i)}
                                    className={cn("flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[15px] transition-colors",
                                        isSel ? "border-brand-saffron bg-brand-saffron/10 text-foreground" : "border-border/70 bg-card hover:bg-secondary/50")}>
                                    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                                        isSel ? "border-brand-saffron bg-brand-saffron text-white" : "border-border text-muted-foreground")}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg" disabled={selected === undefined || submitting} onClick={next} data-testid="quiz-next-button" className="gap-2 bg-brand-saffron text-white hover:bg-brand-saffron/90">
                        {current < questions.length - 1 ? t("quiz_next") : submitting ? t("quiz_submitting") : t("quiz_finish")}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    const meta = BADGE_META[result?.badge] || BADGE_META["Keep Learning"];
    const BadgeIcon = meta.icon;
    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Card className="overflow-hidden rounded-2xl border-border/70">
                <div className="flex flex-col items-center gap-4 bg-secondary/50 p-8 text-center">
                    <span className={cn("flex h-20 w-20 items-center justify-center rounded-full ring-4", meta.bg, meta.ring)}>
                        <BadgeIcon className={cn("h-10 w-10", meta.cls)} />
                    </span>
                    <div>
                        <p className="text-sm uppercase tracking-widest text-muted-foreground">{t("quiz_your_badge")}</p>
                        <h1 className="font-display text-3xl font-semibold" data-testid="quiz-badge-value">{t(badgeKey(result.badge))}</h1>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-display text-5xl font-semibold tabular-nums text-foreground" data-testid="quiz-score-value">{result.score}/{result.total}</span>
                        <span className="text-lg text-muted-foreground tabular-nums">({result.percentage}%)</span>
                    </div>
                </div>
                <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
                    <Button asChild className="gap-2 bg-brand-saffron text-white hover:bg-brand-saffron/90" data-testid="quiz-view-leaderboard-button">
                        <Link to="/leaderboard"><Trophy className="h-4 w-4" /> {t("quiz_view_leaderboard")}</Link>
                    </Button>
                    <Button variant="outline" onClick={restart} className="gap-2" data-testid="quiz-restart-button">
                        <RotateCcw className="h-4 w-4" /> {t("quiz_try_again")}
                    </Button>
                    <Button asChild variant="ghost" className="gap-2"><Link to="/ask"><Crown className="h-4 w-4 text-brand-saffron" /> {t("nav_ask")}</Link></Button>
                </div>
            </Card>

            <div>
                <h2 className="mb-3 font-display text-2xl font-semibold">{t("quiz_review_title")}</h2>
                <Accordion type="single" collapsible className="space-y-2" data-testid="quiz-review">
                    {result.details.map((d, i) => (
                        <AccordionItem key={d.question_id} value={`q-${i}`} className="rounded-xl border border-border/70 bg-card px-4">
                            <AccordionTrigger className="gap-3 text-left hover:no-underline">
                                <span className="flex items-center gap-2">
                                    {d.is_correct ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <XCircle className="h-5 w-5 shrink-0 text-destructive" />}
                                    <span className="text-[15px] font-medium">{d.prompt}</span>
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 pb-4">
                                <p className="text-sm"><span className="text-muted-foreground">{t("quiz_correct_answer")} </span><span className="font-medium text-success">{d.options[d.correct_index]}</span></p>
                                {!d.is_correct && d.selected_index >= 0 && (
                                    <p className="text-sm"><span className="text-muted-foreground">{t("quiz_your_answer")} </span><span className="font-medium text-destructive">{d.options[d.selected_index]}</span></p>
                                )}
                                <p className="rounded-lg bg-secondary/50 p-3 text-sm text-foreground/90">{d.explanation}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
