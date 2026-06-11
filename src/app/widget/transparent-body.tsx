"use client";

import { useEffect } from "react";

/** Makes the page background transparent so the widget iframe blends into any host. */
export function TransparentBody({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "transparent";
    return () => {
      document.body.style.background = prev;
    };
  }, []);
  return <>{children}</>;
}
