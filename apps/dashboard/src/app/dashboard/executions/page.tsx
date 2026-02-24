import { ExecutionHistory } from "@/components/dashboard/execution-history";

export default function ExecutionsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Execution History</h1>
        <p className="text-muted-foreground">
          Runs triggered by push, PR, schedule, or manual
        </p>
      </div>
      <ExecutionHistory />
    </div>
  );
}
