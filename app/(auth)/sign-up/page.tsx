"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const SignUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignUpValues = z.infer<typeof SignUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
  });

  async function onSubmit(values: SignUpValues) {
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create account");
      }

      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/onboarding",
      });

      router.push("/onboarding");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start your personalized autoimmune symptom tracking in minutes.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="grid gap-2 text-sm font-medium">
          Name
          <input
            type="text"
            className="rounded-xl border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register("name")}
          />
          {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            type="email"
            className="rounded-xl border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register("email")}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            type="password"
            className="rounded-xl border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register("password")}
          />
          {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Confirm password
          <input
            type="password"
            className="rounded-xl border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>
          )}
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link className="font-medium text-primary hover:underline" href="/sign-in">
          Sign in instead
        </Link>
      </p>
    </div>
  );
}