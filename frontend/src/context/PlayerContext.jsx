import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const PlayerContext = createContext(null);

const NAME_KEY = "kc_player_name";
const SESSION_KEY = "kc_session_id";

function genId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "sess-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const PlayerProvider = ({ children }) => {
    const [name, setNameState] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [nameDialogOpen, setNameDialogOpen] = useState(false);
    const [pendingCallback, setPendingCallback] = useState(null);

    useEffect(() => {
        try {
            const storedName = localStorage.getItem(NAME_KEY) || "";
            setNameState(storedName);
            let sid = localStorage.getItem(SESSION_KEY);
            if (!sid) {
                sid = genId();
                localStorage.setItem(SESSION_KEY, sid);
            }
            setSessionId(sid);
        } catch (e) {
            setSessionId(genId());
        }
    }, []);

    const setName = useCallback((value) => {
        const v = (value || "").trim().slice(0, 40);
        setNameState(v);
        try {
            localStorage.setItem(NAME_KEY, v);
        } catch (e) {
            /* noop */
        }
    }, []);

    // Opens the name dialog if no name yet, otherwise runs cb immediately.
    const requireName = useCallback(
        (cb) => {
            if (name && name.trim()) {
                cb && cb(name);
                return;
            }
            setPendingCallback(() => cb);
            setNameDialogOpen(true);
        },
        [name]
    );

    const confirmName = useCallback(
        (value) => {
            const v = (value || "").trim().slice(0, 40);
            if (!v) return;
            setName(v);
            setNameDialogOpen(false);
            if (pendingCallback) {
                pendingCallback(v);
                setPendingCallback(null);
            }
        },
        [pendingCallback, setName]
    );

    const openNameDialog = useCallback(() => setNameDialogOpen(true), []);
    const closeNameDialog = useCallback(() => setNameDialogOpen(false), []);

    return (
        <PlayerContext.Provider
            value={{
                name,
                setName,
                sessionId,
                nameDialogOpen,
                openNameDialog,
                closeNameDialog,
                requireName,
                confirmName,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
    return ctx;
};
