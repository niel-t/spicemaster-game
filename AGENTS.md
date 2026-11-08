# Working on Spice Master Eddy

- GitLab `main` is authoritative: https://gitlab.com/srk7630145/spice-master-eddy.
  Not GitHub. Don't force-push or rewrite `main` or other people's branches.
- Engine is **Godot 4.4-stable**, GDScript only. Keep `config/features` in
  `project.godot`, `GODOT_VERSION` in `.gitlab-ci.yml` and the README in step when
  upgrading; upgrade in its own MR.
- Work on a branch (`feature/factory-…`, `feature/delivery-…`, `feature/encounters-…`,
  `docs/…`; Claude uses `claude/…`) and merge through an MR. Reference the relevant
  `docs/decisions.md` ID in the MR description.
- Before pushing gameplay, scene, script or project-setting changes, run from the repo root:
  ```sh
  godot --headless --path . --import
  godot --headless --path . --fixed-fps 60 --script res://tests/smoke_test.gd
  ```
  The import step prints harmless `progress_dialog` errors on 4.4. The smoke test must
  print `SMOKE TEST PASSED`. Documentation-only edits need no test run.
- Commit `.import` and `.uid` files next to their assets/scripts; never commit `.godot/`.
- Assets go in `assets/<category>/` per `assets/README.md`. Replacing a placeholder
  means keeping the same path and file name, so scenes pick it up automatically.
- Design source of truth: the Game Bible Google Doc
  (https://docs.google.com/document/d/1MFpUvK-7x49nk2YuP-ZFu8lr-0FsB7nzGicFOrbk8m0/edit).
  Build only what it marks Approved; Draft and Idea items need sign-off first.
- Don't build ideas from `docs/ideas.md` into the core loop until they're in
  `docs/decisions.md`. Setting name is **Kaasland**; protagonist **Eddy Jr.**, father
  **Eddy Sr.**
- Once saves exist, keep save keys and IDs stable or write a deliberate migration.
  Never overwrite an unreadable save.
- Keep scene files editor-friendly: prefer `@export` values tuned in the inspector over
  magic numbers in code. Avoid editing the same `.tscn` in parallel branches; split work
  into sub-scenes when two people need the same area.
