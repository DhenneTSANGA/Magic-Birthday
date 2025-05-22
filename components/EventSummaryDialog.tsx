"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Copy, Share2 } from "lucide-react";

interface EventSummaryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    eventData: {
        id: string;
        title: string;
        date: string;
        location: string;
        description?: string;
        code: string;
    };
}

export function EventSummaryDialog({ isOpen, onClose, eventData }: EventSummaryDialogProps) {
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    useEffect(() => {
        if (eventData) {
            // Construire l'URL de partage
            const url = `${window.location.origin}/evenement/${eventData.code}`;
            setShareUrl(url);
        }
    }, [eventData]);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(eventData.code);
            setCopied(true);
            toast.success("Code copié dans le presse-papiers");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Erreur lors de la copie du code");
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Lien copié dans le presse-papiers");
        } catch (err) {
            toast.error("Erreur lors de la copie du lien");
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Invitation à ${eventData.title}`,
                    text: `Tu es invité(e) à ${eventData.title} ! Utilise le code ${eventData.code} pour accéder à l'événement.`,
                    url: shareUrl,
                });
                toast.success("Invitation partagée avec succès");
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    toast.error("Erreur lors du partage");
                }
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-primary">
                        Événement créé avec succès !
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg mb-2">{eventData.title}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>📅 {new Date(eventData.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                            <p>📍 {eventData.location}</p>
                            {eventData.description && (
                                <p className="mt-2">{eventData.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Code de l'événement</label>
                        <div className="flex gap-2">
                            <Input
                                value={eventData.code}
                                readOnly
                                className="font-mono text-center"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyCode}
                                className="shrink-0"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Lien de partage</label>
                        <div className="flex gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="text-sm"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyLink}
                                className="shrink-0"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleShare}
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager l'événement
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Partagez ce code ou ce lien avec vos invités pour qu'ils puissent accéder à l'événement.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
} 