import { Suspense } from "react";

export default function LogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading log…</div>}>
      {children}
    </Suspense>
  );
}