import { ExecutionDetail } from '@/components/dashboard/execution-detail';

export default async function ExecutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-8">
      <ExecutionDetail executionId={id} />
    </div>
  );
}
