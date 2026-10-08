# Week 2 Write-up: Spec-Driven Development with Spec Kit

**Feature:** Quote-of-the-day page (random quote, "New quote" button, favorites that persist across reloads)
**Spec Kit:** specify-cli 1.1.2
**Result:** Converged after 4 converge runs; 25 automated tests passing (`node --test`)

**Where the spec artifacts are:** Spec Kit keeps the constitution in
`.specify/memory/constitution.md` and the feature artifacts (spec, plan, research, data
model, contracts, quickstart, tasks) in `specs/001-quote-of-the-day/`. Both folders are
committed; neither is gitignored.

## 1. Prompts given to each skill

| Stage | Prompt | Output |
|-------|--------|--------|
| `/speckit-constitution` | Create principles focused on code quality, testing, and maintainability. | [constitution.md](.specify/memory/constitution.md) v1.0.0: 5 principles (I. Readable, Single-Purpose Code; II. Test-Backed Behavior (non-negotiable); III. Simplicity Over Cleverness; IV. Defensive Handling of Stored Data; V. Spec Is the Source of Truth), plus quality gates and workflow |
| `/speckit-specify` | A quote-of-the-day page: one random quote from a built-in list, a "New quote" button, and favoriting that persists across reloads. | [spec.md](specs/001-quote-of-the-day/spec.md): 3 prioritized user stories, 11 functional requirements, 5 success criteria, 5 edge cases; [quality checklist](specs/001-quote-of-the-day/checklists/requirements.md) 16/16 |
| `/speckit-plan` | Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage. | [plan.md](specs/001-quote-of-the-day/plan.md), [research.md](specs/001-quote-of-the-day/research.md), [data-model.md](specs/001-quote-of-the-day/data-model.md), [contracts/](specs/001-quote-of-the-day/contracts/), [quickstart.md](specs/001-quote-of-the-day/quickstart.md) |
| `/speckit-tasks` | *(no arguments)* | [tasks.md](specs/001-quote-of-the-day/tasks.md): 19 tasks in 6 phases, tests first |
| `/speckit-implement` | *(no arguments; run 3 times)* | The page (`index.html`, `css/`, `js/`) and tests (`tests/`) |
| `/speckit-converge` | *(no arguments; run 4 times)* | Phases 7–9 appended to tasks.md, then "Converged" |

**Review gate.** I reviewed and approved the constitution and the spec before moving on.
I reviewed the plan, tasks and implementation together with the final result. Two
decisions from these reviews shaped the rest of the project:

- **Spec review.** The feature description was ambiguous in three places. I kept them as
  documented assumptions instead of guessing silently:
  - "random" means no back-to-back repeats;
  - there is no separate favorites list;
  - "of the day" does not mean one quote per calendar day.
- **Plan decision.** The plan loads scripts as classic `<script defer>` tags, not ES
  modules. Browsers block module scripts on `file://`, so ES modules would have shown an
  empty page to anyone who opens `index.html` by double-clicking it (research R1).

The git history has one commit per stage, so the order of events is visible:

```text
Initialize Spec Kit project
Add project constitution v1.0.0
Specify quote-of-the-day feature
Plan quote-of-the-day
Generate tasks (19 tasks, test-first)
Implement (T001-T019, 19 tests passing)
Converge run 1: append T020-T024
Implement T020, T021, T024; halt before T022-T023 on FR-011 wording
Refine FR-011 and plan R6            <-- spec/plan refinement
Converge run 2: append T025-T026
Implement T022, T023, T025, T026
Converge run 3: append T027
Implement T027
(Converge run 4: Converged, no changes)
```

## 2. Spec/plan refinement that changed the output

**What went wrong.** Converge run 1 found that the page code had no automated tests, which
Constitution II requires. While I was writing the test for FR-011, I had to decide exactly
what this requirement meant:

> FR-011 (before): "All controls MUST be usable with a keyboard and MUST have accessible
> names that describe their action and, for the favorite control, its current state."

The plan (research R6 + UI contract) implemented this literally. The button text switched
between "☆ Favorite" and "★ Favorited", and the button also had `aria-pressed`. The result:

- A screen reader would announce the state twice, roughly *"black star Favorited, toggle
  button, pressed"*.
