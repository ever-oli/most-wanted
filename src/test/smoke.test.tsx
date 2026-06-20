import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "../App";

describe("app smoke test", () => {
  it("mounts without throwing", () => {
    const { container } = render(<App />);
    // If the app crashed on startup the root would be empty.
    expect(container.firstChild).not.toBeNull();
  });
});
