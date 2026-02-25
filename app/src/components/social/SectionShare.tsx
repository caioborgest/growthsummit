import { useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SectionShareProps {
    sectionId: string;
    title: string;
}

export function SectionShare({ sectionId, title }: SectionShareProps) {
    const [copied, setCopied] = useState(false);
    const baseUrl = 'https://www.growthsummit.site/growth-experience-triunfo';
    const fullUrl = `${baseUrl}#${sectionId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            // Analytics
            const win = window as Window & { gtag?: (type: string, name: string, data: Record<string, unknown>) => void };
            if (typeof window !== 'undefined' && win.gtag) {
                win.gtag('event', 'share_section', {
                    section: sectionId,
                    method: 'copy_link'
                });
            }
        } catch (err) {
            logger.error('Erro ao copiar:', err);
        }
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`${title}\nConfira no Growth Experience Triunfo:\n${fullUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');

        // Analytics
        const win = window as Window & { gtag?: (type: string, name: string, data: Record<string, unknown>) => void };
        if (typeof window !== 'undefined' && win.gtag) {
            win.gtag('event', 'share_section', {
                section: sectionId,
                method: 'whatsapp'
            });
        }
    };

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            className="h-8 w-8 rounded-full bg-white/5 hover:bg-brand-orange-coral/20 hover:text-brand-orange-coral text-gray-400"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-dark-100 border-white/10 text-white">
                        <p>{copied ? 'Link copiado!' : 'Copiar link da seção'}</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleWhatsApp}
                            className="h-8 w-8 rounded-full bg-white/5 hover:bg-green-500/20 hover:text-green-500 text-gray-400"
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-dark-100 border-white/10 text-white">
                        <p>Compartilhar no WhatsApp</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
