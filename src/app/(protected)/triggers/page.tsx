import { TriggerCorrelationDashboard } from "@/components/triggers/TriggerCorrelationDashboard";

export default function TriggersPage() {
  // In a real app, get userId from auth context
  const userId = "demo-user";

  return (
    <div className="container mx-auto px-4 py-8">
      <TriggerCorrelationDashboard userId={userId} />
    </div>
  );
}
