import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar session={session} />
      <main className="flex-1 pb-12">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
          <TopNav />
          {children}
        </div>
      </main>
    </div>
  );
}