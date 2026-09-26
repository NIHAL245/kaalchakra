import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    adminGetForts,
    adminCreateFort,
    adminUpdateFort,
    adminDeleteFort,
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
import { AlertCircle, Landmark, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";

const EMPTY = {
    slug: "",
    name: "",
    native_name: "",
    region: "",
    era: "",
    year_founded: "",
    hook: "",
    description: "",
    narration_text: "",
    image_url: "",
    model_url: "",
    now_image_url: "",
    then_image_url: "",
    lat: "",
    lng: "",
    images: [],
    quick_facts: [],
    timeline: [],
};

const fromFort = (f) => ({
    ...EMPTY,
    ...f,
    year_founded: f.year_founded ?? "",
    lat: f.lat ?? "",
    lng: f.lng ?? "",
    images: Array.isArray(f.images) ? [...f.images] : [],
    quick_facts: Array.isArray(f.quick_facts) ? [...f.quick_facts] : [],
    timeline: Array.isArray(f.timeline) ? f.timeline.map((t) => ({ ...t })) : [],
});

const Field = ({ label, children, hint, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <Label className="text-xs font-medium">{label}</Label>
        {children}
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
);

const StringRepeater = ({ label, items, onChange, placeholder, testid }) => (
    <div className="space-y-2">
        <Label className="text-xs font-medium">{label}</Label>
        <div className="space-y-2">
            {items.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                    <Input
                        value={val}
                        placeholder={placeholder}
                        onChange={(e) => {
                            const next = [...items];
                            next[i] = e.target.value;
                            onChange(next);
                        }}
                        data-testid={`${testid}-input-${i}`}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                        aria-label="Remove item"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onChange([...items, ""])} data-testid={`${testid}-add`}>
            <Plus className="h-3.5 w-3.5" /> Add
        </Button>
    </div>
);

const TimelineRepeater = ({ items, onChange }) => (
    <div className="space-y-2">
        <Label className="text-xs font-medium">Timeline events</Label>
        <div className="space-y-3">
            {items.map((ev, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Event {i + 1}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                            aria-label="Remove event"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr]">
                        <Input
                            value={ev.year || ""}
                            placeholder="Year"
                            className="font-mono tabular-nums"
                            onChange={(e) => {
                                const next = [...items];
                                next[i] = { ...next[i], year: e.target.value };
                                onChange(next);
                            }}
                        />
                        <Input
                            value={ev.title || ""}
                            placeholder="Title"
                            onChange={(e) => {
                                const next = [...items];
                                next[i] = { ...next[i], title: e.target.value };
                                onChange(next);
                            }}
                        />
                    </div>
                    <Textarea
                        value={ev.body || ""}
                        placeholder="What happened…"
                        rows={2}
                        onChange={(e) => {
                            const next = [...items];
                            next[i] = { ...next[i], body: e.target.value };
                            onChange(next);
                        }}
                    />
                </div>
            ))}
        </div>
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onChange([...items, { year: "", title: "", body: "" }])}
            data-testid="admin-fort-timeline-add"
        >
            <Plus className="h-3.5 w-3.5" /> Add event
        </Button>
    </div>
);

