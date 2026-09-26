import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Trophy, ScrollText, Medal, Award } from "lucide-react";

const BADGE_CLS = {
    Gold: "bg-brand-gold/15 text-brand-gold",
    Silver: "bg-slate-300/20 text-slate-500 dark:text-slate-300",
    Bronze: "bg-amber-600/15 text-amber-700 dark:text-amber-500",
    "Keep Learning": "bg-brand-teal/15 text-brand-teal",
};
const badgeKey = (b) => "badge_" + (b || "").replace(/\s/g, "");

function RankMedal({ rank }) {
    if (rank === 1) return <Trophy className="h-5 w-5 text-brand-gold" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">{rank}</span>;
}

export default function Leaderboard() {
    const { t } = useLanguage();
    const { data: entries = [], isLoading } = useQuery({
        queryKey: ["leaderboard"],
        queryFn: () => getLeaderboard({ scope: "global", limit: 20 }),
    });

    const fortName = (e) => (e.fort_slug ? e.fort_name : t("general"));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold"><Trophy className="h-5 w-5" /></span>
                <div>
                    <h1 className="font-display text-3xl font-semibold tracking-tight">{t("lb_title")}</h1>
                    <p className="text-muted-foreground">{t("lb_subtitle")}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
            ) : entries.length === 0 ? (
                <Card className="flex flex-col items-center gap-4 rounded-2xl border-border/70 p-12 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-brand-teal"><ScrollText className="h-7 w-7" /></span>
                    <div>
                        <h2 className="font-display text-xl font-semibold">{t("lb_empty_title")}</h2>
                        <p className="text-muted-foreground">{t("lb_empty_body")}</p>
                    </div>
                    <Button asChild className="gap-2 bg-brand-saffron text-white hover:bg-brand-saffron/90" data-testid="leaderboard-take-quiz-button">
                        <Link to="/quiz"><ScrollText className="h-4 w-4" /> {t("lb_take_quiz")}</Link>
                    </Button>
                </Card>
            ) : (
                <>
                    <Card className="hidden overflow-hidden rounded-2xl border-border/70 md:block">
                        <Table data-testid="leaderboard-table">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">{t("lb_rank")}</TableHead>
                                    <TableHead>{t("lb_player")}</TableHead>
                                    <TableHead>{t("lb_quiz")}</TableHead>
                                    <TableHead className="text-center">{t("lb_score")}</TableHead>
                                    <TableHead className="text-center">%</TableHead>
                                    <TableHead className="text-right">{t("lb_badge")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((e, i) => (
                                    <TableRow key={i} className={cn(i < 3 && "bg-brand-gold/5")} data-testid={`leaderboard-row-${i}`}>
                                        <TableCell className="text-center"><span className="flex justify-center"><RankMedal rank={i + 1} /></span></TableCell>
                                        <TableCell className="font-medium">{e.player_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{fortName(e)}</TableCell>
                                        <TableCell className="text-center tabular-nums">{e.score}/{e.total}</TableCell>
                                        <TableCell className="text-center tabular-nums">{e.percentage}%</TableCell>
                                        <TableCell className="text-right"><Badge variant="secondary" className={cn("rounded-full", BADGE_CLS[e.badge])}>{t(badgeKey(e.badge))}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    <div className="space-y-2 md:hidden" data-testid="leaderboard-cards">
                        {entries.map((e, i) => (
                            <Card key={i} className={cn("flex items-center gap-3 rounded-xl border-border/70 p-3", i < 3 && "bg-brand-gold/5")}>
                                <span className="flex h-9 w-9 items-center justify-center"><RankMedal rank={i + 1} /></span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{e.player_name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{fortName(e)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold tabular-nums">{e.score}/{e.total}</p>
                                    <Badge variant="secondary" className={cn("rounded-full text-[10px]", BADGE_CLS[e.badge])}>{t(badgeKey(e.badge))}</Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
