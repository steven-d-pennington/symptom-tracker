import { ActiveFlareDashboard } from "@/components/flare/ActiveFlareDashboard";

export default function FlaresPage() {
  // In a real app, get userId from auth context
  const userId = "demo-user";

  return (
    <div className="container mx-auto px-4 py-8">
      <ActiveFlareDashboard userId={userId} />
    </div>
  );
}
