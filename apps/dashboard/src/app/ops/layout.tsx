import "@/styles/ops.css";

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ops-ops min-h-screen">
      {children}
    </div>
  );
}
