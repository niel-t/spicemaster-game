# Assets

Drop-in folders for art and audio. Anyone can replace a placeholder by saving a new file
with the **same path and name**: Godot re-imports it and every scene using it updates.

| Folder | What goes here | Preferred format |
|---|---|---|
| `characters/` | Eddy Jr., Eddy Sr., customers, Naknikim | `.glb` (glTF binary) with embedded rig and animations |
| `environment/` | Shed/warehouse, streets, buildings | `.glb` |
| `props/` | Spice tubs, mixing table, the Windows 95-style PC, the Oofmobiel | `.glb` |
| `audio/music/` | Music tracks | `.ogg` |
| `audio/sfx/` | Sound effects | `.ogg` or `.wav` (short sounds) |
| `ui/` | Icons, fonts, HUD art | `.png`, `.ttf`/`.otf` |

Conventions:
- `snake_case` file names, e.g. `eddy_jr.glb`, `spice_tub_large.glb`, `sfx_grinder_loop.ogg`.
- One subfolder per larger character or set if it brings its own textures:
  `characters/eddy_jr/eddy_jr.glb` plus its textures.
- Scale: 1 unit = 1 metre, Y up, characters face -Z. Eddy Jr. is about 1.8 m tall.
- Commit the `.import` file Godot creates next to each asset.
- Keep source files (`.blend`, `.psd`, project files) in the Drive, not in the repo,
  unless the team decides otherwise.
