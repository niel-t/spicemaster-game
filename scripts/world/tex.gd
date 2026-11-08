class_name Tex
## Materials for the GTA3-era look: small photo textures (assets/textures,
## CC0 ambientCG sources plus crops of the real warehouse photo), linear
## filtering, per-vertex lighting, and world-space triplanar mapping so blockout
## boxes need no UVs. A few details (shutter, awning stripes, steel) are painted
## in code.

const TEXTURES := {
	"asphalt": "res://assets/textures/asphalt.jpg",
	"concrete": "res://assets/textures/concrete_light.jpg",
	"concrete_rough": "res://assets/textures/concrete_rough.jpg",
	"paving": "res://assets/textures/paving.jpg",
	"dirt": "res://assets/textures/warehouse_floor.jpg",
	"brick": "res://assets/textures/brick_red.jpg",
	"brick_cream": "res://assets/textures/brick_cream.jpg",
	"plaster": "res://assets/textures/plaster.jpg",
	"corrugated": "res://assets/textures/corrugated_white.jpg",
	"rust_roof": "res://assets/textures/roof_rust.jpg",
}

static var _textures := {}
static var _materials := {}


static func _base(m: StandardMaterial3D) -> void:
	m.shading_mode = BaseMaterial3D.SHADING_MODE_PER_VERTEX
	m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	m.roughness = 0.92


## Textured material, world-space triplanar. `repeat_per_m`: repeats per metre.
static func mat(kind: String, tint := Color.WHITE, repeat_per_m := 0.25, double_sided := false) -> StandardMaterial3D:
	var key := "%s|%s|%s|%s" % [kind, tint.to_html(), repeat_per_m, double_sided]
	if _materials.has(key):
		return _materials[key]
	var m := StandardMaterial3D.new()
	_base(m)
	m.albedo_texture = texture(kind)
	m.albedo_color = tint
	m.uv1_triplanar = true
	m.uv1_world_triplanar = true
	m.uv1_scale = Vector3.ONE * repeat_per_m
	if double_sided:
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
	_materials[key] = m
	return m


## Textured material using the mesh's own UVs (for generated meshes with UVs).
static func uv_mat(kind: String, tint := Color.WHITE, double_sided := false) -> StandardMaterial3D:
	var key := "uv|%s|%s|%s" % [kind, tint.to_html(), double_sided]
	if _materials.has(key):
		return _materials[key]
	var m := StandardMaterial3D.new()
	_base(m)
	m.albedo_texture = texture(kind)
	m.albedo_color = tint
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
	m.shading_mode = BaseMaterial3D.SHADING_MODE_PER_VERTEX
	m.albedo_color = color
	m.roughness = roughness
	m.metallic = metallic
	if emission > 0.0:
		m.emission_enabled = true
		m.emission = color
		m.emission_energy_multiplier = emission
	_materials[key] = m
	return m


## Window glass: dark, glossy, reflects the sky.
static func glass(tint := Color(0.16, 0.2, 0.25)) -> StandardMaterial3D:
	var key := "glass|%s" % tint.to_html()
	if _materials.has(key):
		return _materials[key]
	var m := StandardMaterial3D.new()
	m.albedo_color = tint
	m.metallic = 0.7
	m.roughness = 0.12
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	_materials[key] = m
	return m


static func texture(kind: String) -> Texture2D:
	if _textures.has(kind):
		return _textures[kind]
	var tex: Texture2D
	if TEXTURES.has(kind):
		tex = load(TEXTURES[kind])
	else:
		var img: Image
		match kind:
			"shutter": img = _shutter(19)
			"steel": img = _steel(21)
			"awning_red": img = _stripes(Color(0.72, 0.1, 0.1), Color(0.92, 0.9, 0.85))
			"awning_green": img = _stripes(Color(0.1, 0.42, 0.22), Color(0.92, 0.9, 0.85))
			"awning_blue": img = _stripes(Color(0.12, 0.25, 0.55), Color(0.92, 0.9, 0.85))
			_: img = Image.create(8, 8, false, Image.FORMAT_RGB8)
		img.generate_mipmaps()
		tex = ImageTexture.create_from_image(img)
	_textures[kind] = tex
	return tex


static func _jitter(rng: RandomNumberGenerator, c: Color, amount: float) -> Color:
	var d := rng.randf_range(-amount, amount)
	return Color(clampf(c.r + d, 0, 1), clampf(c.g + d, 0, 1), clampf(c.b + d, 0, 1))


static func _shutter(seed: int) -> Image:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := Image.create(128, 128, false, Image.FORMAT_RGB8)
	for y in 128:
		var band := float(y % 8) / 8.0
		for x in 128:
			var c := Color(0.62, 0.63, 0.6).darkened(0.25 * absf(band - 0.5) * 2.0)
			if rng.randf() < 0.02:
				c = c.lerp(Color(0.5, 0.3, 0.15), 0.6)  # rust specks
			img.set_pixel(x, y, _jitter(rng, c, 0.03))
	return img


static func _steel(seed: int) -> Image:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var img := Image.create(128, 128, false, Image.FORMAT_RGB8)
	var row := []
	for x in 128:
		row.append(rng.randf_range(-0.05, 0.05))
	for y in 128:
		for x in 128:
			var c := Color(0.66, 0.67, 0.68)
			var v: float = row[x] + rng.randf_range(-0.02, 0.02)
			c = Color(c.r + v, c.g + v, c.b + v)
			if rng.randf() < 0.015:
				c = c.lerp(Color(0.35, 0.28, 0.2), 0.5)  # grease
			img.set_pixel(x, y, c)
	return img


static func _stripes(a: Color, b: Color) -> Image:
	var img := Image.create(64, 64, false, Image.FORMAT_RGB8)
	for y in 64:
		for x in 64:
			img.set_pixel(x, y, a if (x / 8) % 2 == 0 else b)
	return img
