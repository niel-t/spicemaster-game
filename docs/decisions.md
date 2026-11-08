# Design & Architecture Decisions Log

This file records decisions the team has settled for **Spice Master Eddy**. Active
development should follow these entries. Ideas that aren't settled yet live in
[`ideas.md`](ideas.md). To change a decision, add a new entry that supersedes the old
one rather than editing history.

Entry format: ID, status, context, decision, and (when relevant) what it supersedes.

---

## [DEC-001] Core narrative & protagonist setup
- **Status:** Approved
- **Context:** The business sim needs a character-driven hook.
- **Decision:**
  - The player controls **Eddy Jr.**, who takes over a modest shed and secret spice
    recipes from his father, **Eddy Sr.**
  - The setting is **Kaasland**: a fictional stand-in for the Netherlands, built around
    the subculture of shoarma shops, local butchers and wholesale food trading.
  - Eddy Jr.'s signature vehicle is a **blue Volkswagen T5**.
- **Note:** Ported from the Drive copy of this log (`02_Transcripts/Design and Architecture
  Decisions`), which holds only this entry and ends at the T5 line. The original said
  "Netherlands"; it was renamed to Kaasland on 2026-11-08.

## [DEC-002] Engine, source control and CI
- **Status:** Approved (2026-11-08)
- **Context:** The meeting compared a browser HTML build with Godot, and the Drive docs
  assumed GitHub. Neon Vice's GitLab workflow is the process reference.
- **Decision:**
  - Engine: **Godot 4.4** (stable), GDScript. Everyone uses the same 4.4.x editor.
  - Source control: **GitLab**, `gitlab.com/srk7630145/spice-master-eddy`. Not GitHub.
  - Work lands through merge requests; a headless Godot smoke test runs on every MR and
    on `main`.
- **Supersedes:** GitHub references in the Drive docs and the meeting notes.

## [DEC-003] Camera & visual target
- **Status:** Approved (2026-11-08)
- **Context:** The meeting left first-person vs top-down/isometric open.
- **Decision:**
  - **High third-person camera**: behind and well above Eddy Jr., looking down so he sits
    mid-frame with the world laid out ahead (the "PS3 framing" reference screenshot).
    It is not strict top-down and not first-person.
  - Characters get **more detail than Neon Vice's low-poly style**, so faces and
    expressions can carry the humour. Still aim for a strong fun-to-effort ratio, not
    current-gen fidelity.
- **Open:** a polygon/texture budget for characters needs agreeing before final art starts.
