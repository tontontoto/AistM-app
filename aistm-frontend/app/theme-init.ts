export const THEME_STORAGE_KEY = "theme";
export type ThemeMode = "system" | "light" | "dark";

export function getSystemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function applyThemeClass(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("dark");

  const shouldDark = mode === "dark" || (mode === "system" && getSystemPrefersDark());
  if (shouldDark) root.classList.add("dark");
}

