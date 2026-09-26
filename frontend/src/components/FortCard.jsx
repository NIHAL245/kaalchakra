import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const FortCard = ({ fort }) => {
    const { t } = useLanguage();
    return (
        <Link
            to={`/fort/${fort.slug}`}
            data-testid={`fort-card-${fort.slug}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <Card className="h-full overflow-hidden rounded-xl border-border/70 bg-card p-0 shadow-[0_10px_30px_-18px_rgba(15,15,20,0.18)] transition-shadow hover:shadow-[0_18px_50px_-24px_rgba(15,15,20,0.3)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={fort.image_url}
                        alt={fort.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                    <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="font-display text-xl font-semibold leading-tight text-white drop-shadow">{fort.name}</h3>
                        <p className="font-display text-sm text-white/80">{fort.native_name}</p>
                    </div>
                </div>
                <div className="space-y-3 p-4">
                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="rounded-full text-[11px] font-medium">{fort.era}</Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{fort.hook}</p>
                    <div className="flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {fort.region?.split(",")[0]}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium text-brand-saffron">
                            {t("card_explore")}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
};
