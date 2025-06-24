"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Copy, Share2, X } from "lucide-react";

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
            // Construire l'URL de partage vers la page d'invitation
            const url = `${window.location.origin}/invitation/${eventData.code}`;
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
                    text: `Tu es invité(e) à ${eventData.title} ! Clique sur le lien pour répondre à l'invitation.`,
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
        <Dialog 
            open={isOpen} 
            onOpenChange={onClose} 
            modal={true}
        >
            <DialogContent 
                className="sm:max-w-[350px]"
            >
                <DialogHeader className="relative">
                    <DialogTitle className="text-center text-xl font-bold text-primary">
                        Événement créé avec succès !
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-0 top-0 h-6 w-6"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>
                <div className="mt-3 space-y-3">
                    <div className="rounded-lg border bg-card p-3">
                        <h3 className="font-semibold text-base mb-1">{eventData.title}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p>📅 {new Date(eventData.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                            <p>📍 {eventData.location}</p>
                            {eventData.description && (
                                <p className="mt-1 text-sm">{eventData.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Code de l'événement</label>
                        <div className="flex gap-2">
                            <Input
                                value={eventData.code}
                                readOnly
                                className="font-mono text-center h-8 text-sm"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyCode}
                                className="shrink-0 h-8 w-8"
                            >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Lien d'invitation</label>
                        <div className="flex gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="text-xs h-8"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyLink}
                                className="shrink-0 h-8 w-8"
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    <Button
                        className="w-full h-8 text-sm"
                        onClick={handleShare}
                    >
                        <Share2 className="mr-2 h-3 w-3" />
                        Partager l'invitation
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Partagez ce lien avec vos invités pour qu'ils puissent répondre à l'invitation.
                    </p>
                </div>
                <DialogFooter className="mt-4">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full h-8 text-sm"
                    >
                        <X className="mr-2 h-3 w-3" />
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 