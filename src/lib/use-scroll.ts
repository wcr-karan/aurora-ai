"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Count a number up from 0 → `to` the first time the element enters the
 * viewport. Respects reduced-motion (snaps straight to the final value).
 * Returns a ref to attach and the live display string.
 */
export function useCountUp(
  to: number,
  {
    duration = 1.6,
    decimals = 0,
    prefix = "",
    suffix = "",
    separator = ",",
  }: {
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    separator?: string;
  } = {}
) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  const fixed = value.toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const display = `${prefix}${grouped}${frac ? "." + frac : ""}${suffix}`;

  return { ref, display, inView };
}

/**
 * Track whether the page has been scrolled past a threshold. Cheap passive
 * listener; used for nav elevation and "back to top" affordances.
 */
export function useScrolledPast(threshold = 16) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return past;
}
