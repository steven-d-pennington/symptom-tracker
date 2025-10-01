"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInValues = z.infer<typeof SignInSchema>;

function SignInForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
  });

  async function onSubmit(values: SignInValues) {
    setError(null);
    const result = await signIn("credentials", {
      ...values,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue tracking your autoimmune health journey.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            type="email"
            className="rounded-xl border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-destructive">{errors.email.message}</span>
          )}
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            type="password"
            className="rounded-xl border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-destructive">{errors.password.message}</span>
          )}
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link className="font-medium text-primary hover:underline" href="/sign-up">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading sign-in…</div>}>
      <SignInForm />
    </Suspense>
  );
}