- When pressed, the name stopped describing the action.

This goes against the WAI-ARIA toggle-button pattern, which says a toggle's label must not
change with its state. The code matched the spec; **the spec itself was wrong**. Following
Constitution V, I stopped implementing and changed the spec and plan, not the code.

**Changes to the artifacts** (commit `Refine FR-011 and plan R6`):

| Artifact | Before | After |
|----------|--------|-------|
| spec.md FR-011 | Accessible name describes the action **and the current state** | Accessible name describes the action; the favorite control **keeps the same name in both states** and exposes the state separately |
| research.md R6 | Visible label switches "☆ Favorite" / "★ Favorited" + `aria-pressed` | Text is always "Favorite"; state = `aria-pressed` + a star in `<span aria-hidden="true">` |
| contracts/ui-contract.md | States table: label `☆ Favorite` / `★ Favorited` | States table: icon `☆`/`★`, accessible name always `Favorite`; new `#favorite-icon` element |
| quickstart.md steps 4–6, 8 | "Label becomes ★ Favorited" | "Star fills, button shows pressed style"; screen-reader check added |

**How the output changed.** Converge run 2 compared the code with the refined spec. It
found two `contradicts` gaps and appended tasks T025–T026. Implement then produced:

```diff
- <button type="button" id="favorite-toggle" aria-pressed="false">☆ Favorite</button>
+ <button type="button" id="favorite-toggle" aria-pressed="false">
+   <span id="favorite-icon" aria-hidden="true">☆</span> Favorite
+ </button>
```

```diff
  favoriteButton.setAttribute("aria-pressed", String(isFavorite));
- favoriteButton.textContent = isFavorite ? "★ Favorited" : "☆ Favorite";
+ favoriteIcon.textContent = isFavorite ? "★" : "☆";
```

| | Before | After |
|-|--------|-------|
| Accessible name | "☆ Favorite" → "★ Favorited" (taken from the button text) | "Favorite" in both states (confirmed in the browser accessibility tree) |
| Expected screen-reader announcement when pressed | "black star Favorited, toggle button, pressed" | "Favorite, toggle button, pressed" |
| Visible state | Label text changes | Star fills (☆ → ★) and the button shows its pressed style |
| Tests | No FR-011 test | 2 FR-011 tests (constant name, icon hidden from assistive technology) |

## 3. Convergence outcome

| Run | Findings | Tasks appended | Notes |
|-----|----------|----------------|-------|
| 1 | 4 × missing (CRITICAL, Constitution II) | T020–T024 (Phase 7) | The page worked, but `app.js` behavior (rendering, New quote, favorite indicator, FR-011, storage access throwing) was only checked by hand. Added a dependency-free DOM test harness using `node:vm`. |
| 2 | 2 × contradicts (HIGH, FR-011) | T025–T026 (Phase 8) | Run after the spec/plan refinement above. |
| 3 | 1 × partial (CRITICAL, Constitution II) | T027 (Phase 9) | One test name did not cite the requirement it verifies. |
| 4 | none | none | **✅ Converged — the implementation satisfies the spec, plan, and tasks.** tasks.md left unchanged. |

Final checks:

- `node --test`: 25 passed, 0 failed, 0 skipped. Every FR-001 to FR-011 is referenced by at
  least one test.
- All 9 quickstart checks passed in a real browser, with no console errors:
  - 20/20 "New quote" presses changed the quote;
  - favorites survived a reload;
  - corrupted storage (`{oops`) still loaded a quote;
  - keyboard-only use worked;
  - at 360px width, long quotes wrap without horizontal scroll.
- The page also loads directly from `file://`.

## 4. What I learned

SDD felt like overhead at the start: a constitution, a spec, two contracts and 19 tasks for
a page with two buttons took longer than just building it, and some test-first steps were
ceremony (the FR-005 tests passed on their first run because the plan already excluded the
current quote). It paid off as soon as something was ambiguous: converge caught gaps I would
have shipped, such as the untested page code, and the FR-011 problem was fixed once in the
spec and then flowed through the plan, tasks, code and tests instead of becoming a quiet
code patch. The biggest lesson is that converge only checks code against the spec, so a
spec that is precise but wrong still "converges". That makes the human review of the spec
the step that actually decides quality.
