// Single source of truth for every GradeKit route.
//
// generate-site.mjs, build.mjs, and tests/ all derive their route lists from
// this file. Adding a page here is the only edit required to publish it.

export const defaultOrigin = "https://gradekit.pages.dev";

export const site = {
  name: "GradeKit",
  tagline: "Fast, private grade tools for students and teachers.",
  // Leave empty until a real inbox exists. The About page renders a contact
  // block only when this is set; affiliate networks usually require one.
  contactEmail: "",
  // Used for sitemap <lastmod> and schema dateModified.
  updated: "2026-08-22",
};

// Affiliate partners. `href` is intentionally empty: with no href the partner
// is omitted from every page, so nothing ships as a broken or undisclosed link.
// Fill href with the real tracking URL to switch the module on site-wide.
export const partners = [
  {
    id: "grammarly",
    name: "Grammarly",
    category: "Writing and grammar",
    summary: "Checks spelling, grammar, and punctuation while you write in a browser or word processor. The free tier covers basic corrections.",
    href: "",
  },
  {
    id: "quillbot",
    name: "QuillBot",
    category: "Paraphrasing and citations",
    summary: "Rewrites sentences you have already drafted and builds citations in APA, MLA, and Chicago. Includes a free tier with a word limit.",
    href: "",
  },
];

export const activePartners = partners.filter((partner) => partner.href);

// Percentage cutoffs that mirror letterGrade() in site/assets/calculators.js.
// The grading-scale-chart page and the tests both read this array, so the
// published chart cannot drift away from what the calculators return.
export const gradeScale = [
  { letter: "A+", min: 97, max: 100, gpa: "4.0" },
  { letter: "A", min: 93, max: 96, gpa: "4.0" },
  { letter: "A−", min: 90, max: 92, gpa: "3.7" },
  { letter: "B+", min: 87, max: 89, gpa: "3.3" },
  { letter: "B", min: 83, max: 86, gpa: "3.0" },
  { letter: "B−", min: 80, max: 82, gpa: "2.7" },
  { letter: "C+", min: 77, max: 79, gpa: "2.3" },
  { letter: "C", min: 73, max: 76, gpa: "2.0" },
  { letter: "C−", min: 70, max: 72, gpa: "1.7" },
  { letter: "D+", min: 67, max: 69, gpa: "1.3" },
  { letter: "D", min: 63, max: 66, gpa: "1.0" },
  { letter: "D−", min: 60, max: 62, gpa: "0.7" },
  { letter: "F", min: 0, max: 59, gpa: "0.0" },
];

const gpaOptions = (selected) => [["A", 4], ["A−", 3.7], ["B+", 3.3], ["B", 3], ["B−", 2.7], ["C+", 2.3], ["C", 2], ["C−", 1.7], ["D", 1], ["F", 0]]
  .map(([label, value]) => `<option value="${value}"${value === selected ? " selected" : ""}>${label} (${Number(value).toFixed(1)})</option>`).join("");

