import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("linkcut_theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("linkcut_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("linkcut_theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="theme-pill"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle dark mode"
      id="theme-toggle"
    >
      {/* Knob with icon */}
      <div className="theme-pill-knob">
        {isDark ? (
          <Moon className="w-3 h-3 text-teal-600" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </div>
    </button>
  );
};
