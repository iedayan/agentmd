import { Star } from "lucide-react";

export function SocialProof() {
    return (
        <div className="border-b border-border bg-muted/20 py-6">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                    <a
                        href="https://github.com/agentmd/agentmd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2.5 rounded-lg border border-border/50 bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-sm"
                    >
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform group-hover:scale-110" />
                        Open source on GitHub
                    </a>
                    <span className="hidden sm:inline-flex h-4 w-px bg-border" aria-hidden />
                    <span className="text-sm text-muted-foreground">
                        Built for teams who ship with AI
                    </span>
                </div>
            </div>
        </div>
    );
}
