import React, { useCallback, useEffect, useState } from "react";
import { adminGetAnalytics, errMessage } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Landmark, ScrollText, Trophy, MessageCircle, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, suffix = "", testid, colorVar = "--brand-saffron" }) => (
    <Card data-testid={testid} className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: `hsl(var(${colorVar}) / 0.12)`, color: `hsl(var(${colorVar}))` }}
            >
                <Icon className="h-4 w-4" />
            </span>
        </CardHeader>
        <CardContent>
            <div className="font-display text-3xl font-semibold tabular-nums">
                {value}
                {suffix ? <span className="ml-0.5 text-lg text-muted-foreground">{suffix}</span> : null}
            </div>
        </CardContent>
    </Card>
);

const BarList = ({ title, data = [], colorVar = "--chart-1", testid }) => {
    const max = Math.max(1, ...data.map((d) => d.value));
    return (
        <Card data-testid={testid}>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                    data.map((d) => (
                        <div key={d.label} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="truncate">{d.label}</span>
                                <span className="shrink-0 tabular-nums font-medium text-muted-foreground">{d.value}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full"
                                    style={{ width: `${(d.value / max) * 100}%`, backgroundColor: `hsl(var(${colorVar}))` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setData(await adminGetAnalytics());
        } catch (e) {
            setError(errMessage(e, "Could not load analytics"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <div className="space-y-6" data-testid="admin-analytics-loading">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" data-testid="admin-analytics-error">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Failed to load analytics</AlertTitle>
                <AlertDescription className="flex items-center gap-3">
                    {error}
                    <Button size="sm" variant="outline" onClick={load} className="gap-1.5" data-testid="admin-analytics-retry">
                        <RefreshCw className="h-3.5 w-3.5" /> Retry
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    const c = data.counts || {};
    return (
        <div className="space-y-6" data-testid="admin-analytics">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={Landmark} label="Forts" value={c.forts ?? 0} testid="admin-analytics-fort-count" colorVar="--brand-saffron" />
                <StatCard icon={ScrollText} label="Quiz questions" value={c.quizzes ?? 0} testid="admin-analytics-quiz-count" colorVar="--brand-teal" />
                <StatCard icon={Trophy} label="Quiz attempts" value={c.attempts ?? 0} testid="admin-analytics-leaderboard-count" colorVar="--brand-gold" />
                <StatCard icon={TrendingUp} label="Avg. score" value={data.avg_percentage ?? 0} suffix="%" testid="admin-analytics-avg" colorVar="--success" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard icon={MessageCircle} label="Chat sessions" value={c.chat_sessions ?? 0} testid="admin-analytics-chat-sessions" colorVar="--info" />
                <StatCard icon={MessageCircle} label="Chat messages" value={c.chat_messages ?? 0} testid="admin-analytics-chat-messages" colorVar="--chart-5" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <BarList title="Forts by region" data={data.forts_by_region} colorVar="--chart-1" testid="admin-analytics-forts-by-region" />
                <BarList title="Badge distribution" data={data.badge_distribution} colorVar="--chart-3" testid="admin-analytics-badge-distribution" />
            </div>

            <BarList title="Quiz attempts per fort" data={data.attempts_per_fort} colorVar="--chart-2" testid="admin-analytics-attempts-per-fort" />
        </div>
    );
};
