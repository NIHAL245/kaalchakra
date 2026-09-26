import React from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { Home, Landmark, ScrollText, Trophy, Crown, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NameEntryDialog } from "@/components/NameEntryDialog";
import { useLanguage } from "@/context/LanguageContext";

const NAV = [
    { to: "/", key: "nav_home", icon: Home, testid: "nav-home" },
    { to: "/explore", key: "nav_explore", icon: Landmark, testid: "nav-explore" },
    { to: "/museum", key: "nav_museum", icon: Gem, testid: "nav-museum" },
    { to: "/quiz", key: "nav_quiz", icon: ScrollText, testid: "nav-quiz" },
    { to: "/leaderboard", key: "nav_leaderboard", icon: Trophy, testid: "nav-leaderboard" },
    { to: "/ask", key: "nav_ask", icon: Crown, testid: "nav-ask" },
];

export const AppShell = () => {
    const location = useLocation();
    const { t } = useLanguage();

    return (
        <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-2.5" data-testid="brand-logo-link">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-saffron text-white">
                            <Crown className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-none">
                            <span className="font-display text-xl font-semibold tracking-tight text-foreground">
                                KaalChakra
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                {t("app_tagline")}
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {NAV.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                data-testid={`${item.testid}-desktop`}
                                className={({ isActive }) =>
                                    cn(
                                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-secondary text-secondary-foreground"
                                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                    )
                                }
                            >
                                {t(item.key)}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-1">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8">
                <Outlet />
            </main>

            <nav
                className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur lg:hidden"
                data-testid="bottom-nav"
            >
                <div className="mx-auto grid max-w-md grid-cols-6">
                    {NAV.map((item) => {
                        const Icon = item.icon;
                        const active =
                            item.to === "/"
                                ? location.pathname === "/"
                                : location.pathname.startsWith(item.to);
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                data-testid={item.testid}
                                className="flex flex-col items-center gap-1 py-2.5"
                            >
                                <span
                                    className={cn(
                                        "flex h-8 w-11 items-center justify-center rounded-full transition-colors",
                                        active ? "bg-brand-saffron/15 text-brand-saffron" : "text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className={cn("text-[9px] font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                                    {t(item.key)}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            <NameEntryDialog />
        </div>
    );
};
