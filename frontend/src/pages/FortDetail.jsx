import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFort } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { ModelViewer } from "@/components/ModelViewer";
import { FortTimeline } from "@/components/FortTimeline";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { FortGallery } from "@/components/FortGallery";
import { useNarration } from "@/hooks/useNarration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    Play,
    Pause,
    Square,
    Captions,
    MapPin,
    CalendarClock,
    ScrollText,
    Crown,
    CheckCircle2,
} from "lucide-react";

export default function FortDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { lang, t } = useLanguage();
    const { data: fort, isLoading, isError } = useQuery({
        queryKey: ["fort", slug, lang],
        queryFn: () => getFort(slug, lang),
    });

    const { supported, isPlaying, isPaused, play, pause, resume, stop } = useNarration();
    const [showCaptions, setShowCaptions] = useState(true);

    if (isLoading) {
        return (
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[60vh] rounded-2xl" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-2/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }

    if (isError || !fort) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border/60 bg-card p-12 text-center">
                <p className="text-muted-foreground">{t("fort_not_found")}</p>
                <Button onClick={() => navigate("/explore")} data-testid="fort-back-to-explore">
                    {t("fort_back")}
                </Button>
            </div>
        );
    }

    const toggleNarration = () => {
        if (isPlaying && !isPaused) pause();
        else if (isPlaying && isPaused) resume();
        else play(fort.narration_text, lang);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/explore" className="inline-flex items-center gap-1 hover:text-foreground" data-testid="breadcrumb-explore">
                    <ChevronLeft className="h-4 w-4" />
                    {t("fort_all_forts")}
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                {/* AR / 3D stage */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <div className="relative h-[55vh] overflow-hidden rounded-2xl border border-border/40 bg-stage shadow-[0_30px_80px_-40px_rgba(0,0,0,0.65)] sm:h-[60vh]">
                        <ModelViewer src={fort.model_url} poster={fort.image_url} alt={`3D model of ${fort.name}`} />
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">{t("fort_model_placeholder")}</p>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="rounded-full">{fort.era}</Badge>
                        </div>
                        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight">{fort.name}</h1>
                        <p className="font-display text-xl text-muted-foreground">{fort.native_name}</p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {fort.region}</span>
                            {fort.year_founded && (
                                <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-4 w-4" /> {fort.year_founded}</span>
                            )}
                        </div>
                    </div>

                    {/* Narration controls */}
                    <Card className="rounded-xl border-border/70 bg-card p-4">
                        <div className="flex items-center gap-3">
                            <Button onClick={toggleNarration} disabled={!supported} data-testid="narration-play-button" className="gap-2 bg-brand-teal text-white hover:bg-brand-teal/90">
                                {isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                {isPlaying && !isPaused ? t("fort_pause") : isPaused ? t("fort_resume") : t("fort_play")}
                            </Button>
                            <Button variant="outline" size="icon" aria-label="Stop narration" data-testid="narration-stop-button" onClick={stop} disabled={!isPlaying}>
                                <Square className="h-4 w-4" />
                            </Button>
                            <Button variant={showCaptions ? "secondary" : "ghost"} size="icon" aria-label="Toggle captions" data-testid="narration-captions-toggle" onClick={() => setShowCaptions((s) => !s)}>
                                <Captions className="h-4 w-4" />
                            </Button>
                            {isPlaying && !isPaused && (
                                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-brand-teal">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-teal" />
                                    {t("fort_narrating")}
                                </span>
                            )}
                        </div>
                        {!supported && <p className="mt-2 text-xs text-muted-foreground">{t("fort_narr_unsupported")}</p>}
                        {showCaptions && (
                            <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm italic leading-relaxed text-foreground/90" data-testid="narration-captions">
                                {fort.narration_text}
                            </p>
                        )}
                    </Card>

                    {/* Tabs */}
                    <Tabs defaultValue="about">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="about" data-testid="tab-about">{t("fort_about")}</TabsTrigger>
                            <TabsTrigger value="timeline" data-testid="tab-timeline">{t("fort_timeline")}</TabsTrigger>
                            <TabsTrigger value="thennow" data-testid="tab-thennow">{t("fort_thennow")}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="about" className="mt-4 space-y-5">
                            <p className="text-[15px] leading-relaxed text-foreground/90">{fort.description}</p>
                            <div>
                                <h3 className="mb-2 font-display text-lg font-semibold">{t("fort_quick_facts")}</h3>
                                <ul className="space-y-2">
                                    {fort.quick_facts?.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-saffron" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TabsContent>
                        <TabsContent value="timeline" className="mt-4">
                            <FortTimeline events={fort.timeline} />
                        </TabsContent>
                        <TabsContent value="thennow" className="mt-4 space-y-3">
                            <BeforeAfterSlider
                                beforeSrc={fort.then_image_url}
                                afterSrc={fort.now_image_url || fort.image_url}
                                beforeLabel={`${t("thennow_then")} · ${t("thennow_then_label")}`}
                                afterLabel={`${t("thennow_now")} · ${t("thennow_now_label")}`}
                                hint={t("thennow_hint")}
                            />
                            <p className="text-xs text-muted-foreground">{t("thennow_ai_note")}</p>
                        </TabsContent>
                    </Tabs>

                    <Separator />

                    <div className="flex flex-wrap gap-3">
                        <Button asChild className="gap-2 bg-brand-saffron text-white hover:bg-brand-saffron/90" data-testid="fort-take-quiz-button">
                            <Link to={`/quiz/${fort.slug}`}><ScrollText className="h-4 w-4" />{t("fort_take_quiz")}</Link>
                        </Button>
                        <Button asChild variant="outline" className="gap-2" data-testid="fort-ask-king-button">
                            <Link to={`/ask?fort=${fort.slug}`}><Crown className="h-4 w-4 text-brand-saffron" />{t("fort_ask_about")}</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Photo gallery */}
            {fort.images && fort.images.length > 0 && (
                <section className="space-y-3">
                    <h2 className="font-display text-2xl font-semibold tracking-tight">{t("gallery_title")}</h2>
                    <FortGallery images={fort.images} alt={fort.name} credit={t("photo_credit")} />
                </section>
            )}
        </div>
    );
}
