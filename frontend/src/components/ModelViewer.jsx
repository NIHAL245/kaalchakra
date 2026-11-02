import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw, AlertTriangle, Box, Smartphone } from "lucide-react";

/**
 * Responsive interactive 3D viewer with rotation and zoom controls.
 */
export const ModelViewer = ({ src, poster, alt }) => {
    const ref = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const [arFailed, setArFailed] = useState(false);

    useEffect(() => {
        const mv = ref.current;
        if (!mv) return;
        setLoaded(false);
        setFailed(false);
        setArFailed(false);
        const onLoad = () => {
            setLoaded(true);
        };
        const onError = () => setFailed(true);
        const onArStatus = (event) => {
            if (event.detail?.status === "failed") setArFailed(true);
        };
        mv.addEventListener("load", onLoad);
        mv.addEventListener("error", onError);
        mv.addEventListener("ar-status", onArStatus);
        return () => {
            mv.removeEventListener("load", onLoad);
            mv.removeEventListener("error", onError);
            mv.removeEventListener("ar-status", onArStatus);
        };
    }, [src]);

    const resetView = () => {
        const mv = ref.current;
        if (mv) {
            mv.cameraOrbit = "0deg 75deg 105%";
            mv.cameraTarget = "auto auto auto";
            if (mv.resetTurntableRotation) mv.resetTurntableRotation();
        }
    };

    const openAR = () => {
        const mv = ref.current;
        const isAndroid = /Android/i.test(window.navigator.userAgent);

        // Use Google's standard Scene Viewer handoff. AR is preferred, with a
        // native 3D viewer fallback when AR services cannot start.
        if (isAndroid && src) {
            const modelUrl = new URL(src, window.location.href).href;
            const fallbackUrl = encodeURIComponent(window.location.href);
            const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${fallbackUrl};end`;
            setArFailed(false);
            window.location.href = intentUrl;
            window.setTimeout(() => {
                if (document.visibilityState === "visible") setArFailed(true);
            }, 1800);
            return;
        }

        if (!mv?.canActivateAR) {
            setArFailed(true);
            return;
        }

        setArFailed(false);
        try {
            const activation = mv.activateAR();
            activation?.catch?.(() => setArFailed(true));
        } catch {
            setArFailed(true);
        }
    };

    const hasSecureOrigin = typeof window === "undefined" || window.isSecureContext;

    return (
        <div className="relative h-full w-full" data-testid="model-viewer-stage">
            {React.createElement("model-viewer", {
                ref,
                src,
                poster,
                alt: alt || "3D model",
                "camera-controls": "",
                ar: "",
                "ar-modes": "scene-viewer quick-look webxr",
                "ar-placement": "floor",
                "ar-scale": "auto",
                "auto-rotate": "",
                "auto-rotate-delay": "1200",
                "rotation-per-second": "18deg",
                "touch-action": "pan-y",
                "shadow-intensity": "1",
                "shadow-softness": "0.8",
                exposure: "1",
                "interaction-prompt": "none",
                loading: "eager",
                reveal: "auto",
                style: { width: "100%", height: "100%", backgroundColor: "transparent" },
            })}

            {loaded && !failed && (
                <button
                    type="button"
                    aria-label="View this 3D model in augmented reality"
                    data-testid="model-viewer-ar-button"
                    onClick={openAR}
                    className="absolute right-3 top-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-brand-saffron px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-saffron/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                    <Smartphone className="h-4 w-4" />
                    <span>View in AR</span>
                </button>
            )}

            {arFailed && loaded && (
                <p role="status" className="absolute right-3 top-16 z-10 max-w-[18rem] rounded-lg border border-white/15 bg-black/75 px-3 py-2 text-xs leading-relaxed text-white shadow-lg">
                    {!hasSecureOrigin
                        ? "AR needs a secure HTTPS page. Open the deployed site on your phone."
                        : "AR is unavailable here. Open this page on a supported phone using Android Chrome with Google Play Services for AR, or Safari on iPhone."}
                </p>
            )}

            {/* Loading state */}
            {!loaded && !failed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stage/60">
                    <Skeleton className="h-24 w-24 rounded-2xl bg-white/5" />
                    <p className="text-xs text-white/60">Loading 3D model…</p>
                </div>
            )}

            {/* Accessible photo fallback for devices without WebGL / 3D support */}
            {failed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    {poster && <img src={poster} alt={alt || "Fort"} className="absolute inset-0 h-full w-full object-cover opacity-35" />}
                    <AlertTriangle className="relative h-8 w-8 text-warning" />
                    <p className="relative text-sm text-white/80">This device cannot render the interactive 3D model. The fort photo remains available.</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        data-testid="model-retry-button"
                        onClick={() => {
                            const mv = ref.current;
                            if (mv) {
                                const s = mv.src;
                                mv.src = "";
                                mv.src = s;
                                setFailed(false);
                            }
                        }}
                    >
                        Try again
                    </Button>
                </div>
            )}

            {/* Corner-bracket viewfinder overlay */}
            <div className="pointer-events-none absolute inset-4 hidden sm:block">
                <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-white/25" />
                <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-white/25" />
                <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-white/25" />
                <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-white/25" />
            </div>

            {/* Floating controls */}
            <div className="absolute bottom-3 left-3 flex gap-2">
                <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Reset view"
                    data-testid="model-reset-button"
                    onClick={resetView}
                    className="h-11 w-11 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                    <RotateCcw className="h-5 w-5" />
                </Button>
            </div>
            {/* 3D badge */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                <Box className="h-3.5 w-3.5" />
                3D · drag to rotate
            </div>
        </div>
    );
};
