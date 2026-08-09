export const round = (value, digits = 1) => Number(value.toFixed(digits));
export const letterGrade = (score) => {
  if (!Number.isFinite(score)) return "—";
  if (score >= 97) return "A+"; if (score >= 93) return "A"; if (score >= 90) return "A−";
  if (score >= 87) return "B+"; if (score >= 83) return "B"; if (score >= 80) return "B−";
  if (score >= 77) return "C+"; if (score >= 73) return "C"; if (score >= 70) return "C−";
  if (score >= 67) return "D+"; if (score >= 63) return "D"; if (score >= 60) return "D−";
  return "F";
};
export const finalNeeded = (current, desired, weight) => (desired - current * (1 - weight / 100)) / (weight / 100);
export const maxFinalGrade = (current, weight, examScore = 100) => current * (1 - weight / 100) + examScore * (weight / 100);
export const percentage = (earned, possible) => possible > 0 ? earned / possible * 100 : NaN;
export const weightedAverage = (rows) => {
  const valid = rows.filter((r) => Number.isFinite(r.grade) && Number.isFinite(r.weight) && r.weight >= 0);
  const totalWeight = valid.reduce((sum, r) => sum + r.weight, 0);
  return { score: totalWeight > 0 ? valid.reduce((sum, r) => sum + r.grade * r.weight, 0) / totalWeight : NaN, totalWeight };
};
export const gpa = (rows) => {
  const valid = rows.filter((r) => Number.isFinite(r.points) && Number.isFinite(r.credits) && r.credits > 0);
  const credits = valid.reduce((sum, r) => sum + r.credits, 0);
  return credits ? valid.reduce((sum, r) => sum + r.points * r.credits, 0) / credits : NaN;
};
export const ezGrade = (total, wrong) => {
  const correct = total - wrong;
  return { correct, score: total > 0 ? correct / total * 100 : NaN };
};
