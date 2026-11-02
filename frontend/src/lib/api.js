import axios from "axios";
import museumFallback from "@/data/museumFallback.json";

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
const localizeMuseumEntry = (entry, lang) => ({
    ...entry,
    ...(entry.translations?.[lang] || {}),
});

const getFallbackMuseumCategories = (lang) => museumFallback.categories.map((category) => {
    const items = museumFallback.items
        .filter((item) => item.category === category.slug)
        .sort((a, b) => a.order - b.order);
    const localized = localizeMuseumEntry(category, lang);
    return {
        slug: category.slug,
        name: localized.name,
        native_name: localized.native_name || category.native_name || "",
        tagline: localized.tagline || category.tagline || "",
        icon: category.icon,
        count: items.length,
        cover_image: items.find((item) => item.image_url)?.image_url || "",
    };
});

const getFallbackMuseumItems = (category, lang) => museumFallback.items
    .filter((item) => !category || item.category === category)
    .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order)
    .map((item) => localizeMuseumEntry(item, lang));

export const getMuseumCategories = async (lang = "en") => {
    try {
        const { data } = await client.get("/museum/categories", { params: { lang } });
        if (Array.isArray(data) && data.length) return data;
    } catch (error) {
        // The bundled collection keeps the Museum usable when the API is offline.
    }
    return getFallbackMuseumCategories(lang);
};

export const getMuseumItems = async (category, lang = "en") => {
    try {
        const { data } = await client.get("/museum/items", { params: { category, lang } });
        if (Array.isArray(data) && data.length) return data;
    } catch (error) {
        // Fall through to the bundled collection when the API is offline.
    }
    return getFallbackMuseumItems(category, lang);
};

export const getMuseumItem = async (slug, lang = "en") => {
    try {
        return (await client.get(`/museum/items/${slug}`, { params: { lang } })).data;
    } catch (error) {
        const item = museumFallback.items.find((entry) => entry.slug === slug);
        if (!item) throw error;
        return localizeMuseumEntry(item, lang);
    }
};

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
