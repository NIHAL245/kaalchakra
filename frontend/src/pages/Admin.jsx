import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    adminLogin,
    adminMe,
    getToken,
    setToken,
    clearToken,
    setUnauthorizedHandler,
    errMessage,
} from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminForts } from "@/components/admin/AdminForts";
import { AdminQuizzes } from "@/components/admin/AdminQuizzes";
import { AdminLeaderboard } from "@/components/admin/AdminLeaderboard";
import { AdminMuseum } from "@/components/admin/AdminMuseum";
import { toast } from "sonner";
import {
    Crown,
    ShieldCheck,
    Loader2,
    LogOut,
    LayoutDashboard,
    Landmark,
    ScrollText,
    Trophy,
    AlertCircle,
    ArrowLeft,
    Gem,
} from "lucide-react";

const STAGE = { backgroundColor: "hsl(var(--stage))" };

const AdminLogin = ({ onSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await adminLogin(username.trim(), password);
            setToken(res.access_token);
            toast.success("Signed in");
            onSuccess(res.username);
        } catch (err) {
            setError(errMessage(err, "Invalid username or password"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2" data-testid="admin-login">
            {/* Brand / security panel */}
            <div className="relative hidden flex-col justify-between p-10 text-white lg:flex" style={STAGE}>
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M0 110 L20 60 L40 90 L60 40 L80 90 L100 55 L120 110 Z' fill='%23ffffff'/%3E%3C/svg%3E\")",
                        backgroundSize: "360px",
                        backgroundRepeat: "repeat",
                    }}
                />
                <Link to="/" className="relative flex items-center gap-2.5" data-testid="admin-brand-home-link">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-saffron text-white">
                        <Crown className="h-5 w-5" />
                    </span>
                    <span className="flex flex-col leading-none">
                        <span className="font-display text-xl font-semibold">KaalChakra</span>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-white/60">Admin Console</span>
                    </span>
                </Link>
                <div className="relative space-y-4">
                    <h2 className="font-display text-3xl font-semibold leading-tight">Curate the heritage.</h2>
                    <p className="max-w-sm text-sm text-white/70">
                        Manage forts, quiz questions, the leaderboard and analytics for the KaalChakra experience.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <ShieldCheck className="h-4 w-4" />
                        Admin access only
                    </div>
                </div>
                <p className="relative text-xs text-white/40">© KaalChakra · Maratha heritage in AR</p>
            </div>

            {/* Login form */}
            <div className="flex items-center justify-center px-4 py-10">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="mb-2 flex items-center gap-2 lg:hidden">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-saffron text-white">
                                <Crown className="h-4 w-4" />
                            </span>
                            <span className="font-display text-lg font-semibold">KaalChakra</span>
                        </div>
                        <CardTitle className="text-2xl">Admin sign in</CardTitle>
                        <CardDescription>Enter your administrator credentials to continue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" data-testid="admin-login-error-message">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-1.5">
                                <Label htmlFor="admin-username">Username</Label>
                                <Input
                                    id="admin-username"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    data-testid="admin-login-username-input"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="admin-password">Password</Label>
                                <Input
                                    id="admin-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    data-testid="admin-login-password-input"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full gap-2" disabled={loading} data-testid="admin-login-submit-button">
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                data-testid="admin-back-to-site-link"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to KaalChakra
                            </Link>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const TABS = [
    { value: "overview", label: "Overview", icon: LayoutDashboard, testid: "admin-tab-overview" },
    { value: "forts", label: "Forts", icon: Landmark, testid: "admin-tab-forts" },
    { value: "museum", label: "Museum", icon: Gem, testid: "admin-tab-museum" },
    { value: "quizzes", label: "Quizzes", icon: ScrollText, testid: "admin-tab-quizzes" },
    { value: "leaderboard", label: "Leaderboard", icon: Trophy, testid: "admin-tab-leaderboard" },
];

const AdminDashboard = ({ username, onSignOut }) => {
    const [tab, setTab] = useState("overview");
    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <header
                className="sticky top-0 z-40 border-b border-brand-saffron/30 text-white"
                style={STAGE}
                data-testid="admin-topbar"
            >
                <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-saffron text-white">
                            <Crown className="h-4 w-4" />
                        </span>
                        <span className="truncate font-display text-base font-semibold">KaalChakra</span>
                        <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">Admin</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="hidden text-sm text-white/60 sm:inline">{username}</span>
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSignOut}
                            className="gap-1.5 text-white hover:bg-white/10 hover:text-white"
                            data-testid="admin-signout-button"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign out</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Admin</h1>
                    <p className="text-sm text-muted-foreground">Manage forts, Museum exhibits, quizzes, leaderboard, and analytics.</p>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="space-y-6">
                    <TabsList
                        className="flex w-full justify-start gap-1 overflow-x-auto rounded-xl bg-muted/40 p-1 no-scrollbar"
                        data-testid="admin-tabs"
                    >
                        {TABS.map((t) => {
                            const Icon = t.icon;
                            return (
                                <TabsTrigger
                                    key={t.value}
                                    value={t.value}
                                    data-testid={t.testid}
                                    className="shrink-0 gap-1.5 rounded-lg px-3 py-2 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
                                >
                                    <Icon className="h-4 w-4" />
                                    {t.label}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    <TabsContent value="overview">
                        <AdminAnalytics />
                    </TabsContent>
                    <TabsContent value="forts">
                        <AdminForts />
                    </TabsContent>
                    <TabsContent value="museum">
                        <AdminMuseum />
                    </TabsContent>
                    <TabsContent value="quizzes">
                        <AdminQuizzes />
                    </TabsContent>
                    <TabsContent value="leaderboard">
                        <AdminLeaderboard />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default function Admin() {
    const [state, setState] = useState("loading"); // loading | out | in
    const [username, setUsername] = useState("");

    const signOut = useCallback(() => {
        clearToken();
        setUsername("");
        setState("out");
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            setUsername("");
            setState("out");
        });
        const t = getToken();
        if (!t) {
            setState("out");
            return () => setUnauthorizedHandler(null);
        }
        adminMe()
            .then((d) => {
                setUsername(d.username);
                setState("in");
            })
            .catch(() => {
                clearToken();
                setState("out");
            });
        return () => setUnauthorizedHandler(null);
    }, []);

    if (state === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background" data-testid="admin-loading">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (state === "out") {
        return (
            <AdminLogin
                onSuccess={(u) => {
                    setUsername(u);
                    setState("in");
                }}
            />
        );
    }

    return <AdminDashboard username={username} onSignOut={signOut} />;
}
