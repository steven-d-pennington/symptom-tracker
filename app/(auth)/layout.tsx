import { AuthHeader } from "@/components/auth-header";
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-background p-8 shadow-lg">
        <AuthHeader />
        {children}
      </div>
    </div>
  );
}