export const tools = {
  "grade-calculator": {
    type: "grade", nav: "Grade", primary: true,
    title: "Grade Calculator",
    seoTitle: "Grade Calculator — Current Class Grade | GradeKit",
    meta: "Calculate your current class grade from assignments and points instantly. Free, private, mobile-friendly, and no sign-up required.",
    lede: "Add your assignments and see your current grade update instantly. No sign-up, no saved data, just a clear answer.",
    card: "Add assignments", hint: "Enter points earned and points possible for each item.",
    ui: `<div id="rows"><div class="data-row"><label>Points earned<input class="earned" type="number" inputmode="decimal" min="0" step="any" value="18"></label><label>Points possible<input class="possible" type="number" inputmode="decimal" min="0" step="any" value="20"></label><button class="remove" type="button" aria-label="Remove assignment">Remove</button></div><div class="data-row"><label>Points earned<input class="earned" type="number" inputmode="decimal" min="0" step="any" value="42"></label><label>Points possible<input class="possible" type="number" inputmode="decimal" min="0" step="any" value="50"></label><button class="remove" type="button" aria-label="Remove assignment">Remove</button></div><div class="data-row"><label>Points earned<input class="earned" type="number" inputmode="decimal" min="0" step="any" value="27"></label><label>Points possible<input class="possible" type="number" inputmode="decimal" min="0" step="any" value="30"></label><button class="remove" type="button" aria-label="Remove assignment">Remove</button></div></div><button class="add-button" id="add-row" type="button">+ Add assignment</button>`,
    method: "Add all points you earned, add all points possible, then divide the two totals. This points-based method works when assignments are not separated into weighted categories.",
    formula: "Current grade = (total points earned ÷ total points possible) × 100",
    example: "If you earned 87 points out of 100 possible points, your current grade is 87%, typically a B+ on a standard U.S. scale.",
    notes: [
      "If your syllabus splits work into categories such as homework, quizzes, and exams with different percentages, the points method will disagree with your gradebook. Use the <a href=\"/weighted-grade-calculator/\">weighted grade calculator</a> instead.",
      "Ungraded or excused assignments should be left out entirely rather than entered as a zero.",
      "Enter each assignment separately instead of pre-totalling. Keeping the rows apart makes it obvious which item is dragging the average down.",
      "Once you know your current grade, the <a href=\"/final-grade-calculator/\">final grade calculator</a> converts it into the exam score you still need.",
    ],
    faqs: [["What grade scale does this calculator use?", "The letter-grade label uses a common U.S. plus/minus scale, listed in full on the <a href=\"/grading-scale-chart/\">grading scale chart</a>. Your school may use different cutoffs, so the percentage is the authoritative result."], ["Can I include extra credit?", "Yes. Add extra-credit points to points earned. If the assignment adds points without increasing points possible, enter 0 as its possible points."], ["Is my grade data stored?", "No. Every calculation happens in your browser and GradeKit does not send or save your entries."]],
    related: ["weighted-grade-calculator", "final-grade-calculator", "percentage-grade-calculator"],
  },
  "final-grade-calculator": {
    type: "final", nav: "Final Grade", primary: true,
    title: "Final Grade Calculator",
    seoTitle: "Final Grade Calculator — Score You Need | GradeKit",
    meta: "Find the score you need on your final exam to reach your target course grade, including impossible-target and best-case checks.",
    lede: "See the exact final exam score you need—and whether your target is still mathematically possible.",
    card: "Plan your final", hint: "Use your current course grade before the final exam.",
    ui: `<div class="fields three"><label>Current grade<input id="current" type="number" inputmode="decimal" min="0" max="100" step="any" value="84"><span class="suffix">%</span></label><label>Desired grade<input id="desired" type="number" inputmode="decimal" min="0" max="100" step="any" value="90"><span class="suffix">%</span></label><label>Final exam weight<input id="weight" type="number" inputmode="decimal" min="1" max="100" step="any" value="35"><span class="suffix">%</span></label></div>`,
    method: "The calculator treats your current grade as the portion of the course completed before the final. It solves the weighted-grade equation for the unknown final exam score.",
    formula: "Required final score = [target grade − current grade × (1 − final weight)] ÷ final weight",
    example: "With an 84% current grade, a 90% target, and a final worth 35%, you need about 101.1%. That target is impossible without extra credit; a perfect final would produce a maximum course grade of 89.6%.",
    notes: [
      "Find the final exam weight on your syllabus, not in your gradebook. Gradebooks often hide the exam until it is graded, which makes the displayed course grade look higher than it really is.",
      "Your current grade must exclude the final. If the final is already averaged in, the answer will be wrong.",
      "Not sure what your current grade is? Work it out first with the <a href=\"/grade-calculator/\">grade calculator</a>.",
      "When the required score comes back above 100%, the realistic move is to lower the target by one letter step and re-run the numbers.",
    ],
    faqs: [["What if the required score is over 100%?", "Your target is not reachable under the entered weights unless extra credit is available. GradeKit shows the highest grade you can finish with after scoring 100% on the final."], ["What does a negative required score mean?", "You have already secured the target grade. A zero on the final would still leave your overall course grade at or above the target."], ["Should I round the required score?", "Aim above the displayed number. GradeKit shows one decimal place, but your instructor may keep more precision or apply a different rounding policy."]],
    related: ["grade-calculator", "semester-grade-calculator", "weighted-grade-calculator"],
  },
  "weighted-grade-calculator": {
    type: "weighted", nav: "Weighted", primary: true,
    title: "Weighted Grade Calculator",
    seoTitle: "Weighted Grade Calculator by Category | GradeKit",
    meta: "Calculate a weighted course grade from categories such as homework, quizzes, exams, and projects. Instant and free.",
    lede: "Combine category grades with different weights and see your overall course grade as you type.",
    card: "Enter grade categories", hint: "Weights can total 100%, or the calculator will normalize what you enter.",
    ui: `<div id="rows">${[[92, 25], [84, 35], [88, 40]].map(([g, w]) => `<div class="data-row"><label>Category grade<input class="grade" type="number" inputmode="decimal" min="0" step="any" value="${g}"><span class="suffix">%</span></label><label>Weight<input class="weight" type="number" inputmode="decimal" min="0" step="any" value="${w}"><span class="suffix">%</span></label><button class="remove" type="button" aria-label="Remove category">Remove</button></div>`).join("")}</div><button class="add-button" id="add-row" type="button">+ Add category</button>`,
    method: "Multiply each category grade by its weight, add the products, then divide by the total weight entered. When weights total 100%, the last division is effectively by 100.",
    formula: "Weighted grade = Σ(category grade × category weight) ÷ Σ(weights)",
    example: "Homework at 92% × 25%, exams at 84% × 35%, and projects at 88% × 40% produce an overall weighted grade of 87.6%.",
    notes: [
      "Entering fewer than all of your categories still works. GradeKit normalizes to the weight you entered, which answers “where do I stand in the graded work so far”.",
      "A category with no graded work yet should be left out rather than entered as 0%, which would read as a failing score.",
      "Get each category percentage from the <a href=\"/grade-calculator/\">grade calculator</a> first if your gradebook only shows raw points.",
      "Copy the weights from the syllabus verbatim. Instructors frequently change them mid-term and the printed version is the one that counts.",
    ],
    faqs: [["Do my weights have to total 100%?", "Ideally, yes. If they do not, GradeKit normalizes the entered categories so you can still estimate the grade represented by them."], ["How do I calculate a category grade?", "Add points earned in that category and divide by its total possible points, or use the <a href=\"/grade-calculator/\">grade calculator</a> first."], ["Can I use decimal weights?", "Yes. Decimal grades and weights are supported."]],
    related: ["grade-calculator", "semester-grade-calculator", "final-grade-calculator"],
  },
  "gpa-calculator": {
    type: "gpa", nav: "GPA", primary: true,
    title: "GPA Calculator",
    seoTitle: "GPA Calculator — College 4.0 Scale | GradeKit",
    meta: "Calculate your college GPA on a 4.0 scale using course letter grades and credit hours. Fast, free, and private.",
    lede: "Estimate your GPA on a standard 4.0 scale, weighted by each course’s credit hours.",
    card: "Add your courses", hint: "Choose each final letter grade and enter its credit hours.",
    ui: `<div id="rows">${[[4, 3], [3.3, 4], [3.7, 3]].map(([v, c]) => `<div class="data-row"><label>Letter grade<select>${gpaOptions(v)}</select></label><label>Credit hours<input type="number" inputmode="decimal" min="0.5" step="0.5" value="${c}"></label><button class="remove" type="button" aria-label="Remove course">Remove</button></div>`).join("")}</div><button class="add-button" id="add-row" type="button">+ Add course</button>`,
    method: "Convert each letter grade to grade points, multiply by course credits, add those quality points, then divide by total attempted credits.",
    formula: "GPA = Σ(grade points × credit hours) ÷ Σ(credit hours)",
    example: "An A in a 3-credit class, B+ in a 4-credit class, and A− in a 3-credit class gives (4.0×3 + 3.3×4 + 3.7×3) ÷ 10 = 3.63 GPA.",
    notes: [
      "Credit hours matter more than most students expect. One weak grade in a 4-credit course moves the GPA further than two weak grades in 1-credit courses.",
      "For a term GPA, enter only that term’s courses. For a cumulative GPA, enter every graded course you have taken.",
      "High school students taking honors, AP, or IB courses should use the <a href=\"/high-school-gpa-calculator/\">high school GPA calculator</a>, which adds the extra weighting.",
      "Letter grades that map to percentages differently at your school can be checked against the <a href=\"/grading-scale-chart/\">grading scale chart</a>.",
    ],
    faqs: [["Does this calculate weighted high-school GPA?", "No. This version uses a standard unweighted 4.0 college scale. For honors and AP weighting, use the <a href=\"/high-school-gpa-calculator/\">high school GPA calculator</a>."], ["What about pass/fail courses?", "Courses without grade points normally do not affect GPA, so leave them out unless your institution says otherwise."], ["Will this exactly match my transcript?", "It is an estimate. Repeat-course, withdrawal, plus/minus, and rounding policies vary by institution."]],
    related: ["high-school-gpa-calculator", "grading-scale-chart", "grade-calculator"],
  },
  "test-grade-calculator": {
    type: "test", nav: "Test Grade", primary: true,
    title: "Test Grade Calculator",
    seoTitle: "Test Grade Calculator — Score & Letter | GradeKit",
    meta: "Convert correct answers into a test percentage and letter grade instantly. Free calculator for students and teachers.",
    lede: "Turn correct answers into a percentage and letter grade in one step.",
    card: "Calculate a test score", hint: "Enter the number of correct answers and total questions.",
    ui: `<div class="fields two"><label>Correct answers<input id="correct" type="number" inputmode="numeric" min="0" step="1" value="46"></label><label>Total questions<input id="total" type="number" inputmode="numeric" min="1" step="1" value="50"></label></div>`,
    method: "Divide the number of correct answers by the total number of questions, then multiply by 100. The letter label uses a common U.S. plus/minus scale.",
    formula: "Test percentage = (correct answers ÷ total questions) × 100",
    example: "If 46 answers are correct on a 50-question test, 46 ÷ 50 × 100 = 92%, typically an A−.",
    notes: [
      "This page assumes every question is worth the same number of points. Mixed point values need the <a href=\"/percentage-grade-calculator/\">percentage grade calculator</a>.",
      "Teachers grading a full stack of papers usually want the <a href=\"/ez-grader/\">EZ Grader</a>, which prints one chart covering every possible number wrong.",
      "If the test was curved, run the raw score through the <a href=\"/grade-curve-calculator/\">grade curve calculator</a> before reading the letter grade.",
    ],
    faqs: [["How do I calculate from wrong answers instead?", "Subtract wrong answers from total questions to find correct answers, or use the <a href=\"/ez-grader/\">EZ Grader</a> page."], ["Does every question have equal value?", "This calculator assumes equal points per question. For questions with different point values, use the <a href=\"/grade-calculator/\">grade calculator</a>."], ["Can teachers use this calculator?", "Yes. For a full score chart covering every possible number wrong, use <a href=\"/ez-grader/\">EZ Grader</a>."]],
    related: ["ez-grader", "percentage-grade-calculator", "grade-curve-calculator"],
  },
  "ez-grader": {
    type: "ez", nav: "EZ Grader", primary: true,
    title: "EZ Grader",
    seoTitle: "EZ Grader — Free Online Grading Chart | GradeKit",
    meta: "Free EZ Grader for teachers. Enter total questions and answers wrong to get the score, letter grade, and a complete printable grading chart.",
    lede: "Grade a test instantly and generate a complete score chart for every possible number wrong.",
    card: "Build a grading chart", hint: "Enter total questions and the selected student’s wrong answers.",
    ui: `<div class="fields two"><label>Total questions<input id="total" type="number" inputmode="numeric" min="1" max="500" step="1" value="50"></label><label>Answers wrong<input id="wrong" type="number" inputmode="numeric" min="0" step="1" value="4"></label></div><div class="grade-table-wrap"><table><thead><tr><th>Wrong</th><th>Correct</th><th>Score</th><th>Grade</th></tr></thead><tbody id="grade-chart"></tbody></table></div>`,
    method: "Subtract wrong answers from total questions. Divide correct answers by total questions and multiply by 100. The chart repeats this for every possible number wrong.",
    formula: "Score = [(total questions − wrong answers) ÷ total questions] × 100",
    example: "On a 50-question test with 4 wrong answers, the student has 46 correct. The score is 46 ÷ 50 × 100 = 92%, typically an A−.",
    notes: [
      "Print the chart once per assignment and mark scores by hand. The printed layout drops the navigation and keeps only the table and the result.",
      "The highlighted row follows the “answers wrong” field, so you can keep the chart open and change one number per paper.",
      "To curve a whole class after grading, move the raw scores into the <a href=\"/grade-curve-calculator/\">grade curve calculator</a>.",
    ],
    faqs: [["Can I print the EZ Grader chart?", "Yes. Use your browser’s Print command. GradeKit includes a clean print layout and does not require a separate PDF download."], ["Can I change the letter-grade scale?", "The current version uses a common U.S. plus/minus scale, published on the <a href=\"/grading-scale-chart/\">grading scale chart</a>. Use the percentage column if your school has different cutoffs."], ["What is the maximum test length?", "The interface supports up to 500 questions to keep the generated chart practical."]],
    related: ["test-grade-calculator", "grade-curve-calculator", "grading-scale-chart"],
  },
  "percentage-grade-calculator": {
    type: "percentage", nav: "Percentage", primary: false,
    title: "Percentage Grade Calculator",
    seoTitle: "Percentage Grade Calculator — Points to % | GradeKit",
    meta: "Convert points earned and points possible into a percentage and letter grade instantly. Free and mobile-friendly.",
    lede: "Convert any points-based score into a percentage and common letter grade.",
    card: "Convert points to a grade", hint: "Enter the points earned and the maximum points possible.",
    ui: `<div class="fields two"><label>Points earned<input id="earned" type="number" inputmode="decimal" min="0" step="any" value="37"></label><label>Points possible<input id="possible" type="number" inputmode="decimal" min="0.01" step="any" value="40"></label></div>`,
    method: "Divide points earned by points possible and multiply by 100. This works for a single assignment, quiz, project, or any points-based score.",
    formula: "Percentage grade = (points earned ÷ points possible) × 100",
    example: "If you earned 37 points out of 40, then 37 ÷ 40 × 100 = 92.5%, typically an A−.",
    notes: [
      "Use the real point values rather than the question count when questions are worth different amounts.",
      "Percentages above 100% are legitimate when extra credit pushes points earned past points possible.",
      "Converting several assignments at once is faster in the <a href=\"/grade-calculator/\">grade calculator</a>, which totals the rows for you.",
    ],
    faqs: [["Can a percentage be over 100%?", "Yes, if extra credit makes points earned greater than points possible."], ["What if the assignment has weighted questions?", "Add the actual points earned and possible across all questions rather than using the question count."], ["How is this different from the Grade Calculator?", "This page converts one points total. The <a href=\"/grade-calculator/\">grade calculator</a> lets you add multiple assignments and total them automatically."]],
    related: ["grade-calculator", "test-grade-calculator", "grading-scale-chart"],
  },
  "semester-grade-calculator": {
    type: "semester", nav: "Semester", primary: false,
    title: "Semester Grade Calculator",
    seoTitle: "Semester Grade Calculator — Quarters + Final | GradeKit",
    meta: "Combine two quarter or term grades with a final exam to find your semester grade. Free calculator with adjustable weights.",
    lede: "Combine your quarter grades and the final exam into one semester grade, using your school’s own weighting.",
    card: "Enter your term grades", hint: "The default 40 / 40 / 20 split is the most common U.S. high school pattern.",
    ui: `<div class="fields three"><label>Term 1 grade<input id="term1" type="number" inputmode="decimal" min="0" step="any" value="88"><span class="suffix">%</span></label><label>Term 2 grade<input id="term2" type="number" inputmode="decimal" min="0" step="any" value="82"><span class="suffix">%</span></label><label>Final exam<input id="exam" type="number" inputmode="decimal" min="0" step="any" value="91"><span class="suffix">%</span></label></div><div class="fields three"><label>Term 1 weight<input id="w1" type="number" inputmode="decimal" min="0" step="any" value="40"><span class="suffix">%</span></label><label>Term 2 weight<input id="w2" type="number" inputmode="decimal" min="0" step="any" value="40"><span class="suffix">%</span></label><label>Exam weight<input id="w3" type="number" inputmode="decimal" min="0" step="any" value="20"><span class="suffix">%</span></label></div>`,
    method: "Multiply each term grade and the final exam by its share of the semester, add the three products, then divide by the total weight. Most U.S. high schools weight the two quarters at 40% each and the semester exam at 20%.",
    formula: "Semester grade = (T1 × w1 + T2 × w2 + exam × w3) ÷ (w1 + w2 + w3)",
    example: "Quarters of 88% and 82% at 40% each, with a 91% final exam at 20%, give (88×40 + 82×40 + 91×20) ÷ 100 = 86.2%.",
    notes: [
      "Weights vary widely. Some schools use 45 / 45 / 10, and some drop the exam entirely for students above a cutoff — check the student handbook before trusting the default.",
      "The exam field can be left at the term average to preview a “no surprises” semester grade, then lowered to test the worst case.",
      "To work backwards from a target semester grade to the exam score you need, use the <a href=\"/final-grade-calculator/\">final grade calculator</a>.",
      "Courses graded by category rather than by term belong in the <a href=\"/weighted-grade-calculator/\">weighted grade calculator</a>.",
    ],
    faqs: [["What if my school does not give a semester exam?", "Set the exam weight to 0. The calculator then averages the two terms using the weights you entered."], ["Do the three weights have to total 100%?", "No. GradeKit divides by the total weight you entered, so 45 / 45 / 10 or any other split works."], ["Can I use this for a trimester course?", "Yes. Enter the first two trimesters in the term fields and the third in the exam field, then set the weights your school uses."]],
    related: ["final-grade-calculator", "weighted-grade-calculator", "grade-calculator"],
  },
  "high-school-gpa-calculator": {
    type: "hsgpa", nav: "HS GPA", primary: false,
    title: "High School GPA Calculator",
    seoTitle: "High School GPA Calculator — Weighted | GradeKit",
    meta: "Calculate weighted and unweighted high school GPA with honors, AP, and IB bonus points. Free, instant, and private.",
    lede: "See your weighted and unweighted high school GPA side by side, with honors and AP bonus points applied.",
    card: "Add your courses", hint: "Pick the grade, the course level, and the credits each course is worth.",
    ui: `<div id="rows">${[[4, 1, 1], [3.3, 0.5, 1], [3.7, 0, 1]].map(([g, b, c]) => `<div class="data-row three"><label>Grade<select class="grade">${gpaOptions(g)}</select></label><label>Level<select class="level"><option value="0"${b === 0 ? " selected" : ""}>Regular (+0.0)</option><option value="0.5"${b === 0.5 ? " selected" : ""}>Honors (+0.5)</option><option value="1"${b === 1 ? " selected" : ""}>AP / IB (+1.0)</option></select></label><label>Credits<input class="credits" type="number" inputmode="decimal" min="0.5" step="0.5" value="${c}"></label><button class="remove" type="button" aria-label="Remove course">Remove</button></div>`).join("")}</div><button class="add-button" id="add-row" type="button">+ Add course</button>`,
    method: "Convert each letter grade to grade points on the 4.0 scale, add the bonus for honors or AP and IB courses, multiply by the course credits, then divide the total by the credits attempted. The unweighted figure repeats the calculation with no bonus.",
    formula: "Weighted GPA = Σ((grade points + level bonus) × credits) ÷ Σ(credits)",
    example: "An A in an AP course, a B+ in an honors course, and an A− in a regular course, each worth 1 credit, give a weighted GPA of 4.17 and an unweighted GPA of 3.67.",
    notes: [
      "Bonus values are not standardized. +1.0 for AP and +0.5 for honors is the most common pattern, but some districts use +1.0 for both and a few use none at all.",
      "Colleges frequently recalculate GPA using their own scale, so the unweighted number is usually the safer one to quote on an application.",
      "Weighted GPA above 4.0 is expected once AP or IB courses are included; it is not an error.",
      "For a college transcript on a straight 4.0 scale with credit hours, use the <a href=\"/gpa-calculator/\">GPA calculator</a>.",
    ],
    faqs: [["Why are my weighted and unweighted GPAs different?", "The weighted figure adds bonus points for honors, AP, and IB courses. The unweighted figure caps every course at 4.0 regardless of difficulty."], ["Which GPA do colleges look at?", "Most recalculate from your transcript using their own formula. Reporting the unweighted GPA alongside your course rigor is the standard approach."], ["Can weighted GPA go above 5.0?", "It can at schools that award more than +1.0, though the +1.0 maximum used here caps a straight-A AP schedule at 5.0."]],
    related: ["gpa-calculator", "grading-scale-chart", "semester-grade-calculator"],
  },
  "grade-curve-calculator": {
    type: "curve", nav: "Curve", primary: false,
    title: "Grade Curve Calculator",
    seoTitle: "Grade Curve Calculator — 3 Methods | GradeKit",
    meta: "Curve a test score three ways at once: flat point curve, square root curve, and scaling to the highest score in the class. Free tool for teachers.",
    lede: "Compare the three common curving methods on the same score before you commit to one.",
    card: "Curve a score", hint: "Enter the raw score, then the values each method needs.",
    ui: `<div class="fields three"><label>Raw score<input id="raw" type="number" inputmode="decimal" min="0" max="100" step="any" value="72"><span class="suffix">%</span></label><label>Flat points to add<input id="flat" type="number" inputmode="decimal" min="0" step="any" value="5"></label><label>Highest score in class<input id="top" type="number" inputmode="decimal" min="1" max="100" step="any" value="88"><span class="suffix">%</span></label></div>`,
    method: "A flat curve adds the same number of points to every score. A square root curve takes the square root of the score and multiplies by ten, which lifts low scores far more than high ones. Scaling to the top treats the highest score in the class as 100% and rescales everyone proportionally.",
    formula: "Flat = raw + points · Square root = √raw × 10 · Scaled = (raw ÷ top score) × 100",
    example: "A raw score of 72% becomes 77% with a 5-point flat curve, 84.9% with a square root curve, and 81.8% when scaled against a class high of 88%.",
    notes: [
      "The square root curve helps the bottom of the class most: a 36% rises to 60%, while a 90% only rises to 94.9%. Use it when a test was harder than intended across the board.",
      "Scaling to the top score is sensitive to a single outlier. One unusually strong paper compresses the curve for everyone else.",
      "A flat curve preserves the gaps between students exactly, which makes it the easiest method to defend if a grade is challenged.",
      "Grade the papers first with the <a href=\"/ez-grader/\">EZ Grader</a>, then curve the resulting percentages here.",
    ],
    faqs: [["Which curving method is fairest?", "There is no single answer. A flat curve preserves rank gaps, a square root curve compresses them at the bottom, and scaling to the top rewards relative performance. Pick one before you see the scores."], ["Can a curve push a score above 100%?", "A flat curve can. GradeKit shows the uncapped figure so you can decide whether to cap it at 100%."], ["Does curving change the letter grade cutoffs?", "No. This tool changes the score, not the scale. Compare the curved percentage against the <a href=\"/grading-scale-chart/\">grading scale chart</a>."]],
    related: ["ez-grader", "test-grade-calculator", "grading-scale-chart"],
  },
  "grading-scale-chart": {
    kind: "reference", nav: "Scale Chart", primary: false,
    title: "Grading Scale Chart",
    seoTitle: "Grading Scale Chart — Letter Grade to % | GradeKit",
    meta: "Letter grade to percentage to GPA conversion chart for the standard U.S. plus/minus scale, plus the 10-point scale and common variations.",
    lede: "The percentage range behind every letter grade, and what each one is worth on a 4.0 scale.",
    method: "The plus/minus scale below is the one GradeKit’s calculators use. Each letter covers a three-point percentage band, except F, which covers everything under 60%.",
    formula: "Letter grade = the band your percentage falls into · GPA points = the 4.0-scale value of that letter",
    example: "An 85% falls in the 83–86 band, which is a B, worth 3.0 grade points. An 89% falls in the 87–89 band, which is a B+, worth 3.3.",
    notes: [
      "Schools on a straight 10-point scale drop the plus and minus bands: 90–100 is an A, 80–89 a B, 70–79 a C, 60–69 a D, and below 60 an F.",
      "A few institutions award 4.3 grade points for an A+ rather than capping at 4.0. Check your registrar before assuming either.",
      "Percentage bands are set by the school, not by law, so always treat your own syllabus as authoritative over any published chart.",
      "To convert a score into a letter automatically, use the <a href=\"/percentage-grade-calculator/\">percentage grade calculator</a>.",
    ],
    faqs: [["What letter grade is 85 percent?", "On the standard plus/minus scale, 85% is a B. On a straight 10-point scale it is also a B, since 80–89 forms a single band."], ["Is a 90 an A or an A minus?", "On the plus/minus scale used here, 90–92 is an A−, and an A starts at 93. On a 10-point scale, 90 is a plain A."], ["What percentage is a 3.0 GPA?", "A 3.0 corresponds to a B, which is 83–86% on the plus/minus scale. Cumulative GPA is an average across courses, so it maps to a percentage only loosely."]],
    related: ["percentage-grade-calculator", "gpa-calculator", "high-school-gpa-calculator"],
  },
};

