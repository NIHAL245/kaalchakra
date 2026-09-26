import React from "react";

/**
 * Vertical heritage timeline. Expects events: [{ year, title, body }].
 */
export const FortTimeline = ({ events = [] }) => {
    if (!events.length) {
        return (
            <p className="text-sm text-muted-foreground">No timeline events available yet.</p>
        );
    }
    return (
        <ol className="relative ml-2 border-l border-border/70" data-testid="fort-timeline">
            {events.map((ev, i) => (
                <li key={i} className="mb-8 ml-6 last:mb-0" data-testid="timeline-event-card">
                    <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold ring-4 ring-background" />
                    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card p-4 shadow-[0_10px_30px_-18px_rgba(15,15,20,0.2)] transition-shadow hover:shadow-[0_18px_50px_-24px_rgba(15,15,20,0.3)]">
                        <span className="inline-flex w-fit items-center rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-secondary-foreground">
                            {ev.year}
                        </span>
                        <h4 className="font-display text-lg leading-tight text-foreground">{ev.title}</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{ev.body}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
};
