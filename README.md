# Spice Master Eddy

A humorous spice-factory simulator set in **Kaasland**. Eddy Sr. hands Eddy Jr. the keys to
his warehouse, which is full of old machinery. Sell the junk on the old Windows 95 PC, buy
your first spices and a mixing table, and sell blends to Dad's old customers. Then take on
fussier clients who want ever more complicated mixtures, and hire the Naknikim to do the
boring work. Think *Drug Dealer Simulator*, but spices, seen over the shoulder.

Built in **Godot 4.4** with a high third-person camera. Design canon is in
[`docs/decisions.md`](docs/decisions.md); unapproved ideas are in [`docs/ideas.md`](docs/ideas.md).

**Status:** early scaffold. The main scene is a greybox with a placeholder Eddy Jr. and
the follow camera, so the team has something to build on.

## Getting started
1. Install **Godot 4.4-stable** (standard build, not .NET) from
   [godotengine.org](https://godotengine.org/download/archive/4.4-stable/).
2. Clone the repo:
   ```sh
   git clone https://gitlab.com/srk7630145/spice-master-eddy.git
   ```
3. In Godot's Project Manager choose **Import**, select `project.godot`, then press **F5** to run.

## Controls (placeholder)
| Action | Keyboard / mouse | Controller |
|---|---|---|
| Move | WASD | Left stick |
| Sprint | Shift | L3 |
| Orbit camera | Mouse (click to capture, Esc to release) or Q / E | Right stick |

## Project layout
```
project.godot        Engine settings and input map
scenes/              Scenes (.tscn); main.tscn is the entry point
scripts/             GDScript, grouped by feature (player/, camera/, …)
assets/              Drop-in art and audio; see assets/README.md
tests/               Headless smoke test run by CI
docs/                decisions.md (canon) and ideas.md (backlog)
```

## Testing
From the repo root, with `godot` on your PATH:
```sh
godot --headless --path . --import
godot --headless --path . --fixed-fps 60 --script res://tests/smoke_test.gd
```
It should end with `SMOKE TEST PASSED`. GitLab CI runs the same two commands on every merge
request and on `main`. On 4.4 the import step prints some harmless `progress_dialog` errors.

## Contributing
See [`CONTRIBUTING.md`](CONTRIBUTING.md) for tone, branching and the idea-to-decision workflow.
AI agents should also read [`AGENTS.md`](AGENTS.md).
