# Spice Master Eddy

> *From a warehouse full of Dad's old junk to Kaasland's spice kingpin, one blend at a time.*

A humorous spice-factory simulator set in **Kaasland**, in the vein of *Drug Dealer
Simulator* but seen over the shoulder. Mix spices, sell them, deliver them across town in the
**Oofmobiel**, and grow Eddy Sr.'s modest operation into a full-scale factory.

Built in **Godot 4.4**. The design source of truth is the
[Spice Master Eddy: Game Bible](https://docs.google.com/document/d/1MFpUvK-7x49nk2YuP-ZFu8lr-0FsB7nzGicFOrbk8m0/edit)
Google Doc (premise, characters, acts, gameplay, ideas). If anything in this repo disagrees
with it, the Game Bible wins.

**Status:** early scaffold. The main scene is a greybox with a placeholder Eddy Jr. and
the follow camera, so the team has something to build on.

---

## Story

For decades, **Eddy Sr.** was a quiet legend of Kaasland's meat and fast-food underground.
From an unassuming warehouse he perfected secret spice blends, shoarma and chicken recipes
coveted by local butchers and late-night shoarma shops.

Now Eddy Sr. is stepping back. He hands his son, **Eddy Jr.**, the keys to the warehouse.
It's packed with old machinery, an ancient Windows 95-style PC, and a list of Dad's very
demanding, very old-school customers.

It's up to Eddy Jr. to turn that into a business. Between penny-pinching shop owners,
customers who complain in chaotic broken language to angle for a discount, and blatant
refusals to pay, he'll have to learn when to sweet-talk, when to haggle and when to put his
foot down.

## How it plays

### Early game: getting started
- **Clear the warehouse:** sell Dad's old machinery on the PC to raise your first Wilders.
- **Set up shop:** buy your first spices and a **mixing table** online.
- **First sales:** mix familiar, traditional blends and sell them to Eddy Sr.'s existing
  customers.

### Mid-to-late game: the spice empire
- **Harder customers:** new clients want ever more complicated mixtures that need new
  ingredients and better equipment.
- **Hire the Naknikim:** bumbling helpers who take over mundane jobs, until eventually you
  can hand off whole tasks like mixing.
- **Scale up:** expand the warehouse into a factory and supply butchers, wholesalers and
  shoarma shops across Kaasland, outcompeting rival suppliers.

## Game modules

1. **The warehouse / factory:** mixing, recipe unlocks from Eddy Sr.'s notebook, production,
   expansion, and managing the Naknikim.
2. **The PC:** a Windows 95-style computer for going online to sell, buy supplies and deal
   with customers. Every purchase weighs **cost vs quantity vs quality**.
3. **The town and the Oofmobiel:** a 3D town (like Neon Vice's) to drive around in the blue
   Oofmobiel, delivering spice orders to customers.
4. **Customer encounters:** difficult clients, complaints, haggling and unpaid bills.
   Negotiate, cut off their supply, or get creative.

The money is **Wilders**.

---

## Getting started (development)
1. Install **Godot 4.4-stable** (standard build, not .NET) from
   [godotengine.org](https://godotengine.org/download/archive/4.4-stable/).
2. Clone the repo:
   ```sh
   git clone https://gitlab.com/srk7630145/spice-master-eddy.git
   ```
3. In Godot's Project Manager choose **Import**, select `project.godot`, then press **F5** to run.

### Controls (placeholder)
| Action | Keyboard / mouse | Controller |
|---|---|---|
| Move | WASD | Left stick |
| Sprint | Shift | L3 |
| Orbit camera | Mouse (click to capture, Esc to release) or Q / E | Right stick |

### Project layout
```
project.godot        Engine settings and input map
scenes/              Scenes (.tscn); main.tscn is the entry point
scripts/             GDScript, grouped by feature (player/, camera/, …)
assets/              Drop-in art and audio; see assets/README.md
tests/               Headless smoke test run by CI
docs/                decisions.md (canon) and ideas.md (backlog)
```

### Testing
From the repo root, with `godot` on your PATH:
```sh
godot --headless --path . --import
godot --headless --path . --fixed-fps 60 --script res://tests/smoke_test.gd
```
It should end with `SMOKE TEST PASSED`. GitLab CI runs the same two commands on every merge
request and on `main`. On 4.4 the import step prints some harmless `progress_dialog` errors.

## Documentation
- [`CONTRIBUTING.md`](CONTRIBUTING.md): tone, branching and the idea-to-decision workflow.
- [`docs/decisions.md`](docs/decisions.md): design and architecture decisions locked in as canon.
- [`docs/ideas.md`](docs/ideas.md): backlog of mechanics, encounters, van upgrades and recipes.
- [`AGENTS.md`](AGENTS.md): rules for AI agents working in the repo.
