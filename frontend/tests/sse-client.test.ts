import { describe, expect, it } from "vitest";

import { parseEventBlock } from "@/core/api/sse-client";

describe("parseEventBlock", () => {
  it("parsea evento y data json", () => {
    const event = parseEventBlock('event: progress\ndata: {"done":2,"total":10}');
    expect(event.event).toBe("progress");
    expect(event.data).toEqual({ done: 2, total: 10 });
  });
});