export const docs = {
  "study-tools": {
    title: "Study Tools for Students",
    seoTitle: "Free & Low-Cost Study Tools for Students | GradeKit",
    meta: "A short, honest list of the tools that actually help with coursework — what each category is for, and when the free tier is enough.",
    lede: "A short list of tools worth knowing about, grouped by the problem they solve.",
    kind: "resource",
    body: `<p>GradeKit’s calculators tell you where your grade stands. They do not help you write the paper, keep the reading straight, or remember the deadline. These are the categories of tool that do, along with what to look for before paying for any of them.</p>
<h2>Start with what your school already pays for</h2>
<p>Before buying anything, check your library portal. Most universities and many high schools already license citation managers, grammar tools, and full research databases. Students routinely pay for software their tuition already covers.</p>
<h2>Writing and grammar</h2>
<p>A grammar checker catches the mechanical errors that cost easy points on a rubric — subject-verb agreement, comma splices, inconsistent tense. The free tiers of the mainstream options handle this well. Paid tiers mostly add tone and style suggestions, which matter more for professional writing than for coursework.</p>
<h2>Paraphrasing and citations</h2>
<p>Citation generators save real time on a long bibliography, but they get edge cases wrong: edited volumes, government reports, anything with a corporate author. Always check the generated entry against your style guide. On paraphrasing tools, one caution worth stating plainly — rewording a source is still using that source, and it still needs a citation. Check your institution’s academic integrity policy before relying on one.</p>
<h2>Spaced repetition and note-taking</h2>
<p>For anything that has to be memorised — vocabulary, formulas, anatomy — a spaced repetition system beats re-reading by a wide margin, and the well-established options in this category are free and open source. Note-taking apps are largely interchangeable; the one you will actually open every day is the right one.</p>
<h2>How to decide whether to pay</h2>
<p>Use the free tier for a full assignment cycle first. If you hit the limit repeatedly and the tool measurably saved you time, the subscription is defensible. If you used it twice in a month, it is not. Student discounts are common and are usually worth asking for directly.</p>`,
    faqs: [["Does GradeKit charge for anything?", "No. Every calculator on this site is free, requires no account, and runs entirely in your browser."], ["Are the links on this page affiliate links?", "Some may be. When a link earns GradeKit a commission it is marked, and the full policy is on the <a href=\"/affiliate-disclosure/\">affiliate disclosure</a> page. Commissions never change what appears here."]],
  },
  about: {
    title: "About GradeKit",
    seoTitle: "About GradeKit — Who Builds These Calculators",
    meta: "What GradeKit is, how the calculators are built and verified, how the site is funded, and how to report an error.",
    lede: "A small, independent set of grade calculators, built to answer one question per page.",
    kind: "doc",
    contact: true,
    body: `<h2>What this is</h2>
<p>GradeKit is an independent, free set of grade calculators for students and teachers. There is no company behind it and no funding round — it is a small static website, built and maintained by one person.</p>
<h2>How the calculators are built</h2>
<p>Every calculation runs as a plain JavaScript function in your browser. There is no server, no API call, and no database. The functions are covered by an automated test suite that runs on every change, and each page publishes the formula it uses so you can check the arithmetic by hand.</p>
<p>The percentage-to-letter mapping used across the site is published in full on the <a href="/grading-scale-chart/">grading scale chart</a>. It follows the common U.S. plus/minus scale. Schools set their own cutoffs, so your syllabus always outranks anything here.</p>
<h2>What GradeKit will not do</h2>
<p>It will not ask you to create an account, will not email you, and will not store the numbers you type. It is not a gradebook, not a transcript, and not a substitute for what your instructor records. Every result is an estimate of what your official grade should be.</p>
<h2>How the site is funded</h2>
<p>The calculators are free and will stay free. Some outbound links to third-party study tools may earn a commission, which is disclosed on the <a href="/affiliate-disclosure/">affiliate disclosure</a> page and marked wherever it applies. No calculator result changes based on a commission.</p>
<h2>Reporting an error</h2>
<p>If a calculator disagrees with your official grade, the cause is almost always a difference in weighting or rounding policy rather than a bug — but the formula on each page makes that easy to confirm. If the math itself is wrong, it should be reported and fixed.</p>`,
    faqs: [["Who is GradeKit for?", "Students checking where a grade stands, and teachers grading tests. Every page is built around one question so neither group has to wade through options they do not need."], ["Is GradeKit affiliated with any school?", "No. It is independent and not endorsed by, affiliated with, or operated by any school, district, or university."]],
  },
  privacy: {
    title: "Privacy Policy",
    seoTitle: "Privacy Policy | GradeKit",
    meta: "GradeKit does not collect personal data. Calculations run in your browser and nothing you enter is transmitted or stored.",
    lede: "The short version: the numbers you type never leave your device.",
    kind: "doc",
    body: `<h2>What GradeKit collects</h2>
<p>Nothing you type. Every calculator runs entirely in your browser. Grades, points, credit hours, and scores are processed on your device and are never transmitted to GradeKit or to anyone else. Nothing is written to a server, a database, or browser storage, and closing the tab discards it all.</p>
<h2>Accounts and email</h2>
<p>GradeKit has no accounts, no login, no newsletter, and no contact form. There is no way for the site to learn your name or email address, because it never asks for either.</p>
<h2>Cookies</h2>
<p>GradeKit sets no cookies of its own and uses no cookie-based tracking or advertising network.</p>
<h2>Analytics</h2>
<p>If aggregate traffic analytics are enabled, they are limited to a privacy-preserving, cookieless measurement of page views and referrers. Such analytics do not identify individual visitors, do not follow you across sites, and never receive the values you enter into a calculator.</p>
<h2>Hosting and server logs</h2>
<p>The site is served as static files by Cloudflare Pages. Like every web host, Cloudflare processes standard request data — IP address, user agent, and requested URL — to deliver pages and defend against abuse. That processing is governed by Cloudflare’s own privacy policy, and GradeKit has no access to your grade data through it because the data is never sent.</p>
<h2>Links to other sites</h2>
<p>Some pages link to third-party tools, and some of those links may be affiliate links, as described on the <a href="/affiliate-disclosure/">affiliate disclosure</a> page. Once you follow an outbound link you are on that company’s site, under their privacy policy, not this one.</p>
<h2>Children</h2>
<p>GradeKit is intended for general audiences including school-age students. Because it collects no personal information from anyone, it collects none from children either.</p>
<h2>Changes</h2>
<p>If this policy changes in a way that affects what is collected, the updated policy will be published on this page.</p>`,
    faqs: [["Do you store my grades?", "No. Calculations run in your browser and the values you enter are never sent anywhere or saved between visits."], ["Do you use advertising cookies?", "No. GradeKit runs no advertising network and sets no cookies of its own."]],
  },
  "affiliate-disclosure": {
    title: "Affiliate Disclosure",
    seoTitle: "Affiliate Disclosure | GradeKit",
    meta: "How GradeKit is funded: which links may earn a commission, what that does and does not influence, and how recommendations are chosen.",
    lede: "How this site pays for itself, stated plainly.",
    kind: "doc",
    body: `<h2>The disclosure</h2>
<p>Some outbound links on GradeKit are affiliate links. If you follow one and later subscribe to or purchase the product, GradeKit may receive a commission from that company at no additional cost to you. This disclosure is made in accordance with the U.S. Federal Trade Commission’s guidance on endorsements and testimonials.</p>
<h2>Where those links appear</h2>
<p>Affiliate links appear only in clearly labelled recommendation sections and on the <a href="/study-tools/">study tools</a> page. They never appear inside a calculator, inside a result, or anywhere they could be mistaken for part of a grade calculation.</p>
<h2>What a commission does not affect</h2>
<p>It does not affect any number this site produces. The calculators are plain arithmetic, published formula by formula on each page, and there is no commercial arrangement that could change a result. It also does not affect the price you pay — affiliate pricing is the same as going direct.</p>
<h2>How recommendations are chosen</h2>
<p>A tool is listed because it is genuinely relevant to coursework, not because it pays the most. Where a free or open-source option does the job, that is said openly, including when it means no commission. Tools with no affiliate program are listed on the same footing as tools that have one.</p>
<h2>The calculators stay free</h2>
<p>Commissions exist so that the calculators can remain free, ad-free, and account-free. If you would rather not use an affiliate link, going directly to the company’s site works exactly the same for you.</p>`,
    faqs: [["Does using an affiliate link cost me more?", "No. The price is identical whether you use the link or go directly to the company’s website."], ["Are calculator results influenced by advertisers?", "No. Every formula is published on the page that uses it, and no commercial arrangement changes the arithmetic."]],
  },
};

export const toolSlugs = Object.keys(tools);
export const docSlugs = Object.keys(docs);
export const allPages = { ...tools, ...docs };

/** Canonical routes, home first. Drives sitemap.xml, sitemap.txt, and the tests. */
export const routes = ["", ...toolSlugs.map((slug) => `${slug}/`), ...docSlugs.map((slug) => `${slug}/`)];

/** Everything build.mjs copies from site/ into dist/. */
export const copyItems = [
  "index.html", "404.html", "robots.txt", "sitemap.xml", "sitemap.txt",
  "google037f1ca7862cb5a0.html", "_headers", "assets",
  ...toolSlugs, ...docSlugs,
];

/** Files whose canonical origin build.mjs rewrites from SITE_URL. */
export const originFiles = [
  "index.html", "404.html", "robots.txt", "sitemap.xml", "sitemap.txt",
  ...toolSlugs.map((slug) => `${slug}/index.html`),
  ...docSlugs.map((slug) => `${slug}/index.html`),
];
