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
  - The setting is **Kaasland**, built around the subculture of shoarma shops, local
    butchers and wholesale food trading. Always Kaasland; never a real country.
  - The currency is the **Wilder**.
  - Eddy Jr.'s signature vehicle is a blue van called the **Oofmobiel**.
- **Note:** Ported from the Drive copy of this log (`02_Transcripts/Design and Architecture
  Decisions`). Setting, currency and van names were updated on 2026-11-08.

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

## [DEC-004] Plot & core loop
- **Status:** Approved (2026-11-08, Raz)
- **Context:** The first meeting floated the loop without settling it. This is the pitch
  the game is built around.
- **Genre:** a hands-on business simulator in the vein of *Drug Dealer Simulator*, played
  from the high third-person camera in DEC-003 rather than first-person.
- **Opening:**
  1. Eddy Sr. hands Eddy Jr. the keys and tells him to take over his warehouse.
  2. The warehouse is full of old machinery. Eddy Jr. sells it on **the old computer** to
     raise his first money.
  3. That money buys his first supplies (spices) and a **mixing table**.
  4. He mixes his first products and sells them, through the computer, to the existing
     customers Eddy Sr. already has.
- **Core loop:** buy supplies on the computer → mix at the table → sell to customers on
  the computer → reinvest. Business builds up slowly.
- **Progression:**
  - Over time, more demanding customers appear who want **more complicated spice mixtures**,
    which need new supplies bought on the computer.
  - The long-running goal is ever more complex blends.
  - Eddy Jr. can **hire Naknikim**: bumbling helpers who take over mundane tasks. Over
    time, whole jobs such as mixing can be handed to them.
- **The computer:** an old **Windows 95-style PC** in the warehouse is the player's window
  to the outside world. It's where they go online to sell the old machinery, buy supplies
  and deal with customers. Buying always weighs **cost vs quantity vs quality**.
- **Delivery:** the game is about selling spices. Outside the warehouse there's a **3D town**
  (like Neon Vice's overworld) that Eddy Jr. drives around in the **Oofmobiel** to deliver
  spice orders to customers.
- **Still open:** the hands-on mixing interaction, how recipes and quality are scored,
  Naknikim look/behaviour (Drive `01_References/01_Characters/05_Naknikim` is still empty),
  and how orders split between the PC and in-person delivery.
