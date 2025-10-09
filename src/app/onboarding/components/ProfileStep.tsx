"use client";

import { useState, useId } from "react";
import type { OnboardingStepComponentProps } from "../types/onboarding";

export const ProfileStep = ({ data, onContinue, onBack }: OnboardingStepComponentProps) => {
  const [name, setName] = useState(data.userProfile?.name || "");
  const [email, setEmail] = useState(data.userProfile?.email || "");
  const [errors, setErrors] = useState({ name: "", email: "" });

  const nameId = useId();
  const emailId = useId();
  const descriptionId = useId();

  const validateForm = () => {
    const newErrors = { name: "", email: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Please enter your name";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    onContinue("profile", {
      userProfile: {
        name: name.trim(),
        email: email.trim(),
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Your Profile</h2>
        <p id={descriptionId} className="text-muted-foreground">
          Let's start with some basic information. This helps personalize your experience and is stored securely on your device.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={nameId} className="block text-sm font-medium text-foreground mb-1.5">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
              errors.name
                ? "border-destructive focus:outline-none focus:ring-2 focus:ring-destructive"
                : "border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            }`}
            placeholder="Enter your name"
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p id={`${nameId}-error`} className="mt-1 text-xs text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={emailId} className="block text-sm font-medium text-foreground mb-1.5">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
              errors.email
                ? "border-destructive focus:outline-none focus:ring-2 focus:ring-destructive"
                : "border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            }`}
            placeholder="your.email@example.com"
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id={`${emailId}-error`} className="mt-1 text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div
          role="note"
          className="rounded-xl border border-muted bg-muted/50 p-4 text-sm text-muted-foreground"
        >
          <strong className="font-medium text-foreground">Privacy note:</strong> Your information stays on your device and is never sent to external servers.
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          aria-describedby={descriptionId}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
