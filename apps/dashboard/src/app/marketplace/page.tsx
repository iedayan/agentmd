import { MarketplaceHeader } from '@/components/marketplace/marketplace-header';
import { AgentDirectory } from '@/components/marketplace/agent-directory';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="container mx-auto px-4 py-8">
        <AgentDirectory />
      </main>
    </div>
  );
}
