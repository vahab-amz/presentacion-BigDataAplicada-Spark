"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

export interface SlideEnv {
  /** Step/transition animations (false in /print and the presenter's preview). */
  animate: boolean;
  /** Ambient loops (flowing dots, live feeds). */
  ambient: boolean;
}

const SlideEnvContext = createContext<SlideEnv>({ animate: true, ambient: true });

export const SlideEnvProvider = SlideEnvContext;

export function useSlideEnv(): SlideEnv {
  return useContext(SlideEnvContext);
}

/** Ambient loops run only when allowed by the context and by prefers-reduced-motion. */
export function useAmbient(): boolean {
  const env = useSlideEnv();
  const reduced = useReducedMotion();
  return env.ambient && !reduced;
}

const noopSubscribe = () => () => {};

/** true only after hydration on the client (the deck is client-rendered). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
