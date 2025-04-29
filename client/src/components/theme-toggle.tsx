"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
// (optional) pull in your button/ui primitives or icons
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { theme, systemTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // avoid hydration mismatch—only render toggle after mount
    useEffect(() => {
    setMounted(true);
    }, []);

    if (!mounted) return null;

    // determine the “effective” theme
    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";

    return (
    <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? "light" : "dark")}
    >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
    );
}