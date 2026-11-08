class_name Tex
## Procedural low-res textures and materials for the GTA3-era look: tiny
## textures, nearest-neighbour filtering, world-space triplanar mapping so boxes
## need no UVs. Replace any of these with hand-made art later by swapping the
## material on the node.

static var _textures := {}
static var _materials := {}


## Textured material. `repeat_per_m`: texture repeats per metre.
static func mat(kind: String, tint := Color.WHITE, repeat_per_m := 0.25, double_sided := false) -> StandardMaterial3D:
	var key := "%s|%s|%s|%s" % [kind, tint.to_html(), repeat_per_m, double_sided]
	if _materials.has(key):
		return _materials[key]
	var m := StandardMaterial3D.new()
	m.albedo_texture = texture(kind)
	m.albedo_color = tint
	m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	m.uv1_triplanar = true
	m.uv1_world_triplanar = true
	m.uv1_scale = Vector3.ONE * repeat_per_m
	m.roughness = 0.92
	if double_sided:
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
	_materials[key] = m
	return m


## Untextured material.
static func flat(color: Color, roughness := 0.85, metallic := 0.0, emission := 0.0) -> StandardMaterial3D:
	var key := "flat|%s|%s|%s|%s" % [color.to_html(), roughness, metallic, emission]
	if _materials.has(key):
		return _materials[key]
	var m := StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = roughness
	m.metallic = metallic
	if emission > 0.0:
		m.emission_enabled = true
		m.emission = color
		m.emission_energy_multiplier = emission
	_materials[key] = m
	return m


static func texture(kind: String) -> Texture2D:
	if _textures.has(kind):
		return _textures[kind]
	var img: Image
	match kind:
		"asphalt": img = _noise(Color(0.23, 0.23, 0.24), 0.06, 11)
		"concrete": img = _tiles(Color(0.55, 0.54, 0.5), Color(0.42, 0.41, 0.38), 32, 0.05, 12)
		"sidewalk": img = _tiles(Color(0.62, 0.6, 0.56), Color(0.45, 0.44, 0.41), 16, 0.05, 13)
		"dirt": img = _noise(Color(0.5, 0.42, 0.32), 0.07, 14)
		"brick": img = _bricks(Color(0.55, 0.27, 0.2), Color(0.7, 0.66, 0.58), 15)
		"plaster": img = _noise(Color(0.8, 0.77, 0.7), 0.05, 16)
		"corrugated": img = _corrugated(Color(0.86, 0.87, 0.88), 0.0, 17)
		"rust_roof": img = _corrugated(Color(0.5, 0.32, 0.22), 0.5, 18)
		"shutter": img = _shutter(19)
		"facade": img = _facade(20)
		_: img = _noise(Color(1, 0, 1), 0.0, 0)
	img.generate_mipmaps()
	var tex := ImageTexture.create_from_image(img)
	_textures[kind] = tex
	return tex


static func _img() -> Image:
	return Image.create(64, 64, false, Image.FORMAT_RGB8)


static func _jitter(rng: RandomNumberGenerator, c: Color, amount: float) -> Color:
	var d := rng.randf_range(-amount, amount)
	return Color(clampf(c.r + d, 0, 1), clampf(c.g + d, 0, 1), clampf(c.b + d, 0, 1))


static func _noise(base: Color, amount: float, seed: int) -> Image:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := _img()
	for y in 64:
		for x in 64:
			img.set_pixel(x, y, _jitter(rng, base, amount))
	return img


static func _tiles(base: Color, grout: Color, tile: int, amount: float, seed: int) -> Image:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := _img()
	for y in 64:
		for x in 64:
			var c := grout if (x % tile == 0 or y % tile == 0) else base
			img.set_pixel(x, y, _jitter(rng, c, amount))
	return img


static func _bricks(brick: Color, mortar: Color, seed: int) -> Image:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := _img()
	for y in 64:
		var row := y / 8
		for x in 64:
			var bx := (x + (8 if row % 2 == 1 else 0)) % 16
			var c := mortar if (y % 8 == 0 or bx == 0) else brick
			img.set_pixel(x, y, _jitter(rng, c, 0.06))
	return img


static func _corrugated(base: Color, rust: float, seed: int) -> Image:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := _img()
	for y in 64:
		for x in 64:
			var shade := 0.82 + 0.18 * sin(float(x) / 64.0 * TAU * 8.0)
			var c := Color(base.r * shade, base.g * shade, base.b * shade)
			if rust > 0.0 and rng.randf() < rust * 0.25:
				c = c.lerp(Color(0.55, 0.25, 0.1), 0.5)
			img.set_pixel(x, y, _jitter(rng, c, 0.03))
	return img


static func _shutter(seed: int) -> Image:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := _img()
	for y in 64:
		for x in 64:
			var c := Color(0.6, 0.62, 0.6) if y % 4 != 0 else Color(0.35, 0.36, 0.35)
			img.set_pixel(x, y, _jitter(rng, c, 0.04))
	return img


## One 4 m x 4 m facade cell: plaster wall with a window and a frame.
static func _facade(seed: int) -> Image:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := _img()
	for y in 64:
		for x in 64:
			var c := Color(0.82, 0.8, 0.74)
			var in_window := x >= 18 and x < 46 and y >= 14 and y < 44
			var in_frame := x >= 16 and x < 48 and y >= 12 and y < 46
			if in_window:
				c = Color(0.18, 0.24, 0.32) if (x - 18) % 14 != 0 else Color(0.9, 0.9, 0.88)
				if y < 22 and x > 22 and x < 30:
					c = Color(0.45, 0.55, 0.65)  # sky reflection
			elif in_frame:
				c = Color(0.95, 0.95, 0.92)
			elif y >= 46 and y < 48 and x >= 14 and x < 50:
				c = Color(0.55, 0.53, 0.5)  # sill
			img.set_pixel(x, y, _jitter(rng, c, 0.03))
	return img
