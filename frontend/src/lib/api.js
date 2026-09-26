import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

export const getForts = async (lang = "en") =>
    (await client.get("/forts", { params: { lang } })).data;
export const getFort = async (slug, lang = "en") =>
    (await client.get(`/forts/${slug}`, { params: { lang } })).data;
export const getFortQuiz = async (slug, lang = "en") =>
    (await client.get(`/forts/${slug}/quiz`, { params: { lang } })).data;
export const getGeneralQuiz = async (lang = "en") =>
    (await client.get("/quiz/general", { params: { lang } })).data;
export const submitQuiz = async (payload) => (await client.post("/quiz/submit", payload)).data;
export const getLeaderboard = async (params = {}) =>
    (await client.get("/leaderboard", { params })).data;
export const getChatHistory = async (sessionId) =>
    (await client.get(`/chat/${sessionId}/history`)).data;

// --- Museum / Heritage Collection ---
export const getMuseumCategories = async (lang = "en") =>
    (await client.get("/museum/categories", { params: { lang } })).data;
export const getMuseumItems = async (category, lang = "en") =>
    (await client.get("/museum/items", { params: { category, lang } })).data;
export const getMuseumItem = async (slug, lang = "en") =>
    (await client.get(`/museum/items/${slug}`, { params: { lang } })).data;

/**
 * Stream a chat response from the backend using fetch + ReadableStream.
 */
export const streamChat = ({ sessionId, message, fortSlug, lang = "en", onDelta, onDone, onError }) => {
    const controller = new AbortController();
    (async () => {
        try {
            const res = await fetch(`${API}/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    message,
                    fort_slug: fortSlug || null,
                    lang,
                }),
                signal: controller.signal,
            });
            if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split("\n\n");
                buffer = parts.pop() || "";
                for (const part of parts) {
                    const line = part.trim();
                    if (!line.startsWith("data:")) continue;
                    const payload = line.slice(5).trim();
                    if (!payload) continue;
                    try {
                        const obj = JSON.parse(payload);
                        if (obj.delta) onDelta && onDelta(obj.delta);
                        else if (obj.error) onError && onError(obj.error);
                        else if (obj.done) onDone && onDone();
                    } catch (e) {
                        /* ignore malformed chunk */
                    }
                }
            }
            onDone && onDone();
        } catch (err) {
            if (err.name !== "AbortError") onError && onError(err.message || "Stream error");
        }
    })();
    return controller;
};