export const AdminForts = () => {
    const [forts, setForts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState(null); // slug when editing, null when creating
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [target, setTarget] = useState(null); // fort to delete
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setForts(await adminGetForts());
        } catch (e) {
            setError(errMessage(e, "Could not load forts"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY);
        setEditorOpen(true);
    };
    const openEdit = (fort) => {
        setEditing(fort.slug);
        setForm(fromFort(fort));
        setEditorOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error("Fort name is required");
            return;
        }
        if (!editing && !form.slug.trim()) {
            toast.error("Slug is required");
            return;
        }
        const payload = {
            slug: (form.slug || "").trim().toLowerCase(),
            name: form.name.trim(),
            native_name: form.native_name.trim(),
            region: form.region.trim(),
            era: form.era.trim(),
            year_founded: form.year_founded === "" ? null : Number(form.year_founded),
            hook: form.hook.trim(),
            description: form.description.trim(),
            narration_text: form.narration_text.trim(),
            image_url: form.image_url.trim(),
            model_url: form.model_url.trim(),
            now_image_url: form.now_image_url.trim(),
            then_image_url: form.then_image_url.trim(),
            lat: form.lat === "" ? null : Number(form.lat),
            lng: form.lng === "" ? null : Number(form.lng),
            images: form.images.map((s) => s.trim()).filter(Boolean),
            quick_facts: form.quick_facts.map((s) => s.trim()).filter(Boolean),
            timeline: form.timeline
                .map((ev) => ({ year: (ev.year || "").trim(), title: (ev.title || "").trim(), body: (ev.body || "").trim() }))
                .filter((ev) => ev.year || ev.title || ev.body),
        };
        setSaving(true);
        try {
            if (editing) {
                await adminUpdateFort(editing, payload);
                toast.success(`"${payload.name}" updated`);
            } else {
                await adminCreateFort(payload);
                toast.success(`"${payload.name}" created`);
            }
            setEditorOpen(false);
            load();
        } catch (e) {
            toast.error(errMessage(e, "Could not save fort"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!target) return;
        setBusy(true);
        try {
            await adminDeleteFort(target.slug);
            toast.success(`"${target.name}" deleted`);
            setTarget(null);
            load();
        } catch (e) {
            toast.error(errMessage(e, "Could not delete fort"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4" data-testid="admin-forts">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-2xl font-semibold">Forts</h2>
                    <p className="text-sm text-muted-foreground">{forts.length} fort(s). Changes appear instantly in the app.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={load} className="gap-1.5" data-testid="admin-forts-refresh">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button size="sm" onClick={openCreate} className="gap-1.5" data-testid="admin-forts-create-button">
                        <Plus className="h-4 w-4" /> Create fort
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
                <Table data-testid="admin-forts-table">
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="px-4 py-3">Fort</TableHead>
                            <TableHead className="px-4 py-3">Region</TableHead>
                            <TableHead className="px-4 py-3">Era</TableHead>
                            <TableHead className="px-4 py-3">Slug</TableHead>
                            <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5} className="px-4 py-3">
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : forts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Landmark className="h-8 w-8 opacity-40" />
                                        <p className="text-sm">No forts yet. Create your first fort to populate the Explore map.</p>
                                        <Button size="sm" onClick={openCreate} className="mt-2 gap-1.5">
                                            <Plus className="h-4 w-4" /> Create fort
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            forts.map((f) => (
                                <TableRow key={f.slug} className="hover:bg-muted/30">
                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                                                {f.image_url ? (
                                                    <img src={f.image_url} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                                                ) : null}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">{f.name}</div>
                                                <div className="truncate text-xs text-muted-foreground">{f.native_name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">{f.region}</TableCell>
                                    <TableCell className="px-4 py-3">
                                        {f.era ? <Badge variant="secondary" className="rounded-full text-[11px]">{f.era}</Badge> : null}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{f.slug}</code>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEdit(f)}
                                                data-testid={`admin-forts-edit-${f.slug}`}
                                                aria-label={`Edit ${f.name}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => setTarget(f)}
                                                data-testid={`admin-forts-delete-${f.slug}`}
                                                aria-label={`Delete ${f.name}`}
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

            {/* Fort editor */}
            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto" data-testid="admin-fort-editor">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit fort" : "Create fort"}</DialogTitle>
                        <DialogDescription>
                            {editing ? "Update the details for this fort." : "Add a new fort to the collection."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
                        <Field label="Name *">
                            <Input value={form.name} onChange={(e) => setField("name", e.target.value)} data-testid="admin-fort-name" placeholder="Shivneri" />
                        </Field>
                        <Field label="Native name">
                            <Input value={form.native_name} onChange={(e) => setField("native_name", e.target.value)} placeholder="शिवनेरी" />
                        </Field>
                        <Field label="Slug *" hint={editing ? "Slug cannot be changed after creation." : "lowercase-with-hyphens"}>
                            <Input
                                value={form.slug}
                                onChange={(e) => setField("slug", e.target.value)}
                                disabled={!!editing}
                                data-testid="admin-fort-slug"
                                placeholder="shivneri"
                                className="font-mono"
                            />
                        </Field>
                        <Field label="Era">
                            <Input value={form.era} onChange={(e) => setField("era", e.target.value)} placeholder="Birthplace · 1630" />
                        </Field>
                        <Field label="Region">
                            <Input value={form.region} onChange={(e) => setField("region", e.target.value)} placeholder="Junnar, Pune district" />
                        </Field>
                        <Field label="Year founded">
                            <Input type="number" value={form.year_founded} onChange={(e) => setField("year_founded", e.target.value)} placeholder="1630" className="tabular-nums" />
                        </Field>
                        <Field label="Latitude">
                            <Input type="number" value={form.lat} onChange={(e) => setField("lat", e.target.value)} placeholder="19.1969" className="font-mono tabular-nums" />
                        </Field>
                        <Field label="Longitude">
                            <Input type="number" value={form.lng} onChange={(e) => setField("lng", e.target.value)} placeholder="73.8556" className="font-mono tabular-nums" />
                        </Field>
                        <Field label="Hook (short summary)" className="sm:col-span-2">
                            <Textarea value={form.hook} onChange={(e) => setField("hook", e.target.value)} rows={2} placeholder="The hill fort where Chhatrapati Shivaji Maharaj was born." />
                        </Field>
                        <Field label="Description" className="sm:col-span-2">
                            <Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} />
                        </Field>
                        <Field label="Narration text" className="sm:col-span-2">
                            <Textarea value={form.narration_text} onChange={(e) => setField("narration_text", e.target.value)} rows={3} />
                        </Field>
                        <Field label="Cover image URL">
                            <Input value={form.image_url} onChange={(e) => setField("image_url", e.target.value)} placeholder="/forts/shivneri.jpg" />
                        </Field>
                        <Field label="3D model URL (.glb)">
                            <Input value={form.model_url} onChange={(e) => setField("model_url", e.target.value)} placeholder="/models/fort-keep.glb" />
                        </Field>
                        <Field label="'Now' image URL">
                            <Input value={form.now_image_url} onChange={(e) => setField("now_image_url", e.target.value)} placeholder="/forts/shivneri.jpg" />
                        </Field>
                        <Field label="'Then' image URL">
                            <Input value={form.then_image_url} onChange={(e) => setField("then_image_url", e.target.value)} placeholder="/reconstructions/shivneri.jpg" />
                        </Field>
                        <div className="sm:col-span-2">
                            <StringRepeater label="Gallery image URLs" items={form.images} onChange={(v) => setField("images", v)} placeholder="/forts/shivneri-2.jpg" testid="admin-fort-images" />
                        </div>
                        <div className="sm:col-span-2">
                            <StringRepeater label="Quick facts" items={form.quick_facts} onChange={(v) => setField("quick_facts", v)} placeholder="Birthplace of Shivaji Maharaj" testid="admin-fort-quickfacts" />
                        </div>
                        <div className="sm:col-span-2">
                            <TimelineRepeater items={form.timeline} onChange={(v) => setField("timeline", v)} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditorOpen(false)} data-testid="admin-fort-editor-cancel-button">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-1.5" data-testid="admin-fort-editor-save-button">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editing ? "Save changes" : "Create fort"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{target?.name}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes the fort and its quiz questions permanently. This action cannot be undone.
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
