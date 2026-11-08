# Contributing to Spice Master Eddy

The game depends on a consistent tone and on modules that hand off cleanly, so design docs
live next to the code in `docs/`.

## Keeping the tone consistent
Keep these pillars in mind for dialogue, mechanics and art:
1. **Grounded Kaasland:** industrial estates, rainy highways in the blue Oofmobiel,
   cramped takeaway kitchens, and the smell of toasted cumin and paprika.
2. **Gritty humour & tension:** shop-owner encounters should be tense, funny and
   unpredictable. Broken language, exaggerated complaints (*"Brother, this chicken spice
   makes my meat look sad, I no pay today!"*) and heated haggling are core to the charm.
3. **Earn every Wilder:** early on, money is tight. The player should feel the grind of
   selling off Dad's old junk and scraping together enough Wilders for a sack of coriander.

## From idea to decision
1. **Pitch it in [`docs/ideas.md`](docs/ideas.md)** under the right heading. Don't build it
   into the core loop yet.
2. **Lock it in [`docs/decisions.md`](docs/decisions.md)** once the team agrees: move it out
   of `ideas.md` and add a numbered entry. Update `README.md` if it changes the setting or
   the high-level modules.

## Submitting changes (GitLab)
1. **Branch** from `main` with a module prefix:
   - `feature/factory-…`: production, recipes, pricing, shed upgrades
   - `feature/delivery-…`: Oofmobiel driving, routes, cargo
   - `feature/encounters-…`: customer dialogue, orders, debt collection
   - `docs/…`: narrative updates, idea pitches, decisions
2. **Open a merge request** into `main` and reference the relevant decision ID
   (e.g. `DEC-003`) so reviewers know what it implements.
3. **Wait for CI**: the `godot-smoke` job must pass before merging.
4. **Assets:** follow [`assets/README.md`](assets/README.md). To replace a placeholder,
   keep its path and file name.

Use the same Godot version as `project.godot` (currently 4.4-stable). Opening the project
in a newer editor can silently upgrade files for everyone.
