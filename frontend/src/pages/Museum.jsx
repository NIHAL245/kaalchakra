import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CircleDollarSign, Crown, Gem, Landmark, Shield, Sparkles } from "lucide-react";
import { getMuseumCategories, getMuseumItem, getMuseumItems } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS = {
    kings: Crown,
    weapons: Shield,
    coins: CircleDollarSign,
    artifacts: Landmark,
};

const useMuseumCategories = (lang) => useQuery({
    queryKey: ["museum-categories", lang],
    queryFn: () => getMuseumCategories(lang),
});

const MuseumError = ({ children }) => (
    <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        {children}
    </div>
);

const MuseumCard = ({ category, t }) => {
    const Icon = ICONS[category.slug] || Gem;
    return (
        <Link to={`/museum/${category.slug}`} className="group block" data-testid={`museum-category-${category.slug}`}>
            <Card className="h-full overflow-hidden rounded-2xl border-border/70 transition duration-300 group-hover:-translate-y-1 group-hover:border-brand-saffron/50 group-hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden bg-stage">
                    {category.cover_image ? (
                        <img src={category.cover_image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : <div className="flex h-full items-center justify-center text-white/40"><Icon className="h-16 w-16" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Icon className="h-5 w-5" /></span>
                        <span className="font-display text-2xl font-semibold">{category.name}</span>
                    </div>
                </div>
                <CardContent className="flex min-h-28 items-start justify-between gap-4 p-4">
                    <div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{category.tagline}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{t("museum_items_count", { count: category.count })}</p>
                    </div>
                    <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-brand-saffron" />
                </CardContent>
            </Card>
        </Link>
    );
};

const ExhibitCard = ({ item, t }) => (
    <Link to={`/museum/item/${item.slug}`} className="group block" data-testid={`museum-item-${item.slug}`}>
        <Card className="h-full overflow-hidden rounded-2xl border-border/70 transition duration-300 group-hover:-translate-y-1 group-hover:border-brand-saffron/50 group-hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
                {item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : (
                    <div className="flex h-full items-center justify-center bg-stage text-white/40"><Gem className="h-12 w-12" /></div>
                )}
            </div>
            <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    {item.era && <Badge variant="secondary" className="rounded-full text-[10px]">{item.era}</Badge>}
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-brand-saffron">{item.name}</h3>
                {item.native_name && <p className="text-sm text-muted-foreground">{item.native_name}</p>}
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.hook}</p>
                <span className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-brand-saffron">{t("museum_explore")} <ArrowUpRight className="h-3.5 w-3.5" /></span>
            </CardContent>
        </Card>
    </Link>
);

export function MuseumHome() {
    const { lang, t } = useLanguage();
    const { data: categories = [], isLoading, isError } = useMuseumCategories(lang);
    return (
        <div className="space-y-8" data-testid="museum-home">
            <section className="relative overflow-hidden rounded-3xl border border-brand-saffron/20 bg-stage px-6 py-10 text-white sm:px-10 sm:py-14">
                <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[36px] border-white/5" />
                <div className="pointer-events-none absolute bottom-0 right-24 h-48 w-48 rounded-full border border-brand-saffron/20" />
                <div className="relative max-w-2xl">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-saffron"><Sparkles className="h-4 w-4" /> {t("museum_kicker")}</p>
                    <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">{t("museum_title")}</h1>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">{t("museum_subtitle")}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {["kings", "weapons", "coins", "artifacts"].map((key) => <Badge key={key} variant="secondary" className="rounded-full bg-white/10 text-white hover:bg-white/10">{t(`museum_category_${key}`)}</Badge>)}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-saffron">{t("museum_kicker")}</p><h2 className="mt-1 font-display text-2xl font-semibold">{t("museum_collections")}</h2></div>
                    <span className="text-xs text-muted-foreground">{categories.length} {t("museum_collections_label")}</span>
                </div>
                {isError ? <MuseumError>{t("museum_error")}</MuseumError> : isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2">{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-64 rounded-2xl" />)}</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">{categories.map((category) => <MuseumCard key={category.slug} category={category} t={t} />)}</div>
                )}
            </section>

            <p className="text-center text-xs text-muted-foreground">{t("museum_credit")}</p>
        </div>
    );
}

