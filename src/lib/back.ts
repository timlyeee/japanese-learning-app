import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

type Entry = { depth: number; handler: () => void };
let entries: Entry[] = [];
let initialized = false;

export function registerBack(depth: number, handler: () => void) {
  const entry: Entry = { depth, handler };
  entries = [...entries, entry];
  return () => {
    entries = entries.filter((e) => e !== entry);
  };
}

export function handleBack(): boolean {
  let best: Entry | null = null;
  for (const entry of entries) {
    if (best === null || entry.depth > best.depth) best = entry;
  }
  if (!best) return false;
  best.handler();
  return true;
}

export function useBack(depth: number, handler: () => void) {
  useEffect(() => {
    if (depth <= 0) return;
    return registerBack(depth, handler);
  }, [depth, handler]);
}

export function initBackButton() {
  if (!Capacitor.isNativePlatform() || initialized) return;
  initialized = true;
  App.addListener("backButton", () => {
    if (!handleBack()) void App.exitApp();
  });
}
