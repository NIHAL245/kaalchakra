import React, { useEffect, useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/**
 * Swipeable per-fort photo gallery (embla carousel) with dots + attribution credit.
 */
export const FortGallery = ({ images = [], alt = "Fort", credit }) => {
    const [api, setApi] = useState(null);
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(images.length);

    useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());
        const onSelect = () => setCurrent(api.selectedScrollSnap());
        api.on("select", onSelect);
        return () => api.off("select", onSelect);
    }, [api]);

    if (!images.length) return null;

    return (
        <div data-testid="fort-gallery">
            <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                    {images.map((src, i) => (
                        <CarouselItem key={i}>
                            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-muted">
                                <img
                                    src={src}
                                    alt={`${alt} — photo ${i + 1}`}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                    data-testid={`gallery-image-${i}`}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {images.length > 1 && (
                    <>
                        <CarouselPrevious className="left-3 border-none bg-white/85 text-brand-ink hover:bg-white" data-testid="gallery-prev" />
                        <CarouselNext className="right-3 border-none bg-white/85 text-brand-ink hover:bg-white" data-testid="gallery-next" />
                    </>
                )}
            </Carousel>
            <div className="mt-2 flex items-center justify-between gap-3">
                {credit ? <span className="text-xs text-muted-foreground">{credit}</span> : <span />}
                {count > 1 && (
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: count }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Go to photo ${i + 1}`}
                                data-testid={`gallery-dot-${i}`}
                                onClick={() => api && api.scrollTo(i)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-200",
                                    i === current ? "w-5 bg-brand-saffron" : "w-1.5 bg-border hover:bg-muted-foreground"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
