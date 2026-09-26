import React, { useCallback, useEffect, useState } from "react";
import {
    adminGetLeaderboard,
    adminClearLeaderboard,
    adminDeleteAttempt,
    errMessage,
} from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, Trash2, Trophy } from "lucide-react";

const badgeClass = (badge) => {
    switch (badge) {
        case "Gold":
            return "bg-brand-gold/20 text-brand-ink border-brand-gold/40";
        case "Silver":
            return "bg-secondary text-secondary-foreground";
        case "Bronze":
            return "bg-warning/15 text-warning border-warning/30";
        default:
            return "bg-muted text-muted-foreground";
    }
};

const fmtDate = (iso) => {
    if (!iso) return "\u2014";
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
};

export const AdminLeaderboard = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [clearOpen, setClearOpen] = useState(false);
    const [target, setTarget] = useState(null); // attempt to delete
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setRows(await adminGetLeaderboard());
        } catch (e) {
            setError(errMessage(e, "Could not load leaderboard"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleClear = async () => {
        setBusy(true);
        try {
            const res = await adminClearLeaderboard();
            toast.success(`Leaderboard cleared (${res.deleted} entries removed)`);
            setClearOpen(false);
            load();
        } catch (e) {
            toast.error(errMessage(e, "Could not clear leaderboard"));
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!target) return;
        setBusy(true);
        try {
            await adminDeleteAttempt(target.id);
            toast.success("Entry removed");
            setTarget(null);
            load();
        } catch (e) {
            toast.error(errMessage(e, "Could not remove entry"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4" data-testid="admin-leaderboard">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-2xl font-semibold">Leaderboard</h2>
                    <p className="text-sm text-muted-foreground">{rows.length} quiz attempt(s) recorded.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={load} className="gap-1.5" data-testid="admin-leaderboard-refresh">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setClearOpen(true)}
                        disabled={rows.length === 0}
                        className="gap-1.5"
                        data-testid="admin-leaderboard-clear-button"
                    >
                        <Trash2 className="h-4 w-4" /> Clear all
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Failed to load</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table data-testid="admin-leaderboard-table">
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="px-4 py-3">Player</TableHead>
                            <TableHead className="px-4 py-3">Quiz</TableHead>
                            <TableHead className="px-4 py-3">Score</TableHead>
                            <TableHead className="px-4 py-3">%</TableHead>
                            <TableHead className="px-4 py-3">Badge</TableHead>
                            <TableHead className="px-4 py-3">Date</TableHead>
                            <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7} className="px-4 py-3">
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Trophy className="h-8 w-8 opacity-40" />
                                        <p className="text-sm">No quiz attempts yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((r) => (
                                <TableRow key={r.id} className="hover:bg-muted/30">
                                    <TableCell className="px-4 py-3 font-medium">{r.player_name}</TableCell>
                                    <TableCell className="px-4 py-3 text-muted-foreground">{r.fort_name || "General"}</TableCell>
                                    <TableCell className="px-4 py-3 tabular-nums">{r.score}/{r.total}</TableCell>
                                    <TableCell className="px-4 py-3 tabular-nums">{r.percentage}%</TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Badge variant="outline" className={badgeClass(r.badge)}>{r.badge}</Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(r.created_at)}</TableCell>
                                    <TableCell className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => setTarget(r)}
                                            data-testid={`admin-leaderboard-delete-${r.id}`}
                                            aria-label={`Delete ${r.player_name}'s entry`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Clear-all confirmation */}
            <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear the entire leaderboard?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes all {rows.length} quiz attempt(s). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleClear();
                            }}
                            disabled={busy}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="admin-leaderboard-clear-confirm-button"
                        >
                            Clear all
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Single row delete confirmation */}
            <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete {target?.player_name}&apos;s attempt ({target?.score}/{target?.total}). This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={busy}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="admin-confirm-delete-button"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