export function MuseumCategory() {
    const { categorySlug } = useParams();
    const { lang, t } = useLanguage();
    const { data: categories = [], isLoading: categoriesLoading } = useMuseumCategories(lang);
    const { data: items = [], isLoading, isError } = useQuery({
        queryKey: ["museum-items", categorySlug, lang],
        queryFn: () => getMuseumItems(categorySlug, lang),
    });
    const category = categories.find((entry) => entry.slug === categorySlug);
    if (isLoading || categoriesLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-80 rounded-2xl" />)}</div>;
    if (!category) return <div className="space-y-4"><MuseumError>{t("museum_category_not_found")}</MuseumError><Button asChild variant="outline"><Link to="/museum">{t("museum_back")}</Link></Button></div>;
    return (
        <div className="space-y-6" data-testid="museum-category-page">
            <Link to="/museum" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {t("museum_back")}</Link>
            <header className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-saffron">{t("museum_kicker")}</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-3xl font-semibold sm:text-4xl">{category.name}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{category.tagline}</p></div><Badge variant="secondary" className="rounded-full">{t("museum_items_count", { count: items.length })}</Badge></div>
            </header>
            {isError ? <MuseumError>{t("museum_error")}</MuseumError> : items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <ExhibitCard key={item.slug} item={item} t={t} />)}</div> : <MuseumError>{t("museum_empty")}</MuseumError>}
            <p className="text-center text-xs text-muted-foreground">{t("museum_credit")}</p>
        </div>
    );
}

export function MuseumItemDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { lang, t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState("");
    useEffect(() => setSelectedImage(""), [slug]);
    const { data: item, isLoading, isError } = useQuery({
        queryKey: ["museum-item", slug, lang],
        queryFn: () => getMuseumItem(slug, lang),
    });
    const { data: categories = [] } = useMuseumCategories(lang);
    const photos = useMemo(() => {
        if (!item) return [];
        return [...new Set([...(item.images || []), item.image_url].filter(Boolean))];
    }, [item]);
    const category = categories.find((entry) => entry.slug === item?.category);

    if (isLoading) return <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[55vh] rounded-2xl" /><div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-24 w-full" /><Skeleton className="h-40 w-full" /></div></div>;
    if (isError || !item) return <div className="flex flex-col items-center gap-4 py-16 text-center"><p className="text-muted-foreground">{t("museum_not_found")}</p><Button onClick={() => navigate("/museum")}>{t("museum_back")}</Button></div>;
    const heroImage = selectedImage || photos[0] || item.image_url;

    return (
        <div className="space-y-5" data-testid="museum-item-detail">
            <Link to={`/museum/${item.category}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {category?.name || t("museum_back")}</Link>
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
                <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
                    <div className="relative h-[42vh] min-h-72 overflow-hidden rounded-2xl border border-border/40 bg-stage sm:h-[55vh]">
                        {heroImage ? <img src={heroImage} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-white/40"><Gem className="h-16 w-16" /></div>}
                    </div>
                    {photos.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{photos.map((photo) => <button key={photo} type="button" onClick={() => setSelectedImage(photo)} aria-label={`${t("museum_show_photo")} ${photos.indexOf(photo) + 1}`} className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${heroImage === photo ? "border-brand-saffron" : "border-transparent"}`}><img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" /></button>)}</div>}
                    <p className="text-center text-xs text-muted-foreground">{t("museum_credit")}</p>
                </div>
                <article className="space-y-6">
                    <header>
                        <div className="flex flex-wrap items-center gap-2">{category && <Badge variant="secondary" className="rounded-full">{category.name}</Badge>}{item.era && <Badge variant="outline" className="rounded-full">{item.era}</Badge>}</div>
                        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{item.name}</h1>
                        {item.native_name && <p className="mt-1 font-display text-xl text-muted-foreground">{item.native_name}</p>}
                        {item.hook && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{item.hook}</p>}
                    </header>
                    <section className="space-y-2"><h2 className="font-display text-xl font-semibold">{t("museum_about")}</h2><p className="text-sm leading-7 text-foreground/85">{item.description}</p></section>
                    {item.quick_facts?.length > 0 && <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5"><h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Sparkles className="h-4 w-4 text-brand-saffron" />{t("museum_quick_facts")}</h2><ul className="space-y-2">{item.quick_facts.map((fact, index) => <li key={`${fact}-${index}`} className="flex gap-2 text-sm leading-relaxed text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-saffron" />{fact}</li>)}</ul></section>}
                    <Button asChild variant="outline" className="gap-2"><Link to={`/museum/${item.category}`}><ArrowLeft className="h-4 w-4" />{t("museum_back")}</Link></Button>
                </article>
            </div>
        </div>
    );
}
