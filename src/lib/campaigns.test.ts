import { describe, expect, it } from "vitest";
import { shortlistCost } from "./campaigns";

describe("shortlistCost", () => {
  it("flags totals above the budget", () => {
    expect(shortlistCost({ a: 9000, b: 7000 }, ["a", "b"], 15000)).toEqual({ total: 16000, over: true });
  });
  it("does not flag totals within budget", () => {
    expect(shortlistCost({ a: 9000, b: 6000 }, ["a", "b"], 15000)).toEqual({ total: 15000, over: false });
  });
});
