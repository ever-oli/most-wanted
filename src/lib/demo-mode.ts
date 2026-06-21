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

// Demo mode is permanently disabled for the live store. The store is now driven
// entirely by DROP_LIVE/RECRUITMENT_MODE in drop-config and real Convex data, so
// no URL param can put the site into a fake "demo" state.
function read(): DemoModeState {
  return { active: false, clean: false, dropLive: false, recruitmentMode: false, demoCheckout: false };
}

export function useDemoMode(): DemoModeState {
  const [state, setState] = useState<DemoModeState>(() => read());
  useEffect(() => {
    setState(read());
  }, []);
  return state;
}
