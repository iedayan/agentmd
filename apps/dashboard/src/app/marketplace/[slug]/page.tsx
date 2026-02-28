import { AgentDetail } from '@/components/marketplace/agent-detail';

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="min-h-screen bg-background">
      <AgentDetail slug={slug} />
    </div>
  );
}
