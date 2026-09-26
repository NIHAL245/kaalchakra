import React, { useCallback, useEffect, useState } from "react";
import {
    adminGetQuiz,
    adminCreateQuiz,
    adminUpdateQuiz,
    adminDeleteQuiz,
    adminGetForts,
    errMessage,
} from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { AlertCircle, Check, Loader2, Pencil, Plus, RefreshCw, ScrollText, Trash2, X } from "lucide-react";

const GENERAL = "__general__";

const EMPTY = {
    fort_slug: GENERAL,
    prompt: "",
    options: ["", "", "", ""],
    correct_index: 0,
    explanation: "",
};

export const AdminQuizzes = () => {
    const [rows, setRows] = useState([]);
    const [forts, setForts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState(null); // id when editing
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [target, setTarget] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [q, f] = await Promise.all([adminGetQuiz(), adminGetForts()]);
            setRows(q);
            setForts(f);
        } catch (e) {
            setError(errMessage(e, "Could not load quiz questions"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const fortName = (slug) => (slug ? forts.find((f) => f.slug === slug)?.name || slug : "General");
    const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
    const setOption = (i, v) =>
        setForm((prev) => {
            const next = [...prev.options];
            next[i] = v;
            return { ...prev, options: next };
        });

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY);
        setEditorOpen(true);
    };
    const openEdit = (q) => {
        setEditing(q.id);
        const opts = Array.isArray(q.options) ? [...q.options] : [];
        while (opts.length < 2) opts.push("");
        setForm({
            fort_slug: q.fort_slug || GENERAL,
            prompt: q.prompt || "",
            options: opts,
            correct_index: q.correct_index ?? 0,
            explanation: q.explanation || "",
        });
        setEditorOpen(true);
    };

    const handleSave = async () => {
        if (!form.prompt.trim()) {
            toast.error("Question text is required");
            return;
        }
        const correctText = (form.options[form.correct_index] || "").trim();
        if (!correctText) {
            toast.error("The correct answer option cannot be empty");
            return;
        }
        const clean = form.options.map((o) => o.trim()).filter(Boolean);
        if (clean.length < 2) {
            toast.error("Provide at least two answer options");
            return;
        }
        let ci = clean.findIndex((o) => o === correctText);
        if (ci < 0) ci = 0;

        const payload = {
            fort_slug: form.fort_slug === GENERAL ? null : form.fort_slug,
            prompt: form.prompt.trim(),
            options: clean,
            correct_index: ci,
            explanation: form.explanation.trim(),
        };
        setSaving(true);
        try {
            if (editing) {
                await adminUpdateQuiz(editing, payload);
                toast.success("Question updated");
            } else {
                await adminCreateQuiz(payload);
                toast.success("Question created");
            }
            setEditorOpen(false);
            load();
        } catch (e) {
            toast.error(errMessage(e, "Could not save question"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!target) return;
        setBusy(true);
        try {
            await adminDeleteQuiz(target.id);
            toast.success("Question deleted");
            setTarget(null);
            load();
        } catch (e) {
            toast.error(errMessage(e, "Could not delete question"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4" data-testid="admin-quizzes">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-2xl font-semibold">Quiz questions</h2>
                    <p className="text-sm text-muted-foreground">{rows.length} question(s) across all forts.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={load} className="gap-1.5" data-testid="admin-quizzes-refresh">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button size="sm" onClick={openCreate} className="gap-1.5" data-testid="admin-quizzes-create-button">
                        <Plus className="h-4 w-4" /> Create question
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
                <Table data-testid="admin-quizzes-table">
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="px-4 py-3">Question</TableHead>
                            <TableHead className="px-4 py-3">Fort</TableHead>
                            <TableHead className="px-4 py-3">Correct answer</TableHead>
                            <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4} className="px-4 py-3">
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ScrollText className="h-8 w-8 opacity-40" />
                                        <p className="text-sm">No quiz questions yet.</p>
                                        <Button size="sm" onClick={openCreate} className="mt-2 gap-1.5">
                                            <Plus className="h-4 w-4" /> Create question
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((q) => (
                                <TableRow key={q.id} className="hover:bg-muted/30">
                                    <TableCell className="px-4 py-3">
                                        <div className="max-w-md truncate font-medium">{q.prompt}</div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Badge variant="secondary" className="rounded-full text-[11px]">{fortName(q.fort_slug)}</Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Check className="h-3.5 w-3.5 text-success" />
                                            <span className="max-w-[220px] truncate">{q.options?.[q.correct_index]}</span>
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEdit(q)}
                                                data-testid={`admin-quizzes-edit-${q.id}`}
                                                aria-label="Edit question"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => setTarget(q)}
                                                data-testid={`admin-quizzes-delete-${q.id}`}
                                                aria-label="Delete question"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Quiz editor */}
            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto" data-testid="admin-quiz-editor">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit question" : "Create question"}</DialogTitle>
                        <DialogDescription>Pick the correct answer using the radio on the left of each option.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Related fort</Label>
                            <Select value={form.fort_slug} onValueChange={(v) => setField("fort_slug", v)}>
                                <SelectTrigger data-testid="admin-quiz-fort-select">
                                    <SelectValue placeholder="Select a fort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={GENERAL}>General (all forts)</SelectItem>
                                    {forts.map((f) => (
                                        <SelectItem key={f.slug} value={f.slug}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Question *</Label>
                            <Textarea value={form.prompt} onChange={(e) => setField("prompt", e.target.value)} rows={2} data-testid="admin-quiz-prompt" placeholder="In which year was the fort captured?" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Answer options (select the correct one)</Label>
                            {form.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setField("correct_index", i)}
                                        aria-label={`Mark option ${i + 1} correct`}
                                        data-testid={`admin-quiz-correct-${i}`}
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                            form.correct_index === i
                                                ? "border-success bg-success text-success-foreground"
                                                : "border-border text-transparent hover:border-success/60"
                                        }`}
                                    >
                                        <Check className="h-3 w-3" />
                                    </button>
                                    <Input
                                        value={opt}
                                        onChange={(e) => setOption(i, e.target.value)}
                                        placeholder={`Option ${i + 1}`}
                                        data-testid={`admin-quiz-option-${i}`}
                                    />
                                    {form.options.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                                const next = form.options.filter((_, idx) => idx !== i);
                                                let ci = form.correct_index;
                                                if (i === ci) ci = 0;
                                                else if (i < ci) ci -= 1;
                                                setForm((prev) => ({ ...prev, options: next, correct_index: ci }));
                                            }}
                                            aria-label="Remove option"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {form.options.length < 6 && (
                                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setField("options", [...form.options, ""])} data-testid="admin-quiz-add-option">
                                    <Plus className="h-3.5 w-3.5" /> Add option
                                </Button>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Explanation</Label>
                            <Textarea value={form.explanation} onChange={(e) => setField("explanation", e.target.value)} rows={2} placeholder="Why this answer is correct." />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditorOpen(false)} data-testid="admin-quiz-editor-cancel-button">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-1.5" data-testid="admin-quiz-editor-save-button">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editing ? "Save changes" : "Create question"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the question. This action cannot be undone.</AlertDialogDescription>
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
