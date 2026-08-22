import test from "node:test";
import assert from "node:assert/strict";
import { ezGrade, finalNeeded, flatCurve, gpa, highSchoolGpa, letterGrade, maxFinalGrade, percentage, round, scaleToTop, squareRootCurve, weightedAverage } from "../site/assets/calculators.js";

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

test("combines terms and a final exam into a semester grade", () => {
  const result = weightedAverage([{ grade: 88, weight: 40 }, { grade: 82, weight: 40 }, { grade: 91, weight: 20 }]);
  assert.equal(result.totalWeight, 100);
  assert.equal(result.score, 86.2);
  // A school that drops the exam: weights need not total 100.
  assert.equal(weightedAverage([{ grade: 88, weight: 45 }, { grade: 82, weight: 45 }, { grade: 91, weight: 0 }]).score, 85);
});

test("separates weighted and unweighted high school GPA", () => {
  const rows = [{ points: 4, bonus: 1, credits: 1 }, { points: 3.3, bonus: 0.5, credits: 1 }, { points: 3.7, bonus: 0, credits: 1 }];
  const result = highSchoolGpa(rows);
  assert.equal(round(result.weighted, 2), 4.17);
  assert.equal(round(result.unweighted, 2), 3.67);
  assert.equal(result.credits, 3);
  assert.ok(Number.isNaN(highSchoolGpa([]).weighted));
  // Credits must actually weight the average.
  assert.equal(highSchoolGpa([{ points: 4, bonus: 0, credits: 3 }, { points: 3, bonus: 0, credits: 1 }]).unweighted, 3.75);
});

test("curves a score three ways", () => {
  assert.equal(flatCurve(72, 5), 77);
  assert.equal(round(squareRootCurve(72), 1), 84.9);
  assert.equal(round(scaleToTop(72, 88), 1), 81.8);
  // The square root curve must lift the bottom of the class more than the top.
  assert.equal(squareRootCurve(36), 60);
  assert.equal(round(squareRootCurve(90), 1), 94.9);
  assert.equal(squareRootCurve(100), 100);
  assert.ok(Number.isNaN(squareRootCurve(-1)));
  assert.ok(Number.isNaN(scaleToTop(72, 0)));
});

test("the published grading scale bands match letterGrade at both edges", () => {
  assert.equal(letterGrade(85), "B");
  assert.equal(letterGrade(90), "A−");
  assert.equal(letterGrade(93), "A");
  assert.equal(letterGrade(60), "D−");
  assert.equal(letterGrade(0), "F");
});
