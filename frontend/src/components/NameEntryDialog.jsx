import React, { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

export const NameEntryDialog = () => {
    const { nameDialogOpen, closeNameDialog, confirmName, name } = usePlayer();
    const { t } = useLanguage();
    const [value, setValue] = useState("");
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (nameDialogOpen) {
            setValue(name || "");
            setTouched(false);
        }
    }, [nameDialogOpen, name]);

    const valid = value.trim().length >= 2;

    const submit = (e) => {
        e.preventDefault();
        setTouched(true);
        if (!valid) return;
        confirmName(value);
    };

    return (
        <Dialog open={nameDialogOpen} onOpenChange={(o) => (!o ? closeNameDialog() : null)}>
            <DialogContent className="sm:max-w-md" data-testid="name-entry-dialog">
                <DialogHeader>
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                        <Crown className="h-6 w-6 text-brand-saffron" />
                    </div>
                    <DialogTitle className="text-center text-2xl">{t("name_title")}</DialogTitle>
                    <DialogDescription className="text-center">{t("name_desc")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="player-name">{t("name_label")}</Label>
                        <Input
                            id="player-name"
                            data-testid="name-entry-input"
                            placeholder={t("name_placeholder")}
                            value={value}
                            autoFocus
                            maxLength={40}
                            onChange={(e) => setValue(e.target.value)}
                            className={touched && !valid ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {touched && !valid && <p className="text-xs text-destructive">{t("name_error")}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!valid} data-testid="name-entry-submit-button" className="w-full">
                            {t("name_continue")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
