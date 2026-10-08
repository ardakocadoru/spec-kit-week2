# Quote of the Day Constitution

## Core Principles

### I. Readable, Single-Purpose Code

- Every file and function MUST have one clear responsibility that can be stated in a
  single sentence.
- Application logic (choosing quotes, managing favorites) MUST be kept separate from
  DOM rendering so it can be read and tested without a browser.
- Names MUST describe intent (`pickNextQuote`, not `doStuff`). Comments explain *why*,
  never restate *what* the code does.
- Dead code, commented-out code, and unused files MUST NOT be committed.

**Rationale**: A small codebase stays maintainable only if any part of it can be
understood in isolation.

### II. Test-Backed Behavior (NON-NEGOTIABLE)

- Every functional requirement in the spec MUST be covered by at least one automated
  test, and the test MUST reference the requirement ID it verifies.
- Tests MUST run with a single command, without network access or third-party packages.
- A change is not done until the full test suite passes. Failing or skipped tests MUST
  NOT be committed.
- Bugs found after implementation MUST first be reproduced as a failing test, then fixed.

**Rationale**: Tests are the only objective evidence that the code matches the spec.

### III. Simplicity Over Cleverness

- Prefer the platform's built-in capabilities over frameworks, build steps, or
  dependencies. Any added dependency MUST be justified in the plan.
- Build only what the spec requires. Speculative features, options, and abstractions
  are out of scope (YAGNI).
- Static content such as the quote list MUST live in a single, clearly named data
  module, separate from logic.

**Rationale**: Every extra layer is something future maintainers must learn and keep
working.

### IV. Defensive Handling of Stored Data

- Anything read from persistent storage MUST be treated as untrusted: missing,
  malformed, or outdated data MUST NOT crash the page or block core functionality.
- When storage is unavailable or fails, the app MUST keep working for the current
  session and MUST NOT show a raw error to the user.
- Stored data MUST use stable identifiers rather than array positions, so editing the
  data module does not corrupt saved state.

**Rationale**: Browser storage can be cleared, disabled, full, or edited by hand; the
user should never lose the basic experience because of it.

### V. Spec Is the Source of Truth

- Behavior MUST trace to a requirement in the feature spec. Code that implements
  unrequested behavior is a defect, not a bonus.
- When implementation reveals that a requirement is vague or wrong, the spec or plan
  MUST be corrected first, and the code regenerated from the corrected artifact.
  Silent code-only fixes are not allowed.

**Rationale**: The spec is only durable if it stays accurate; otherwise the next change
starts from a document nobody trusts.

## Quality Gates

A change MAY be merged only when all of the following hold:

1. The full automated test suite passes locally.
2. The page loads from a plain file or static server with no console errors.
3. Each acceptance scenario in the spec has been checked, either by an automated test
   or by a recorded manual check.
4. No principle in this constitution is violated, or the violation is documented and
   justified in the plan's Complexity Tracking section.

## Development Workflow

- Work follows the Spec Kit sequence: constitution → specify → plan → tasks →
  implement → converge.
- A human reviews each artifact before the next stage starts. Problems are fixed in the
  artifact where they originate, not patched downstream.
- Implement and converge repeat until converge reports no remaining work.
- Each completed stage is committed separately so the history shows how the feature
  evolved.

## Governance

- This constitution supersedes conflicting guidance in any other project document.
- Amendments require a written rationale, a version bump, and an updated Last Amended
  date. Versioning follows semantic versioning: MAJOR for removed or redefined
  principles, MINOR for added principles or sections, PATCH for wording clarifications.
- Every plan MUST include a Constitution Check, and every converge run MUST treat a
  violated MUST principle as a critical finding.

**Version**: 1.0.0 | **Ratified**: 2026-10-08 | **Last Amended**: 2026-10-08
