import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { RotateCcw, Smartphone, AlertTriangle, Box } from "lucide-react";

/**
 * Wrapper around Google's <model-viewer> web component for markerless WebAR.
 * Renders a .glb interactively and offers a "View in AR" action that launches
 * WebXR / Scene Viewer (Android) / Quick Look (iOS) where supported.
 */
export const ModelViewer = ({ src, poster, alt }) => {
    const ref = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const mv = ref.current;
        if (!mv) return;
        setLoaded(false);
        setFailed(false);
        const onLoad = () => setLoaded(true);
        const onError = () => setFailed(true);
        mv.addEventListener("load", onLoad);
        mv.addEventListener("error", onError);
        return () => {
            mv.removeEventListener("load", onLoad);
            mv.removeEventListener("error", onError);
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

    const activateAR = async () => {
        const mv = ref.current;
        if (mv && mv.canActivateAR) {
            try {
                await mv.activateAR();
            } catch (e) {
                toast.info("Could not open AR", {
                description: "Your device may not support AR. Explore the 3D view instead.",
                });
            }
        } else {
            toast.info("AR not available on this device", {
                description: "Open KaalChakra on a modern phone to place this model in your space. For now, explore in 3D.",
            });
        }
    };

    return (
        <div className="relative h-full w-full" data-testid="model-viewer-stage">
            {React.createElement("model-viewer", {
                ref,
                src,
                poster,
                alt: alt || "3D model",
                "camera-controls": "",
                "auto-rotate": "",
                "auto-rotate-delay": "1200",
                "rotation-per-second": "18deg",
                "touch-action": "pan-y",
                "shadow-intensity": "1",
                "shadow-softness": "0.8",
                exposure: "1",
                "interaction-prompt": "none",
                ar: "",
                "ar-modes": "webxr scene-viewer quick-look",
                "ar-scale": "auto",
                style: { width: "100%", height: "100%", backgroundColor: "transparent" },
            })}

            {/* Loading state */}
            {!loaded && !failed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stage/60">
                    <Skeleton className="h-24 w-24 rounded-2xl bg-white/5" />
                    <p className="text-xs text-white/60">Loading 3D model…</p>
                </div>
            )}

            {/* Error state */}
            {failed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-warning" />
                    <p className="text-sm text-white/80">The 3D model could not be loaded.</p>
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
            <div className="absolute bottom-3 right-3">
                <Button
                    data-testid="ar-view-in-ar-button"
                    onClick={activateAR}
                    className="h-11 gap-2 rounded-full bg-brand-saffron px-4 text-white shadow-lg hover:bg-brand-saffron/90"
                >
                    <Smartphone className="h-4 w-4" />
                    View in AR
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
