// The catalogue's subscription sizes (27 Nov 2026) as the pricing cards and
// comparison table read them: every figure the app's, nothing invented.
import test from "node:test";
import assert from "node:assert/strict";
import { parseSubscriptions, modelAllowance } from "../src/lib/signup-client.ts";

test("subscription sizes are read as the app sends them, and a size with no price is dropped", () => {
  const out = parseSubscriptions([
    { id: "starter", name: "Starter", priceUsd: 10, periodDays: 30, model: { weekUsd: 40, monthUsd: 170 }, fable: false, upgradeTo: "pro" },
    { id: "max", name: "Max", priceUsd: 120, periodDays: 30, model: { weekUsd: 500, monthUsd: 2125 }, fable: true, upgradeTo: null },
    { id: "pro", name: "Pro", priceUsd: null },
    "junk",
  ]);
  assert.deepEqual(out.map((p) => [p.id, p.price?.amount, p.price?.interval, p.fable]), [["starter", 1000, "30 days", false], ["max", 12000, "30 days", true]]);
  assert.equal(modelAllowance(out[0]), "$40 of model usage a week, $170 a month");
  assert.equal(modelAllowance(out[1]), "$500 of model usage a week, $2,125 a month");
  assert.equal(modelAllowance({ ...out[0], model: { weekUsd: null, monthUsd: null } }), "Model usage not limited");
  assert.deepEqual(parseSubscriptions(undefined), []);
});
