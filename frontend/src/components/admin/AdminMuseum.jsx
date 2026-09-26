import React, { useCallback, useEffect, useMemo, useState } from "react";
import { adminCreateMuseumItem, adminDeleteMuseumItem, adminGetMuseum, adminUpdateMuseumItem, errMessage } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertCircle, Gem, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

const CATEGORIES = [
    { slug: "kings", label: "Kings" },
    { slug: "weapons", label: "Weapons" },
    { slug: "coins", label: "Coins" },
    { slug: "artifacts", label: "Artifacts" },
];

const EMPTY = {
    slug: "", category: "kings", name: "", native_name: "", era: "", hook: "", description: "",
    quick_facts: "", image_url: "", images: "", model_url: "", order: "0",
    hi: { name: "", native_name: "", era: "", hook: "", description: "", quick_facts: "" },
    mr: { name: "", native_name: "", era: "", hook: "", description: "", quick_facts: "" },
};

const toLines = (value) => Array.isArray(value) ? value.join("\n") : "";
const fromItem = (item) => ({
    ...EMPTY,
    ...item,
    quick_facts: toLines(item.quick_facts),
    images: toLines(item.images),
    order: String(item.order ?? 0),
    hi: { ...EMPTY.hi, ...(item.translations?.hi || {}), quick_facts: toLines(item.translations?.hi?.quick_facts) },
    mr: { ...EMPTY.mr, ...(item.translations?.mr || {}), quick_facts: toLines(item.translations?.mr?.quick_facts) },
});
const asLines = (value) => value.split(/\r?\n/).map((part) => part.trim()).filter(Boolean);
const makeSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const Field = ({ label, children, className = "", hint }) => (
    <div className={`space-y-1.5 ${className}`}>
        <Label className="text-xs font-medium">{label}</Label>
        {children}
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
);

const TranslationFields = ({ language, values, onChange }) => (
    <details className="rounded-xl border border-border/70 bg-muted/10 p-4">
        <summary className="cursor-pointer text-sm font-semibold">{language} translation</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Translated display name"><Input value={values.name} onChange={(e) => onChange("name", e.target.value)} /></Field>
            <Field label="Native name"><Input value={values.native_name} onChange={(e) => onChange("native_name", e.target.value)} /></Field>
            <Field label="Era"><Input value={values.era} onChange={(e) => onChange("era", e.target.value)} /></Field>
            <Field label="Short summary"><Input value={values.hook} onChange={(e) => onChange("hook", e.target.value)} /></Field>
            <Field label="Description" className="sm:col-span-2"><Textarea rows={4} value={values.description} onChange={(e) => onChange("description", e.target.value)} /></Field>
            <Field label="Quick facts (one per line)" className="sm:col-span-2"><Textarea rows={4} value={values.quick_facts} onChange={(e) => onChange("quick_facts", e.target.value)} /></Field>
        </div>
    </details>
);

