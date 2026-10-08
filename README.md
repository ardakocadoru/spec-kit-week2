# Quote of the Day

A small static page built spec-first with [GitHub Spec Kit](https://github.com/github/spec-kit):
it shows a random quote from a built-in list, has a **New quote** button, and lets you mark
quotes as favorites that persist across reloads (stored in `localStorage`).

## Run it

Open `index.html` in any modern browser. No server, install, or build step is needed.

## Test it

Requires Node.js 18+ (no packages to install):

```bash
node --test
```

Manual validation steps are in [specs/001-quote-of-the-day/quickstart.md](specs/001-quote-of-the-day/quickstart.md).

## Project layout

| Path | Contents |
|------|----------|
| `.specify/memory/constitution.md` | Project principles (code quality, testing, maintainability) |
| `specs/001-quote-of-the-day/` | Spec, plan, research, data model, contracts, tasks, quickstart |
| `index.html`, `css/`, `js/` | The page |
| `tests/` | Automated tests (`node:test`) |
| `writeup.md` | Assignment write-up |
