"use client";

import React, { use } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import FoodCorrelationDetailView from "@/components/food/FoodCorrelationDetailView";
import { useSearchParams } from "next/navigation";

interface PageProps {
  params: Promise<{ foodId: string }>;
}

export default function Page({ params }: PageProps) {
  const { foodId } = use(params);
  const searchParams = useSearchParams();
  const symptom = searchParams.get("symptom") || "";
  const { userId, isLoading } = useCurrentUser();

  if (!symptom) {
    return (
      <div role="alert" className="rounded border bg-muted/30 p-3">
        Missing symptom parameter.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center" aria-busy="true">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <FoodCorrelationDetailView userId={userId} foodId={foodId} symptomName={symptom} />
    </div>
  );
}
