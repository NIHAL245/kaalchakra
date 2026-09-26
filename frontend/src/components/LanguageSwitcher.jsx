import React from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export const LanguageSwitcher = () => {
    const { lang, setLang } = useLanguage();
    const active = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-foreground/80 hover:text-foreground"
                    data-testid="language-switcher-button"
                    aria-label="Change language"
                >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium">{active.native}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[9rem]">
                {LANGUAGES.map((l) => (
                    <DropdownMenuItem
                        key={l.code}
                        data-testid={`language-option-${l.code}`}
                        onClick={() => setLang(l.code)}
                        className="flex items-center justify-between gap-3"
                    >
                        <span>{l.native}</span>
                        <Check className={cn("h-4 w-4 text-brand-saffron", lang === l.code ? "opacity-100" : "opacity-0")} />
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
