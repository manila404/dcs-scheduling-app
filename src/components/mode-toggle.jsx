import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <SwitchPrimitives.Root
      checked={isDarkMode}
      onCheckedChange={toggleTheme}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none relative flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-lg ring-0 transition-transform",
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      >
        <Sun
          className={cn(
            "absolute h-3 w-3 rotate-0 scale-100 text-foreground transition-all",
            isDarkMode && "rotate-90 scale-0"
          )}
        />
        <Moon
          className={cn(
            "absolute h-3 w-3 rotate-90 scale-0 text-foreground transition-all",
            isDarkMode && "rotate-0 scale-100"
          )}
        />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  );
}