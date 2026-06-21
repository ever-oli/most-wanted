import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "../App";

// Mirror main.tsx: the app mounts under a ConvexProvider. We use a throwaway
// client so components calling useQuery resolve their client (no network needed).
const convex = new ConvexReactClient("https://placeholder.convex.cloud");

describe("app smoke test", () => {
  it("mounts without throwing", () => {
    const { container } = render(
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>,
    );
    // If the app crashed on startup the root would be empty.
    expect(container.firstChild).not.toBeNull();
  });
});
