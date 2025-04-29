// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
// Optional: Import icons if you want to add them
// import { Zap, Target, Activity, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Optional Header Section */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-end">
            <ThemeToggle />
        </div>
        </header>
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold">
           {/* You could put a Logo component here later */}
           AI Fitness Coach
        </h1>
        <nav>
           {/* You might add links here later (e.g., Blog, About), but keep it simple for now */}
           <Button variant="ghost" asChild>
             {/* Link directly to settings as it's our onboarding entry point */}
             <Link href="/settings">Get Started</Link>
           </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            Meet Your <span className="text-primary">Personalized</span> AI Fitness Trainer
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stop guessing, start progressing. Get intelligent workout plans tailored to your goals, track your performance, and let our AI adapt your training for optimal results.
          </p>
          <Button size="lg" asChild>
            <Link href="/settings">Start Your Fitness Journey</Link>
          </Button>
          {/* Optional: Add an illustration or image below the button */}
          {/* <img src="/path/to/your/hero-image.svg" alt="AI Fitness App illustration" className="mt-12 mx-auto max-w-lg" /> */}
        </section>

        {/* Features Section (Optional but Recommended) */}
        <section className="bg-muted/40 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {/* Feature 1 */}
              <div className="flex flex-col items-center p-6 rounded-lg">
                {/* <Target className="w-12 h-12 text-primary mb-4" /> */}
                <div className="w-12 h-12 text-primary mb-4">🎯</div> {/* Placeholder Icon */}
                <h3 className="text-xl font-semibold mb-2">1. Define Your Goal</h3>
                <p className="text-muted-foreground">
                  Tell us what you want to achieve (build muscle, increase strength, etc.) and your current level.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="flex flex-col items-center p-6 rounded-lg">
                 {/* <Zap className="w-12 h-12 text-primary mb-4" /> */}
                 <div className="w-12 h-12 text-primary mb-4">⚡️</div> {/* Placeholder Icon */}
                 <h3 className="text-xl font-semibold mb-2">2. Get Daily Plans</h3>
                 <p className="text-muted-foreground">
                   Receive AI-generated workouts designed specifically for you, focusing on progressive overload.
                 </p>
              </div>
              {/* Feature 3 */}
              <div className="flex flex-col items-center p-6 rounded-lg">
                 {/* <Activity className="w-12 h-12 text-primary mb-4" /> */}
                 {/* <BrainCircuit className="w-12 h-12 text-primary mb-4" /> */}
                 <div className="w-12 h-12 text-primary mb-4">📈</div> {/* Placeholder Icon */}
                 <h3 className="text-xl font-semibold mb-2">3. Log & Adapt</h3>
                 <p className="text-muted-foreground">
                   Track your sets, reps, weight, and effort. Our AI analyzes your performance to adjust future workouts.
                 </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section (Optional) */}
        <section className="container mx-auto px-4 py-16 md:py-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Fitness?</h2>
            <p className="text-lg text-muted-foreground mb-8">
                Get started for free and experience the power of AI-driven training.
            </p>
            <Button size="lg" asChild>
               <Link href="/settings">Claim Your Personalized Plan</Link>
            </Button>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Fitness Coach. All rights reserved.
          {/* Optional: Add links to Privacy Policy, Terms of Service */}
          {/* <div className="mt-2">
            <Link href="/privacy" className="hover:underline mx-2">Privacy Policy</Link>
            |
            <Link href="/terms" className="hover:underline mx-2">Terms of Service</Link>
          </div> */}
        </div>
      </footer>
    </div>
  );
}