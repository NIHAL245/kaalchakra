import React from "react";
import { ArrowUpRight, Crown, MapPin, ScrollText, Shield, Swords } from "lucide-react";

const EVENTS = [
    { year: "1630", date: "19 February · birth", title: "Born at Shivneri Fort", body: "Shivaji was born to Shahaji Bhonsle and Jijabai at Shivneri, near Junnar. Some older accounts give a different birth year; 1630 is the date followed by most modern historians and the Maharashtra government.", place: "Shivneri", icon: Crown, era: "Beginnings" },
    { year: "1645–46", date: "c. age 15–16", title: "The first forts of Swarajya", body: "Shivaji took control of Torna and began building his base in the Pune region. Rajgad became an important stronghold as his circle of forts and allies grew.", place: "Torna · Rajgad", icon: Shield, era: "Beginnings" },
    { year: "1656", date: "Expansion in the Western Ghats", title: "Javli comes under his control", body: "The conquest of the Javli valley strengthened Shivaji’s position in the Sahyadris and helped secure the route to the coast. Pratapgad was built soon afterwards.", place: "Javli · Pratapgad", icon: MapPin, era: "Swarajya takes shape" },
    { year: "1659", date: "10 November", title: "Afzal Khan and the Battle of Pratapgad", body: "Shivaji met the Bijapur commander Afzal Khan near Pratapgad. Afzal Khan was killed in the encounter, and the Maratha forces defeated his army in the battle that followed.", place: "Pratapgad", icon: Swords, era: "Swarajya takes shape" },
    { year: "1660", date: "Panhala siege and escape", title: "The stand at Pavan Khind", body: "After a long siege at Panhala, Shivaji escaped toward Vishalgad. Baji Prabhu Deshpande and a small force held the pass at Pavan Khind, buying time for his journey.", place: "Panhala · Pavan Khind · Vishalgad", icon: Shield, era: "Swarajya takes shape" },
    { year: "1663", date: "Night raid in Pune", title: "Shaista Khan is driven from Lal Mahal", body: "Shivaji led a surprise night attack on the Mughal camp at Lal Mahal. Shaista Khan was wounded and soon transferred away from the Deccan.", place: "Pune", icon: Swords, era: "Defiance and return" },
    { year: "1664", date: "January", title: "Raid on Surat", body: "Maratha forces raided the wealthy Mughal port city of Surat, bringing resources and drawing attention to Shivaji’s growing power.", place: "Surat", icon: MapPin, era: "Defiance and return" },
    { year: "1665", date: "June", title: "Treaty of Purandar", body: "After Jai Singh’s campaign and the siege of Purandar, Shivaji agreed to cede a number of forts to the Mughals. The treaty was a pause in the conflict, not the end of Swarajya.", place: "Purandar", icon: ScrollText, era: "Defiance and return" },
    { year: "1666", date: "May–August", title: "Agra visit and escape", body: "Shivaji travelled to Aurangzeb’s court at Agra with his son Sambhaji. Placed under guard after a dispute over court protocol, he escaped confinement and returned to the Deccan.", place: "Agra", icon: ArrowUpRight, era: "Defiance and return" },
    { year: "1670", date: "Renewed campaigns", title: "Forts are recovered; Surat is raided again", body: "Shivaji resumed his campaign against Mughal power, recovering several forts including Sinhagad and raiding Surat for a second time.", place: "Sinhagad · Surat", icon: Swords, era: "Sovereignty" },
    { year: "1674", date: "6 June", title: "Coronation at Raigad", body: "Shivaji was formally crowned Chhatrapati at Raigad, establishing a sovereign Maratha kingship. A second coronation ceremony followed later that year.", place: "Raigad", icon: Crown, era: "Sovereignty" },
    { year: "1676–78", date: "Southern campaign", title: "The kingdom reaches south", body: "Shivaji led a major expedition through the Deccan into the Carnatic, extending Maratha influence and securing forts and territories in the south.", place: "Deccan · Carnatic", icon: MapPin, era: "Sovereignty" },
    { year: "1680", date: "3 April", title: "Shivaji Maharaj dies at Raigad", body: "Shivaji Maharaj died at Raigad, aged about 50. His son Sambhaji succeeded him, and the struggle to preserve Swarajya continued.", place: "Raigad", icon: Crown, era: "Legacy" },
];

