"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MarketingLanding() {
  const router = useRouter();

  return (
    <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
        Workout<span className="text-primary">Pal</span>
      </h1>

      <p className="max-w-xl text-lg text-muted-foreground mb-8">
        Your AI-powered workout companion. Generate personalised routines, log
        every set and watch your progress sky-rocket.
      </p>

      <Button size="lg" onClick={() => router.push("/landing")}>
        Get&nbsp;Started
      </Button>

      {/*  ✨  extra marketing copy / screenshots can be added here later */}
    </main>
  );
}