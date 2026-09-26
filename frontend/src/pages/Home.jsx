import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getForts } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FortCard } from "@/components/FortCard";
import { ArrowRight, ScanLine, Volume2, Clock, ScrollText, Crown, Sparkles } from "lucide-react";

const FEATURES = [
    { icon: ScanLine, title: "feat_ar_title", body: "feat_ar_body", to: "/explore", testid: "feature-card-ar" },
    { icon: Volume2, title: "feat_narr_title", body: "feat_narr_body", to: "/explore", testid: "feature-card-narration" },
    { icon: Clock, title: "feat_timeline_title", body: "feat_timeline_body", to: "/explore", testid: "feature-card-timeline" },
    { icon: ScrollText, title: "feat_quiz_title", body: "feat_quiz_body", to: "/quiz", testid: "feature-card-quiz" },
    { icon: Crown, title: "feat_ask_title", body: "feat_ask_body", to: "/ask", testid: "feature-card-ask" },
];

const STEPS = [
    { n: "01", title: "step1_title", body: "step1_body" },
    { n: "02", title: "step2_title", body: "step2_body" },
    { n: "03", title: "step3_title", body: "step3_body" },
];

export default function Home() {
    const { lang, t } = useLanguage();
    const { data: forts = [], isLoading } = useQuery({ queryKey: ["forts", lang], queryFn: () => getForts(lang) });
    const featured = forts.slice(0, 3);

    const titlePre = <span>{t("home_title_pre")}</span>;
    const titleHi = <span className="text-brand-saffron">{t("home_title_highlight")}</span>;

    return (
        <div className="space-y-16 md:space-y-24">
            <section className="relative overflow-hidden rounded-2xl border border-border/60">
                <div className="absolute inset-0">
                    <img
                        src="/forts/rajgad.jpg"
                        alt="Rajgad fort ramparts"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-brand-teal/20" />
                </div>
                <div className="relative px-6 py-14 sm:px-10 md:py-20 lg:px-16">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                            {t("home_badge")}
                        </span>
                        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            {lang === "en" ? (<>{titlePre} {titleHi}</>) : (<>{titleHi} {titlePre}</>)}
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            {t("home_subtitle")}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild size="lg" data-testid="home-start-exploring-button" className="gap-2 bg-brand-saffron text-white hover:bg-brand-saffron/90">
                                <Link to="/explore">{t("home_start")}<ArrowRight className="h-4 w-4" /></Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" data-testid="home-ask-king-button" className="gap-2 bg-card/50 backdrop-blur">
                                <Link to="/ask"><Crown className="h-4 w-4 text-brand-saffron" />{t("home_ask")}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="mb-6">
                    <h2 className="font-display text-3xl font-semibold tracking-tight">{t("home_features_title")}</h2>
                    <p className="mt-1 text-muted-foreground">{t("home_features_subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <Link
                                key={i}
                                to={f.to}
                                data-testid={f.testid}
                                className={`group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                            >
                                <Card className="h-full rounded-xl border-border/70 bg-card p-6 shadow-[0_10px_30px_-18px_rgba(15,15,20,0.18)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-saffron/40 group-hover:shadow-[0_18px_50px_-24px_rgba(15,15,20,0.3)]">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-brand-teal transition-colors group-hover:bg-brand-saffron/15 group-hover:text-brand-saffron">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-4 flex items-center gap-1.5 font-display text-xl font-semibold">
                                        {t(f.title)}
                                        <ArrowRight className="h-4 w-4 -translate-x-1 text-brand-saffron opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(f.body)}</p>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section>
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-semibold tracking-tight">{t("home_featured_title")}</h2>
                        <p className="mt-1 text-muted-foreground">{t("home_featured_subtitle")}</p>
                    </div>
                    <Button asChild variant="ghost" className="gap-1 text-brand-saffron" data-testid="home-view-all-forts">
                        <Link to="/explore">{t("home_view_all")}<ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
                        : featured.map((fort) => <FortCard key={fort.slug} fort={fort} />)}
                </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-secondary/40 p-6 md:p-10">
                <h2 className="font-display text-3xl font-semibold tracking-tight">{t("home_how_title")}</h2>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {STEPS.map((s) => (
                        <div key={s.n} className="flex gap-4">
                            <span className="font-display text-3xl font-semibold text-brand-gold tabular-nums">{s.n}</span>
                            <div>
                                <h3 className="font-display text-lg font-semibold">{t(s.title)}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{t(s.body)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
