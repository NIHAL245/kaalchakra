import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { MoveHorizontal } from "lucide-react";

/**
 * Accessible before/after image comparison slider.
 * `beforeSrc` (Then) is revealed on the left; `afterSrc` (Now) on the right.
 */
export const BeforeAfterSlider = ({ beforeSrc, afterSrc, beforeLabel, afterLabel, hint }) => {
    const [pos, setPos] = useState(50);
    const [loaded, setLoaded] = useState(false);
    const containerRef = useRef(null);

    return (
        <div
            ref={containerRef}
            className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-2xl border border-border/60 bg-stage shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]"
            data-testid="before-after-slider"
        >
            {/* Now (base, right) */}
            <img
                src={afterSrc}
                alt={afterLabel}
                onLoad={() => setLoaded(true)}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
            />
            {/* Then (overlay, clipped to left) */}
            <img
                src={beforeSrc}
                alt={beforeLabel}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
                draggable={false}
            />

            {/* Labels */}
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {beforeLabel}
            </span>
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {afterLabel}
            </span>

            {/* Divider + handle */}
            <div
                className="pointer-events-none absolute inset-y-0"
                style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
            >
                <div className="h-full w-0.5 bg-white/80" />
                <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-ink shadow-lg">
                    <MoveHorizontal className="h-5 w-5" />
                </div>
            </div>

            {/* Range control (accessible, keyboard + drag) */}
            <input
                type="range"
                min="0"
                max="100"
                value={pos}
                onChange={(e) => setPos(Number(e.target.value))}
                aria-label="Compare then and now"
                data-testid="before-after-range"
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />

            {hint && (
                <span className={cn(
                    "pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur transition-opacity",
                    loaded ? "opacity-100" : "opacity-0"
                )}>
                    {hint}
                </span>
            )}
        </div>
    );
};
