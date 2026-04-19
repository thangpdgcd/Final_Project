import test from "node:test";
import assert from "node:assert/strict";
import { validateOrderStatusTransition } from "./order.service.js";

test("validateOrderStatusTransition allows canonical flow", () => {
  assert.equal(validateOrderStatusTransition("pending", "confirmed"), "confirmed");
  assert.equal(
    validateOrderStatusTransition("confirmed", "processing"),
    "processing",
  );
  assert.equal(validateOrderStatusTransition("processing", "shipped"), "shipped");
  assert.equal(validateOrderStatusTransition("shipped", "completed"), "completed");
});

test("validateOrderStatusTransition blocks invalid jump", () => {
  assert.throws(
    () => validateOrderStatusTransition("pending", "completed"),
    /Invalid status transition/,
  );
});