export const AdminMuseum = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [target, setTarget] = useState(null);
    const [busy, setBusy] = useState(false);
    const [filter, setFilter] = useState("all");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try { setItems(await adminGetMuseum()); }
        catch (e) { setError(errMessage(e, "Could not load Museum exhibits")); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);
    const visibleItems = useMemo(() => filter === "all" ? items : items.filter((item) => item.category === filter), [items, filter]);
    const setField = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
    const setTranslation = (lang, key, value) => setForm((previous) => ({ ...previous, [lang]: { ...previous[lang], [key]: value } }));

    const openCreate = () => { setEditing(null); setForm({ ...EMPTY, hi: { ...EMPTY.hi }, mr: { ...EMPTY.mr } }); setEditorOpen(true); };
    const openEdit = (item) => { setEditing(item.slug); setForm(fromItem(item)); setEditorOpen(true); };

    const handleSave = async () => {
        const slug = (form.slug || makeSlug(form.name)).trim().toLowerCase();
        if (!form.name.trim()) return toast.error("Exhibit name is required");
        if (!slug) return toast.error("A valid slug is required");
        const translation = (lang) => ({
            name: form[lang].name.trim(),
            native_name: form[lang].native_name.trim(),
            era: form[lang].era.trim(),
            hook: form[lang].hook.trim(),
            description: form[lang].description.trim(),
            quick_facts: asLines(form[lang].quick_facts),
        });
        const images = asLines(form.images);
        const payload = {
            slug,
            category: form.category,
            name: form.name.trim(),
            native_name: form.native_name.trim(),
            era: form.era.trim(),
            hook: form.hook.trim(),
            description: form.description.trim(),
            quick_facts: asLines(form.quick_facts),
            image_url: form.image_url.trim() || images[0] || "",
            images,
            model_url: form.model_url.trim(),
            order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
            translations: { hi: translation("hi"), mr: translation("mr") },
        };
        setSaving(true);
        try {
            if (editing) {
                await adminUpdateMuseumItem(editing, payload);
                toast.success(`“${payload.name}” updated`);
            } else {
                await adminCreateMuseumItem(payload);
                toast.success(`“${payload.name}” created`);
            }
            setEditorOpen(false);
            await load();
        } catch (e) { toast.error(errMessage(e, "Could not save exhibit")); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!target) return;
        setBusy(true);
        try {
            await adminDeleteMuseumItem(target.slug);
            toast.success(`“${target.name}” deleted`);
            setTarget(null);
            await load();
        } catch (e) { toast.error(errMessage(e, "Could not delete exhibit")); }
        finally { setBusy(false); }
    };

    return (
        <div className="space-y-4" data-testid="admin-museum">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-display text-2xl font-semibold">Museum</h2><p className="text-sm text-muted-foreground">{items.length} exhibit(s) · manage descriptions, translations, photos and GLB models.</p></div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={load} className="gap-1.5" data-testid="admin-museum-refresh"><RefreshCw className="h-4 w-4" /> Refresh</Button>
                    <Button size="sm" onClick={openCreate} className="gap-1.5" data-testid="admin-museum-create-button"><Plus className="h-4 w-4" /> Add exhibit</Button>
                </div>
            </div>
            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Failed to load exhibits</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="flex flex-wrap gap-2" aria-label="Filter exhibits by category">
                {[{ slug: "all", label: "All categories" }, ...CATEGORIES].map((category) => <Button key={category.slug} variant={filter === category.slug ? "secondary" : "outline"} size="sm" className="rounded-full" onClick={() => setFilter(category.slug)}>{category.label}</Button>)}
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table data-testid="admin-museum-table">
                    <TableHeader className="bg-muted/30"><TableRow><TableHead className="px-4">Exhibit</TableHead><TableHead className="px-4">Category</TableHead><TableHead className="px-4">Era</TableHead><TableHead className="px-4">Media</TableHead><TableHead className="px-4 text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {loading ? Array.from({ length: 5 }).map((_, index) => <TableRow key={index}><TableCell colSpan={5} className="px-4 py-3"><Skeleton className="h-9 w-full" /></TableCell></TableRow>) : visibleItems.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="px-4 py-12 text-center"><div className="flex flex-col items-center gap-2 text-muted-foreground"><Gem className="h-8 w-8 opacity-40" /><p className="text-sm">No exhibits in this category yet.</p><Button size="sm" onClick={openCreate} className="mt-2 gap-1.5"><Plus className="h-4 w-4" /> Add exhibit</Button></div></TableCell></TableRow>
                        ) : visibleItems.map((item) => (
                            <TableRow key={item.slug} className="hover:bg-muted/30">
                                <TableCell className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-11 w-14 shrink-0 overflow-hidden rounded-md bg-muted">{item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />}</div><div className="min-w-0"><div className="truncate font-medium">{item.name}</div><div className="truncate text-xs text-muted-foreground">{item.native_name || item.slug}</div></div></div></TableCell>
                                <TableCell className="px-4 py-3"><Badge variant="secondary" className="rounded-full">{CATEGORIES.find((category) => category.slug === item.category)?.label || item.category}</Badge></TableCell>
                                <TableCell className="px-4 py-3 text-sm text-muted-foreground">{item.era || "—"}</TableCell>
                                <TableCell className="px-4 py-3"><div className="flex gap-1">{item.image_url && <Badge variant="outline" className="text-[10px]">Photo</Badge>}{item.model_url && <Badge variant="outline" className="text-[10px]">GLB</Badge>}</div></TableCell>
                                <TableCell className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`} data-testid={`admin-museum-edit-${item.slug}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setTarget(item)} aria-label={`Delete ${item.name}`} data-testid={`admin-museum-delete-${item.slug}`}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto" data-testid="admin-museum-editor">
                    <DialogHeader><DialogTitle>{editing ? "Edit exhibit" : "Add Museum exhibit"}</DialogTitle><DialogDescription>Manage the English content, Hindi and Marathi translations, photos, and optional GLB model.</DialogDescription></DialogHeader>
                    <div className="space-y-6 py-2">
                        <section className="grid gap-4 sm:grid-cols-2">
                            <Field label="Exhibit name *"><Input value={form.name} onChange={(e) => setField("name", e.target.value)} data-testid="admin-museum-name" placeholder="Bhavani Talwar" /></Field>
                            <Field label="Native name"><Input value={form.native_name} onChange={(e) => setField("native_name", e.target.value)} placeholder="भवानी तलवार" /></Field>
                            <Field label="Slug *" hint={editing ? "The slug stays fixed after creation." : "Lowercase letters, numbers and hyphens."}><Input value={form.slug} disabled={!!editing} onChange={(e) => setField("slug", e.target.value)} data-testid="admin-museum-slug" placeholder={makeSlug(form.name) || "bhavani-talwar"} className="font-mono" /></Field>
                            <Field label="Category"><select value={form.category} onChange={(e) => setField("category", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.label}</option>)}</select></Field>
                            <Field label="Era / type"><Input value={form.era} onChange={(e) => setField("era", e.target.value)} placeholder="Sword" /></Field>
                            <Field label="Display order"><Input type="number" value={form.order} onChange={(e) => setField("order", e.target.value)} /></Field>
                            <Field label="Short summary" className="sm:col-span-2"><Textarea rows={2} value={form.hook} onChange={(e) => setField("hook", e.target.value)} /></Field>
                            <Field label="Description" className="sm:col-span-2"><Textarea rows={5} value={form.description} onChange={(e) => setField("description", e.target.value)} /></Field>
                            <Field label="Quick facts (one per line)" className="sm:col-span-2"><Textarea rows={4} value={form.quick_facts} onChange={(e) => setField("quick_facts", e.target.value)} /></Field>
                        </section>
                        <section className="space-y-3 rounded-xl border border-border/70 p-4">
                            <h3 className="text-sm font-semibold">Photos and 3D model</h3>
                            <div className="grid gap-4 sm:grid-cols-2"><Field label="Cover image URL"><Input value={form.image_url} onChange={(e) => setField("image_url", e.target.value)} placeholder="/museum/bhavani-talwar.jpg" /></Field><Field label="GLB model URL" hint="Use a local /models/... path or a trusted HTTPS URL."><Input value={form.model_url} onChange={(e) => setField("model_url", e.target.value)} placeholder="/models/artifact-helmet.glb" /></Field></div>
                            <Field label="Gallery image URLs (one per line)"><Textarea rows={3} value={form.images} onChange={(e) => setField("images", e.target.value)} placeholder="/museum/bhavani-talwar.jpg" /></Field>
                        </section>
                        <section className="space-y-3"><div><h3 className="text-sm font-semibold">Translations</h3><p className="text-xs text-muted-foreground">Leave a field blank to use the English text as fallback.</p></div><TranslationFields language="Hindi" values={form.hi} onChange={(key, value) => setTranslation("hi", key, value)} /><TranslationFields language="Marathi" values={form.mr} onChange={(key, value) => setTranslation("mr", key, value)} /></section>
                    </div>
                    <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button><Button onClick={handleSave} disabled={saving} data-testid="admin-museum-save">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Save changes" : "Create exhibit"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete “{target?.name}”?</AlertDialogTitle><AlertDialogDescription>This permanently removes the exhibit from the Museum collection.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={(event) => { event.preventDefault(); handleDelete(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete exhibit</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
