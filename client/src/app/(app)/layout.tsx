import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// Import icons if you want them (e.g., from lucide-react)
// import { LayoutDashboard, History, Settings, Edit } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/40 border-r p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">AI Fitness</h1>
        <nav className="flex flex-col space-y-2">
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/dashboard">
              {/* <LayoutDashboard className="mr-2 h-4 w-4" /> */}
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/log-workout">
              {/* <Edit className="mr-2 h-4 w-4" /> */}
              Log Workout
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/history">
              {/* <History className="mr-2 h-4 w-4" /> */}
              History
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start mt-auto" asChild>
             <Link href="/settings">
               {/* <Settings className="mr-2 h-4 w-4" /> */}
               Settings
             </Link>
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}