const ERAS = [...new Set(EVENTS.map((event) => event.era))];

export default function LifeTimeline() {
    return (
        <div className="mx-auto max-w-4xl pb-8" data-testid="life-timeline-page">
            <header className="relative overflow-hidden rounded-2xl border border-border/70 bg-card px-6 py-9 shadow-sm sm:px-10 sm:py-12">
                <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border border-brand-gold/20" />
                <div className="absolute -right-2 -top-8 h-40 w-40 rounded-full border border-brand-saffron/15" />
                <div className="relative max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-saffron/20 bg-brand-saffron/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-saffron">
                        <ScrollText className="h-3.5 w-3.5" />A life in 13 moments
                    </span>
                    <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">The life of <span className="text-brand-saffron">Shivaji Maharaj</span></h1>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">From Shivneri to Raigad, trace the turning points in the life of the founder and first crowned Chhatrapati of the Maratha kingdom.</p>
                    <div className="mt-7 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="rounded-full bg-secondary px-3 py-1.5">1630–1680</span>
                        <span className="rounded-full bg-secondary px-3 py-1.5">Maharashtra · Deccan · Carnatic</span>
                        <span className="rounded-full bg-secondary px-3 py-1.5">Scroll to travel through time ↓</span>
                    </div>
                </div>
            </header>

            <div className="mt-10">
                {ERAS.map((era) => {
                    const eraEvents = EVENTS.filter((event) => event.era === era);
                    return (
                        <section key={era} aria-label={era} className="mb-10 last:mb-0">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="h-px flex-1 bg-border" />
                                <h2 className="font-display text-xl font-semibold text-brand-teal sm:text-2xl">{era}</h2>
                                <span className="h-px flex-1 bg-border" />
                            </div>
                            <ol className="relative ml-3 border-l border-brand-gold/50 sm:ml-5" data-testid="life-timeline-events">
                                {eraEvents.map((event) => {
                                    const Icon = event.icon;
                                    return (
                                        <li key={event.year} className="relative mb-5 ml-6 last:mb-0 sm:ml-9">
                                            <span className="absolute -left-[34px] top-5 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-brand-saffron text-white shadow-sm sm:-left-[47px] sm:h-9 sm:w-9">
                                                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </span>
                                            <article className="rounded-xl border border-border/70 bg-card p-4 shadow-[0_10px_30px_-22px_rgba(15,15,20,0.35)] transition-all hover:-translate-y-0.5 hover:border-brand-saffron/35 hover:shadow-md sm:p-5">
                                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                    <span className="font-display text-2xl font-semibold tabular-nums text-brand-saffron sm:text-3xl">{event.year}</span>
                                                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{event.date}</span>
                                                </div>
                                                <h3 className="mt-2 font-display text-xl font-semibold leading-snug sm:text-2xl">{event.title}</h3>
                                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{event.body}</p>
                                                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"><MapPin className="h-3 w-3" />{event.place}</div>
                                            </article>
                                        </li>
                                    );
                                })}
                            </ol>
                        </section>
                    );
                })}
            </div>

            <footer className="mt-12 rounded-xl border border-border/70 bg-secondary/40 p-5 sm:p-6">
                <h2 className="font-display text-xl font-semibold">A note on dates</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Historical chronologies sometimes differ, especially for early events. The birth date shown here, 19 February 1630, is the date accepted by most modern historians and the Maharashtra government. Approximate periods are labelled “c.” or given as ranges.</p>
                <p className="mt-3 text-xs text-muted-foreground">Further reading: <a className="font-medium text-brand-teal underline underline-offset-2" href="https://vishwakosh.marathi.gov.in/33539/" target="_blank" rel="noreferrer">Maharashtra State Marathi Vishwakosh <span className="sr-only">(opens in a new tab)</span></a> · <a className="font-medium text-brand-teal underline underline-offset-2" href="https://www.gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer/History%20Part/History_II/Chrono.pdf" target="_blank" rel="noreferrer">Maharashtra State Gazetteers chronology <span className="sr-only">(opens in a new tab)</span></a></p>
            </footer>
        </div>
    );
}
