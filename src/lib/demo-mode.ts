import { useEffect, useState } from "react";

/**
 * Demo Mode — activates a camera-ready run-through via URL params.
 *
 * Usage:
 *   ?demo=1            → unlocks the vault, enables demo checkout, shows DEMO badge
 *   ?demo=1&clean=1    → same, but hides the DEMO badge (use for the actual recording)
 *
 * Public visitors without the param see the normal Recruitment Mode site.
 */
export interface DemoModeState {
  active: boolean;
  clean: boolean;
  dropLive: boolean;
  recruitmentMode: boolean;
  demoCheckout: boolean;
}

function read(): DemoModeState {
  if (typeof window === "undefined") {
    return { active: false, clean: false, dropLive: false, recruitmentMode: true, demoCheckout: false };
  }
  const p = new URLSearchParams(window.location.search);
  const active = p.get("demo") === "1";
  const clean = p.get("clean") === "1";
  return {
    active,
    clean,
    dropLive: active,
    recruitmentMode: active ? false : true,
    demoCheckout: active,
  };
}

export function useDemoMode(): DemoModeState {
  const [state, setState] = useState<DemoModeState>(() => read());
  useEffect(() => {
    setState(read());
  }, []);
  return state;
}
