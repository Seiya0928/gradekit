import test from "node:test";
import assert from "node:assert/strict";
import { ezGrade, finalNeeded, gpa, letterGrade, maxFinalGrade, percentage, weightedAverage } from "../site/assets/calculators.js";

test("calculates points-based percentages", () => {
  assert.equal(percentage(46, 50), 92);
  assert.ok(Number.isNaN(percentage(1, 0)));
});

test("calculates the final score needed and best possible result", () => {
  assert.equal(Math.round(finalNeeded(84, 90, 35) * 10) / 10, 101.1);
  assert.equal(maxFinalGrade(84, 35), 89.6);
  assert.ok(finalNeeded(95, 75, 20) <= 0);
});

test("normalizes weighted categories", () => {
  const result = weightedAverage([{ grade: 90, weight: 20 }, { grade: 80, weight: 30 }]);
  assert.equal(result.totalWeight, 50);
  assert.equal(result.score, 84);
});

test("weights GPA by credit hours", () => {
  assert.equal(gpa([{ points: 4, credits: 3 }, { points: 3, credits: 1 }]), 3.75);
});

test("generates an EZ Grader score and letter grade", () => {
  assert.deepEqual(ezGrade(50, 4), { correct: 46, score: 92 });
  assert.equal(letterGrade(92), "A−");
  assert.equal(letterGrade(59.9), "F");
});
