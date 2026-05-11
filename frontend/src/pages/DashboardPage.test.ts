import { describe, expect, it } from "vitest";
import { formatDate } from "./DashboardPage";

describe("formatDate", () => {
  it("formats ISO dates to Brazilian format", () => {
    expect(formatDate("2026-06-01")).toBe("01/06/2026");
  });
});
