"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SignIn from "@/components/sign-in";
import SignUp from "@/components/sign-up";

export default function MarketingLanding() {
  const router = useRouter();

  return (
    <main
      className="container mx-auto flex flex-col md:flex-row items-center justify-center min-h-screen p-6 text-center md:text-left space-y-8 md:space-y-0 md:space-x-16"
    >
      <div className="flex-1">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          Workout<span className="text-primary">Pal</span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Your AI-powered workout companion. Generate personalised routines, log
          every set and watch your progress sky-rocket.
        </p>
        <div className="flex flex-row justify-start mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Sign Up</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Sign Up</DialogTitle>
              <DialogDescription>
                Enter your information to create an account
              </DialogDescription>
              <SignUp />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="w-full max-w-md flex-shrink-0">
        <SignIn />
      </div>
      {/*  ✨  extra marketing copy / screenshots can be added here later */}
    </main>
  );
}