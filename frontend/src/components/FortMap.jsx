import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PIN_HTML = `
<svg width="30" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20C24 5.373 18.627 0 12 0z" fill="#C2410C"/>
  <circle cx="12" cy="12" r="4.5" fill="#F6E7C1"/>
</svg>`;

const escapeHtml = (str = "") =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

/**
 * Interactive Leaflet map of the Sahyadri forts.
 * Tapping a marker opens a detail popup card (photo + name + summary + "View fort").
 */
export const FortMap = ({ forts = [], viewLabel = "View fort", className = "" }) => {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const navigate = useNavigate();
    // Keep latest values available to popup event handlers without re-creating the map.
    const navRef = useRef(navigate);
    const labelRef = useRef(viewLabel);
    navRef.current = navigate;
    labelRef.current = viewLabel;

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        const pts = forts.filter((f) => f.lat != null && f.lng != null);

        const map = L.map(containerRef.current, {
            scrollWheelZoom: false,
            zoomControl: true,
            attributionControl: true,
        });
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            subdomains: "abc",
            maxZoom: 19,
        }).addTo(map);

        const buildPopup = (f) => {
            const img = f.image_url || (f.images && f.images[0]) || "";
            const name = escapeHtml(f.name || "");
            const region = (f.region || "").split(",")[0].trim();
            const metaParts = [region, f.era].filter(Boolean).map(escapeHtml);
            const meta = metaParts.join(" &middot; ");
            const desc = escapeHtml(f.hook || f.description || "");
            const label = escapeHtml(labelRef.current);

            const el = document.createElement("div");
            el.setAttribute("data-testid", "explore-map-fort-popup");
            el.className = "w-[236px] sm:w-[260px] overflow-hidden rounded-xl border border-border bg-card text-card-foreground";
            el.innerHTML = `
                <div class="relative h-28 w-full bg-muted">
                    ${
                        img
                            ? `<img src="${escapeHtml(img)}" alt="${name}" class="h-full w-full object-cover" loading="lazy" />`
                            : ""
                    }
                    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0"></div>
                    <div class="absolute bottom-2 left-3 right-3">
                        <h3 class="font-display text-lg font-semibold leading-tight text-white drop-shadow" data-testid="explore-map-fort-popup-title">${name}</h3>
                    </div>
                </div>
                <div class="space-y-2 p-3">
                    ${meta ? `<p class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">${meta}</p>` : ""}
                    ${desc ? `<p class="line-clamp-3 text-xs leading-relaxed text-foreground/80">${desc}</p>` : ""}
                    <button type="button" class="kc-view-fort-btn inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" data-testid="explore-map-fort-popup-view-fort-button">
                        <span>${label}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                </div>`;

            const btn = el.querySelector(".kc-view-fort-btn");
            if (btn) {
                btn.addEventListener("click", () => {
                    map.closePopup();
                    navRef.current(`/fort/${f.slug}`);
                });
            }
            return el;
        };

        const markers = [];
        pts.forEach((f) => {
            const icon = L.divIcon({
                className: "kc-pin-wrap",
                html: PIN_HTML,
                iconSize: [30, 40],
                iconAnchor: [15, 38],
                popupAnchor: [0, -34],
                tooltipAnchor: [0, -34],
            });
            const m = L.marker([f.lat, f.lng], { icon, title: f.name }).addTo(map);
            m.bindTooltip(f.name, { direction: "top", offset: [0, -6] });
            m.bindPopup(buildPopup(f), {
                className: "kc-popup",
                closeButton: true,
                maxWidth: 300,
                minWidth: 236,
                autoPan: true,
                autoPanPadding: [24, 24],
            });
            markers.push(m);
        });

        if (markers.length) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.35));
        } else {
            map.setView([18.2, 73.6], 9);
        }

        const t = setTimeout(() => map.invalidateSize(), 250);
        return () => {
            clearTimeout(t);
            map.remove();
            mapRef.current = null;
        };
    }, [forts]);

    return (
        <div
            ref={containerRef}
            className={className}
            data-testid="fort-map"
            style={{ minHeight: 360 }}
        />
    );
};
