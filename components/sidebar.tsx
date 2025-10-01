import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { ButtonHTMLAttributes } from "react";
import type { Session } from "next-auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log", label: "Symptom Log" },
  { href: "/medications", label: "Medications" },
  { href: "/journal", label: "Journal" },
  { href: "/settings", label: "Settings" },
];

type SidebarProps = {
  session: Session;
};

export function Sidebar({ session }: SidebarProps) {
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <aside className="hidden w-72 flex-col border-r border-border bg-background/80 px-6 py-10 shadow-sm backdrop-blur lg:flex">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Symptom Tracker</p>
        <h1 className="text-xl font-semibold">Autoimmune insights</h1>
      </div>

      <div className="mt-8 space-y-1 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-xl px-4 py-3 font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">{session.user.name ?? "Autoimmune Explorer"}</p>
          <p className="text-xs text-muted-foreground">{session.user.email ?? "no-email@example.com"}</p>
        </div>
        <SignOutButton className="w-full rounded-xl border border-input px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted">
          Sign out
        </SignOutButton>
      </div>
    </aside>
  );
}

function SignOutButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" {...props}>
        {children}
      </button>
    </form>
  );
}