import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const ADMIN_API = `${BACKEND_URL}/api/admin`;

const TOKEN_KEY = "kc_admin_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
    onUnauthorized = fn;
};

const adminClient = axios.create({ baseURL: ADMIN_API });

adminClient.interceptors.request.use((config) => {
    const t = getToken();
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
});

adminClient.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err?.response?.status === 401) {
            clearToken();
            if (onUnauthorized) onUnauthorized();
        }
        return Promise.reject(err);
    }
);

// Extract a human-friendly message from an axios error.
export const errMessage = (err, fallback = "Something went wrong") =>
    err?.response?.data?.detail || err?.message || fallback;

// --- Auth ---
export const adminLogin = async (username, password) =>
    (await axios.post(`${ADMIN_API}/login`, { username, password })).data;
export const adminMe = async () => (await adminClient.get("/me")).data;

// --- Forts ---
export const adminGetForts = async () => (await adminClient.get("/forts")).data;
export const adminCreateFort = async (payload) => (await adminClient.post("/forts", payload)).data;
export const adminUpdateFort = async (slug, payload) =>
    (await adminClient.put(`/forts/${slug}`, payload)).data;
export const adminDeleteFort = async (slug) => (await adminClient.delete(`/forts/${slug}`)).data;

// --- Museum ---
export const adminGetMuseum = async () => (await adminClient.get("/museum")).data;
export const adminCreateMuseumItem = async (payload) => (await adminClient.post("/museum", payload)).data;
export const adminUpdateMuseumItem = async (slug, payload) =>
    (await adminClient.put(`/museum/${slug}`, payload)).data;
export const adminDeleteMuseumItem = async (slug) => (await adminClient.delete(`/museum/${slug}`)).data;

// --- Quizzes ---
export const adminGetQuiz = async () => (await adminClient.get("/quiz")).data;
export const adminCreateQuiz = async (payload) => (await adminClient.post("/quiz", payload)).data;
export const adminUpdateQuiz = async (id, payload) =>
    (await adminClient.put(`/quiz/${id}`, payload)).data;
export const adminDeleteQuiz = async (id) => (await adminClient.delete(`/quiz/${id}`)).data;

// --- Leaderboard ---
export const adminGetLeaderboard = async () => (await adminClient.get("/leaderboard")).data;
export const adminClearLeaderboard = async () => (await adminClient.delete("/leaderboard")).data;
export const adminDeleteAttempt = async (id) => (await adminClient.delete(`/leaderboard/${id}`)).data;

// --- Analytics ---
export const adminGetAnalytics = async () => (await adminClient.get("/analytics")).data;
