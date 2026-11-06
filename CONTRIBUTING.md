# Contributing

## Workflow

- `main` always holds the latest agreed state of the project.
- Make changes on a branch named after what you're doing, e.g. `ideas/boss-fight` or `feature/player-movement`.
- Open a pull request to `main` and get the other person to review it before merging.
- Keep commits small and describe what changed and why.

## Where things go

- Ideas and rough notes: `docs/ideas.md`. Anything goes here, even half-formed.
- Decisions: when you settle something, record it in `docs/decisions.md` with a date and a one-line reason.
- Character and story material: `docs/characters.md`.
- Code: `src/`. Assets: `assets/`.

## Working with Claude

- Each of us uses our own Claude account on our own machine. Don't share logins or tokens.
- Never commit API keys, tokens, or `.env` files.
- When asking Claude for help, point it at the relevant doc (for example `docs/ideas.md`) so it has the current context.
