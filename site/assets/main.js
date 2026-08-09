import { ezGrade, finalNeeded, gpa, letterGrade, maxFinalGrade, percentage, round, weightedAverage } from "./calculators.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const num = (id) => Number($(id)?.value);
const fmt = (n, digits = 1) => Number.isFinite(n) ? `${round(n, digits)}%` : "—";
const setResult = (html, tone = "") => {
  const box = $("#result");
  if (!box) return;
  box.className = `result ${tone}`;
  box.innerHTML = html;
};
const announce = (value) => { const el = $("#result-status"); if (el) el.textContent = value; };
const gradeBadge = (score) => `<span class="grade-badge">${letterGrade(score)}</span>`;

function bindRows({ type, defaults, rowHtml, calculate }) {
  const body = $("#rows");
  if (!body) return;
  const wire = (wrap) => {
    $("button", wrap)?.addEventListener("click", () => { wrap.remove(); calculate(); });
    $$("input,select", wrap).forEach((input) => input.addEventListener("input", calculate));
  };
  const add = (values = {}) => {
    const wrap = document.createElement("div");
    wrap.className = "data-row";
    wrap.innerHTML = rowHtml(values);
    body.append(wrap);
    wire(wrap);
  };
  const existing = $$(".data-row", body);
  if (existing.length) existing.forEach(wire); else defaults.forEach(add);
  $("#add-row")?.addEventListener("click", () => add());
  calculate();
}

function initGrade() {
  const calculate = () => {
    const rows = $$(".data-row").map((r) => ({ earned: Number($(".earned", r).value), possible: Number($(".possible", r).value) }));
    const earned = rows.reduce((s, r) => s + (Number.isFinite(r.earned) ? r.earned : 0), 0);
    const possible = rows.reduce((s, r) => s + (Number.isFinite(r.possible) ? r.possible : 0), 0);
    const score = percentage(earned, possible);
    setResult(`<p class="eyebrow">Your current grade</p><p class="result-number">${fmt(score)} ${gradeBadge(score)}</p><p>You earned <strong>${round(earned, 2)} of ${round(possible, 2)} points</strong>.</p>`);
    announce(`Current grade ${fmt(score)}`);
  };
  bindRows({ type: "grade", defaults: [{ earned: 18, possible: 20 }, { earned: 42, possible: 50 }, { earned: 27, possible: 30 }], rowHtml: (v) => `<label>Points earned<input class="earned" type="number" inputmode="decimal" min="0" step="any" value="${v.earned ?? ""}"></label><label>Points possible<input class="possible" type="number" inputmode="decimal" min="0" step="any" value="${v.possible ?? ""}"></label><button class="remove" type="button" aria-label="Remove assignment">Remove</button>`, calculate });
}

function initFinal() {
  const calculate = () => {
    const current = num("#current"), desired = num("#desired"), weight = num("#weight");
    if (!(weight > 0 && weight <= 100)) return setResult("<p>Enter a final exam weight between 1% and 100%.</p>", "warning");
    const needed = finalNeeded(current, desired, weight);
    if (needed > 100) {
      const maximum = maxFinalGrade(current, weight);
      setResult(`<p class="eyebrow">Target check</p><p class="result-title">That target is not mathematically possible.</p><p>You would need <strong>${fmt(needed)}</strong> on the final. Even with 100%, your highest possible course grade is <strong>${fmt(maximum)}</strong> (${letterGrade(maximum)}).</p>`, "warning");
      announce(`Target not possible. Highest possible grade ${fmt(maximum)}`);
    } else if (needed <= 0) {
      setResult(`<p class="eyebrow">You’re already there</p><p class="result-title">You have already secured your target grade.</p><p>Even a 0% on the final leaves you at or above <strong>${fmt(desired)}</strong>.</p>`, "success");
      announce("Target grade already secured");
    } else {
      setResult(`<p class="eyebrow">Score to aim for</p><p class="result-title">You need at least ${fmt(needed)} on the final exam to finish with ${fmt(desired)}.</p><p>Aim for <strong>${Math.ceil(needed)}% or higher</strong> to leave a little margin.</p>`, "success");
      announce(`You need at least ${fmt(needed)} on the final exam`);
    }
  };
  $$("#calculator input").forEach((el) => el.addEventListener("input", calculate)); calculate();
}

