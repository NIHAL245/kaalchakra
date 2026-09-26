import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getForts } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { FortCard } from "@/components/FortCard";
import { FortMap } from "@/components/FortMap";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Landmark, RefreshCw, MapPin } from "lucide-react";

export default function Explore() {
    const { lang, t } = useLanguage();
    const { data: forts = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["forts", lang],
        queryFn: () => getForts(lang),
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-brand-teal">
                    <Landmark className="h-5 w-5" />
                </span>
                <div>
                    <h1 className="font-display text-3xl font-semibold tracking-tight">{t("explore_title")}</h1>
                    <p className="text-muted-foreground">{t("explore_subtitle")}</p>
                </div>
            </div>

            {isError && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-10 text-center">
                    <p className="text-sm text-muted-foreground">{t("explore_error")}</p>
                    <Button variant="outline" onClick={() => refetch()} className="gap-2" data-testid="explore-retry-button">
                        <RefreshCw className="h-4 w-4" /> {t("retry")}
                    </Button>
                </div>
            )}

            {/* Interactive Sahyadri map */}
            {!isLoading && !isError && forts.length > 0 && (
                <section className="space-y-3" data-testid="fort-map-section">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-brand-saffron" />
                        <div>
                            <h2 className="font-display text-2xl font-semibold tracking-tight">{t("map_title")}</h2>
                            <p className="text-sm text-muted-foreground">{t("map_subtitle")}</p>
                        </div>
                    </div>
                    <FortMap
                        forts={forts}
                        viewLabel={t("map_view_fort")}
                        className="h-[380px] w-full overflow-hidden rounded-2xl border border-border/60 shadow-[0_20px_60px_-34px_rgba(15,15,20,0.35)] md:h-[440px]"
                    />
                </section>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6" data-testid="fort-gallery-grid">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
                    : forts.map((fort) => <FortCard key={fort.slug} fort={fort} />)}
            </div>

            {!isLoading && !isError && forts.length === 0 && (
                <div className="rounded-xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
                    {t("explore_empty")}
                </div>
            )}
        </div>
    );
}
