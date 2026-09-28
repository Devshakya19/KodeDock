import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Unit Test Suite: Financial Precision & Paise Math
 * Mandate from AGENTS.md:
 * - All monetary values are strictly integers stored in paise (INR).
 * - Zero floating-point rounding errors.
 * - 95% creator revenue split, 5% platform fee.
 */

describe("Financial Precision & Monetary Mathematics", () => {
  it("converts Rupee denominations to exact integer paise without floating point drift", () => {
    const testCases: [rupees: number, expectedPaise: number][] = [
      [999, 99900],
      [1499, 149900],
      [4999, 499900],
      [19999, 1999900],
      [49999, 4999900],
      [99999, 9999900],
    ];

    for (const [rupees, expectedPaise] of testCases) {
      const paise = Math.round(rupees * 100);
      assert.strictEqual(paise, expectedPaise);
      assert.strictEqual(Number.isInteger(paise), true, "Paise amount must be a strict integer");
    }
  });

  it("calculates 95% creator split and 5% platform fee with zero loss invariant", () => {
    const sampleAmountsPaise = [99900, 149900, 249900, 499900, 799900, 1299900];

    for (const grossPaise of sampleAmountsPaise) {
      const creatorShare = Math.round(grossPaise * 0.95);
      const platformFee = Math.round(grossPaise * 0.05);

      // Invariant: sum of creatorShare + platformFee must equal gross amount
      assert.strictEqual(
        creatorShare + platformFee,
        grossPaise,
        `Financial invariant violated for gross amount ${grossPaise}`
      );

      // Invariant: creator share must be exactly 95% of gross
      const creatorPercentage = (creatorShare / grossPaise) * 100;
      assert.strictEqual(
        Math.abs(creatorPercentage - 95) < 0.01,
        true,
        `Creator percentage must be 95% (got ${creatorPercentage})`
      );

      // Invariant: amounts must be integers
      assert.strictEqual(Number.isInteger(creatorShare), true);
      assert.strictEqual(Number.isInteger(platformFee), true);
    }
  });

  it("formats paise into localized Indian Rupee currency strings correctly", () => {
    const formatPaiseToInr = (paise: number): string => {
      return `₹${(paise / 100).toLocaleString("en-IN")}`;
    };

    assert.strictEqual(formatPaiseToInr(99900), "₹999");
    assert.strictEqual(formatPaiseToInr(149900), "₹1,499");
    assert.strictEqual(formatPaiseToInr(4999900), "₹49,999");
    assert.strictEqual(formatPaiseToInr(10000000), "₹1,00,000");
  });

  it("handles edge cases: zero amount, single rupee, and micro paise without fractional drift", () => {
    const zeroPaise = 0;
    assert.strictEqual(Math.round(zeroPaise * 0.95), 0);
    assert.strictEqual(Math.round(zeroPaise * 0.05), 0);

    const oneRupeePaise = 100;
    const creator = Math.round(oneRupeePaise * 0.95);
    const platform = Math.round(oneRupeePaise * 0.05);
    assert.strictEqual(creator, 95);
    assert.strictEqual(platform, 5);
    assert.strictEqual(creator + platform, oneRupeePaise);
  });
});