function initWeighted() {
  const calculate = () => {
    const rows = $$(".data-row").map((r) => ({ grade: Number($(".grade", r).value), weight: Number($(".weight", r).value) }));
    const result = weightedAverage(rows);
    const normalized = result.score;
    setResult(`<p class="eyebrow">Weighted grade</p><p class="result-number">${fmt(normalized)} ${gradeBadge(normalized)}</p><p>Your entered categories total <strong>${round(result.totalWeight, 1)}%</strong>${Math.abs(result.totalWeight - 100) > .01 ? ". The result is normalized to the weight entered." : "."}</p>`, Math.abs(result.totalWeight - 100) > .01 ? "warning" : "");
    announce(`Weighted grade ${fmt(normalized)}`);
  };
  bindRows({ defaults: [{ grade: 92, weight: 25 }, { grade: 84, weight: 35 }, { grade: 88, weight: 40 }], rowHtml: (v) => `<label>Category grade<input class="grade" type="number" inputmode="decimal" min="0" step="any" value="${v.grade ?? ""}"><span class="suffix">%</span></label><label>Weight<input class="weight" type="number" inputmode="decimal" min="0" step="any" value="${v.weight ?? ""}"><span class="suffix">%</span></label><button class="remove" type="button" aria-label="Remove category">Remove</button>`, calculate });
}

function initGpa() {
  const calculate = () => {
    const rows = $$(".data-row").map((r) => ({ points: Number($("select", r).value), credits: Number($("input", r).value) }));
    const score = gpa(rows);
    setResult(`<p class="eyebrow">Your GPA</p><p class="result-number">${Number.isFinite(score) ? round(score, 2).toFixed(2) : "—"}<span class="grade-badge">4.0 scale</span></p><p>GPA is weighted by each course’s credit hours.</p>`);
    announce(`GPA ${Number.isFinite(score) ? round(score, 2).toFixed(2) : "not available"}`);
  };
  const options = [["A",4],["A−",3.7],["B+",3.3],["B",3],["B−",2.7],["C+",2.3],["C",2],["C−",1.7],["D",1],["F",0]].map(([l,v]) => `<option value="${v}">${l} (${Number(v).toFixed(1)})</option>`).join("");
  bindRows({ defaults: [{ points: 4, credits: 3 }, { points: 3.3, credits: 4 }, { points: 3.7, credits: 3 }], rowHtml: (v) => `<label>Letter grade<select>${options.replace(`value="${v.points}"`, `value="${v.points}" selected`)}</select></label><label>Credit hours<input type="number" inputmode="decimal" min="0.5" step="0.5" value="${v.credits ?? 3}"></label><button class="remove" type="button" aria-label="Remove course">Remove</button>`, calculate });
}

function initTest() {
  const calculate = () => {
    const correct = num("#correct"), total = num("#total"), score = percentage(correct, total);
    if (correct > total) return setResult("<p>Correct answers cannot be greater than total questions.</p>", "warning");
    setResult(`<p class="eyebrow">Test grade</p><p class="result-number">${fmt(score)} ${gradeBadge(score)}</p><p><strong>${correct} of ${total}</strong> answers are correct.</p>`);
    announce(`Test grade ${fmt(score)}`);
  };
  $$("#calculator input").forEach((el) => el.addEventListener("input", calculate)); calculate();
}

function initEz() {
  const calculate = () => {
    const total = Math.min(500, Math.max(1, Math.floor(num("#total")))), wrong = Math.max(0, Math.floor(num("#wrong")));
    if (wrong > total) return setResult("<p>Wrong answers cannot be greater than total questions.</p>", "warning");
    const result = ezGrade(total, wrong);
    setResult(`<p class="eyebrow">Student score</p><p class="result-number">${fmt(result.score)} ${gradeBadge(result.score)}</p><p><strong>${result.correct} of ${total}</strong> answers are correct.</p>`);
    const rows = Array.from({ length: total + 1 }, (_, n) => { const r = ezGrade(total, n); return `<tr${n === wrong ? " class=active" : ""}><td>${n}</td><td>${r.correct}</td><td>${fmt(r.score)}</td><td>${letterGrade(r.score)}</td></tr>`; }).join("");
    $("#grade-chart").innerHTML = rows;
    announce(`Score ${fmt(result.score)}, ${result.correct} correct`);
  };
  $$("#calculator input").forEach((el) => el.addEventListener("input", calculate)); calculate();
}

function initPercentage() {
  const calculate = () => {
    const earned = num("#earned"), possible = num("#possible"), score = percentage(earned, possible);
    setResult(`<p class="eyebrow">Percentage</p><p class="result-number">${fmt(score)} ${gradeBadge(score)}</p><p><strong>${earned}</strong> is ${fmt(score)} of <strong>${possible}</strong>.</p>`);
    announce(`Percentage ${fmt(score)}`);
  };
  $$("#calculator input").forEach((el) => el.addEventListener("input", calculate)); calculate();
}

const initializers = { grade: initGrade, final: initFinal, weighted: initWeighted, gpa: initGpa, test: initTest, ez: initEz, percentage: initPercentage };
const type = document.body.dataset.calculator;
if (initializers[type]) initializers[type]();

const navButton = $(".nav-toggle");
navButton?.addEventListener("click", () => {
  const open = navButton.getAttribute("aria-expanded") === "true";
  navButton.setAttribute("aria-expanded", String(!open));
  $("#site-nav")?.classList.toggle("open", !open);
});
