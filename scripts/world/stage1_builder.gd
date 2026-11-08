extends Node3D
## Stage 1: a short Kaasland street with Eddy Sr.'s old warehouse.
## Builds the scene from code so it can be iterated quickly. Textures are small
## photo textures in assets/textures (GTA3-style); geometry is low-poly.
## Replace pieces with authored scenes/assets as they arrive.
##
## Flow: intro talk with Eddy Sr. outside -> shutter opens -> haul out the old
## shoarma equipment -> the old PC unlocks -> sell the junk for Wilders.

const KERB := 0.12          # pavement height above the road
const WH_HALF_W := 7.2      # warehouse half width (m)
const WH_WALL_H := 2.2      # straight wall height before the arch starts
const WH_ARCH_H := 4.0      # arch rise above the walls
const WH_FRONT_Z := 12.0
const WH_BACK_Z := 36.0
const DOOR_HALF_W := 2.0
const DOOR_H := 3.4
const INTERIOR_LAYER := 2   # render layer bit value for sun-free interior lighting

const SKY_SHADER := """
shader_type sky;
uniform vec3 top_color = vec3(0.32, 0.45, 0.62);
uniform vec3 horizon_color = vec3(0.78, 0.74, 0.66);
uniform vec3 ground_color = vec3(0.36, 0.34, 0.31);
uniform vec3 cloud_color = vec3(0.93, 0.9, 0.86);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
	vec2 i = floor(p); vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
	float v = 0.0; float a = 0.5;
	for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
	return v;
}
void sky() {
	vec3 d = EYEDIR;
	float h = max(d.y, 0.0);
	vec3 col = mix(horizon_color, top_color, pow(h, 0.55));
	if (d.y > 0.0) {
		vec2 uv = d.xz / (d.y + 0.15) * 1.4 + vec2(TIME * 0.004, 0.0);
		float c = smoothstep(0.48, 0.78, fbm(uv));
		col = mix(col, cloud_color * (0.85 + 0.15 * fbm(uv * 3.0)), c * 0.85 * smoothstep(0.0, 0.25, d.y));
	} else {
		col = mix(horizon_color, ground_color, min(-d.y * 4.0, 1.0));
	}
	float s = max(dot(d, LIGHT0_DIRECTION), 0.0);
	col += vec3(1.0, 0.85, 0.6) * (pow(s, 600.0) * 4.0 + pow(s, 12.0) * 0.25);
	COLOR = col;
}
"""

## Exposed for tests and other scripts.
var junk_items: Array[Interactable] = []
var pc_interactable: Interactable
var dad_interactable: Interactable
var shutter: StaticBody3D
var roof_nodes: Array[Node3D] = []
var hud: Node
var player_inside := false

var _dad: Node3D
var _shutter_open := false


func _ready() -> void:
	Game.reset()
	_build_environment()
	_build_ground_and_street()
	_build_buildings()
	_build_cars()
	_build_warehouse()
	_build_interior()
	_build_junk()
	_build_pc()
	_build_dad()
	for n in [get_node("Interior"), get_node("Junk"), get_node("DeskWithPC")]:
		set_render_layer(n, INTERIOR_LAYER)
	hud = preload("res://scripts/ui/hud.gd").new()
	hud.name = "HUD"
	add_child(hud)
	Game.stage_changed.connect(_on_stage_changed)
	get_tree().create_timer(0.8).timeout.connect(_intro_dialogue)


# --- Look -------------------------------------------------------------------

func _build_environment() -> void:
	var sky_mat := ShaderMaterial.new()
	var shader := Shader.new()
	shader.code = SKY_SHADER
	sky_mat.shader = shader
	var sky := Sky.new()
	sky.sky_material = sky_mat
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.5
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.tonemap_exposure = 0.85
	# GTA3-style haze that swallows the far end of the street.
	env.fog_enabled = true
	env.fog_light_color = Color(0.7, 0.67, 0.6)
	env.fog_density = 0.011
	env.fog_sky_affect = 0.25
	env.adjustment_enabled = true
	env.adjustment_saturation = 0.88
	env.adjustment_contrast = 1.1
	env.adjustment_brightness = 0.97
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.light_color = Color(1.0, 0.9, 0.76)
	sun.light_energy = 1.0
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 80.0
	sun.rotation = Vector3(deg_to_rad(-38), deg_to_rad(28), 0)
	# The sun only lights layer 1; the warehouse interior lives on layer 2 so
	# it's lit by its tubes alone, whether or not the roof is drawn.
	sun.light_cull_mask = 1
	add_child(sun)


# --- Street -----------------------------------------------------------------

func _build_ground_and_street() -> void:
	var root := Node3D.new()
	root.name = "Street"
	add_child(root)
	# Road surface (and the ground under everything).
	Build.collider(root, Vector3(200, 1, 200), Vector3(0, -0.5, 0), "Ground")
	Build.box(root, Vector3(200, 0.02, 200), Vector3(0, -0.01, 0), Tex.mat("asphalt", Color(0.92, 0.92, 0.92), 0.15), "Road")
	# Raised pavement blocks both sides, with walkable kerb wedges.
	for side in [-1, 1]:
		var z0: float = 5.25 * side
		var z1: float = 60.0 * side
		var cz: float = (z0 + z1) * 0.5
		var depth: float = absf(z1 - z0)
		Build.collider(root, Vector3(200, KERB, depth), Vector3(0, KERB * 0.5, cz), "Pavement")
		Build.ramp_collider(root, -100, 100, 5.0 * side, 5.25 * side, KERB)
		Build.box(root, Vector3(200, KERB, 3.0), Vector3(0, KERB * 0.5, 6.75 * side), Tex.mat("paving", Color(0.78, 0.77, 0.74), 0.33), "Pavement")
		Build.box(root, Vector3(200, KERB + 0.01, 0.25), Vector3(0, (KERB + 0.01) * 0.5, 5.12 * side), Tex.mat("concrete", Color(0.75, 0.74, 0.7), 0.5), "KerbStone")
		Build.box(root, Vector3(200, 0.01, 0.35), Vector3(0, 0.003, 4.8 * side), Tex.flat(Color(0.18, 0.18, 0.18)), "Gutter")
		for x in range(-36, 40, 12):
			var lamp := Props.street_lamp()
			lamp.position = Vector3(x + 6, KERB, 5.6 * side)
			lamp.rotation.y = 0.0 if side > 0 else PI
			root.add_child(lamp)
	# Lot in front of the warehouse and the back yards: concrete at pavement height.
	Build.box(root, Vector3(19.4, 0.02, 4.0), Vector3(0, KERB + 0.01, 10.0), Tex.mat("concrete_rough", Color(0.85, 0.84, 0.8), 0.25), "Lot")
	Build.box(root, Vector3(200, 0.02, 52), Vector3(0, KERB - 0.005, 34.0), Tex.mat("concrete_rough", Color(0.7, 0.7, 0.67), 0.2), "Yards")
	Build.box(root, Vector3(200, 0.02, 52), Vector3(0, KERB - 0.005, -34.0), Tex.mat("concrete_rough", Color(0.7, 0.7, 0.67), 0.2), "YardsN")
	# Road markings: dashed centre line, edge lines, zebra crossing at the warehouse.
	var paint := Tex.flat(Color(0.88, 0.87, 0.8), 0.7)
	var marks := Build.Batch.new()
	for x in range(-60, 62, 5):
		if absf(x) > 4:
			marks.add_box(paint, Vector3(2.5, 0.012, 0.12), Vector3(x, 0.006, 0))
	for side in [-1, 1]:
		marks.add_box(paint, Vector3(200, 0.012, 0.1), Vector3(0, 0.006, 4.4 * side))
	for i in 8:
		marks.add_box(paint, Vector3(0.5, 0.013, 8.0), Vector3(-3.15 + i * 0.9, 0.007, 0))
	marks.commit(root, "RoadMarkings")
	# Manholes and a drain or two.
	var iron := Tex.flat(Color(0.16, 0.16, 0.17), 0.6, 0.5)
	for p in [Vector3(-12, 0.004, 1.6), Vector3(14, 0.004, -2.0), Vector3(27, 0.004, 1.2)]:
		Build.cylinder(root, 0.35, 0.01, p, iron, -1.0, 12)
	# Street furniture.
	for x in [-14.0, 15.0, -26.0]:
		var bin := Props.bin()
		bin.position = Vector3(x, KERB, 7.6)
		root.add_child(bin)
	for x in [-9.0, -8.0, 8.0, 9.0]:
		var b := Props.bollard()
		b.position = Vector3(x, KERB, 5.5)
		root.add_child(b)
	var rack := Props.bike_rack()
	rack.position = Vector3(18, KERB, -7.4)
	root.add_child(rack)
	# Invisible bounds at both ends of the street.
	Build.collider(root, Vector3(1, 6, 40), Vector3(-45, 3, 0), "BoundW")
	Build.collider(root, Vector3(1, 6, 40), Vector3(45, 3, 0), "BoundE")


func _build_cars() -> void:
	var root := Node3D.new()
	root.name = "Cars"
	add_child(root)
	var van := Props.oofmobiel()
	van.position = Vector3(-6.5, 0, 3.4)
	van.rotation.y = -PI / 2
	root.add_child(van)
	Build.collider(root, Vector3(5.2, 2.0, 1.95), Vector3(-6.5, 1.0, 3.4), "VanCollider")
	var parked := [
		[-20.0, 3.5, -1, "sedan", Color(0.42, 0.1, 0.1)],
		[13.0, 3.5, -1, "hatchback", Color(0.75, 0.72, 0.62)],
		[22.0, 3.5, -1, "sedan", Color(0.15, 0.3, 0.2)],
		[-30.0, -3.5, 1, "hatchback", Color(0.22, 0.25, 0.4)],
		[-11.0, -3.5, 1, "sedan", Color(0.55, 0.55, 0.57)],
		[4.0, -3.5, 1, "sedan", Color(0.85, 0.85, 0.82)],
		[30.0, -3.5, 1, "hatchback", Color(0.6, 0.35, 0.12)],
	]
	for c in parked:
		var car: Node3D = Props.sedan(c[4]) if c[3] == "sedan" else Props.hatchback(c[4])
		car.position = Vector3(c[0], 0, c[1])
		car.rotation.y = PI / 2 * c[2]
		root.add_child(car)
		Build.collider(root, Vector3(4.4, 1.4, 1.75), Vector3(c[0], 0.7, c[1]), "CarCollider")


# --- Buildings --------------------------------------------------------------

## A street building with a shopfront, real window frames and roof clutter.
## face = +1 when the front looks towards +Z (north row), -1 for the south row.
func _building(root: Node3D, cx: float, front_z: float, face: int, w: float, h: float, depth: float,
		wall: String, tint: Color, sign := "", sign_color := Color.WHITE, awning := "") -> void:
	var node := Node3D.new()
	node.name = "Building"
	root.add_child(node)
	var repeat := 0.5 if wall.begins_with("brick") else 0.3
	var cz := front_z - face * depth * 0.5
	Build.solid(node, Vector3(w, h, depth), Vector3(cx, h * 0.5, cz), Tex.mat(wall, tint, repeat), "Body")
	var b := Build.Batch.new()
	var fz := front_z + face * 0.02
	var frame := Tex.flat(Color(0.9, 0.89, 0.85), 0.6)
	var dark := Tex.flat(Color(0.12, 0.12, 0.13), 0.6, 0.3)
	var stone := Tex.mat("concrete", Color(0.8, 0.78, 0.72), 0.5)
	var glass := Tex.glass()
	var shop_glass := Tex.glass(Color(0.2, 0.22, 0.24))
	var gh := 3.8
	# Ground floor: shop window, door, kick plate, frame, sign band.
	if sign != "":
		var sw := w - 1.2
		b.add_box(shop_glass, Vector3(sw, 2.5, 0.04), Vector3(cx, KERB + 0.45 + 1.25, fz + face * 0.02))
		b.add_box(dark, Vector3(sw + 0.2, 0.42, 0.12), Vector3(cx, KERB + 0.21, fz + face * 0.05))
		b.add_box(dark, Vector3(sw + 0.2, 0.14, 0.12), Vector3(cx, KERB + 3.0, fz + face * 0.05))
		var mullions := maxi(2, int(sw / 1.8))
		for i in mullions + 1:
			var mx := cx - sw * 0.5 + sw * float(i) / mullions
			b.add_box(dark, Vector3(0.1, 2.6, 0.1), Vector3(mx, KERB + 1.7, fz + face * 0.05))
		# Door in the first bay.
		var door_x := cx - sw * 0.5 + sw / mullions * 0.5
		b.add_box(Tex.flat(Color(0.22, 0.12, 0.08), 0.7), Vector3(1.0, 2.3, 0.06), Vector3(door_x, KERB + 1.15, fz + face * 0.06))
		b.add_box(Tex.flat(Color(0.75, 0.7, 0.4), 0.3, 0.8), Vector3(0.05, 0.3, 0.05), Vector3(door_x + 0.38, KERB + 1.1, fz + face * 0.12))
		# Sign band sticking out over the window.
		b.add_box(Tex.flat(sign_color.darkened(0.7), 0.5), Vector3(w - 0.6, 0.75, 0.22), Vector3(cx, KERB + 3.45, fz + face * 0.11))
		var label := Label3D.new()
		label.text = sign
		label.font_size = 80
		label.pixel_size = 0.0055
		label.modulate = sign_color
		label.outline_size = 10
		label.position = Vector3(cx, KERB + 3.45, fz + face * 0.23)
		label.rotation.y = 0.0 if face > 0 else PI
		node.add_child(label)
		if awning != "":
			var basis := Basis(Vector3.RIGHT, face * 0.38)
			b.add_box(Tex.mat(awning, Color.WHITE, 0.6), Vector3(w - 0.8, 0.05, 1.3), Vector3(cx, KERB + 2.85, fz + face * 0.62), basis)
	else:
		# Residential entrance: door with a stone surround and two ground-floor windows.
		b.add_box(stone, Vector3(1.6, 2.8, 0.14), Vector3(cx, KERB + 1.4, fz + face * 0.05))
		b.add_box(Tex.flat(Color(0.12, 0.2, 0.16), 0.6), Vector3(1.1, 2.4, 0.06), Vector3(cx, KERB + 1.2, fz + face * 0.13))
		for dx in [-w * 0.3, w * 0.3]:
			_window(b, cx + dx, KERB + 1.0, fz, face, frame, glass, stone)
	# Upper floors: rows of framed windows with sills.
	var floors := int((h - gh) / 3.0)
	var per_row := maxi(1, int(w / 2.6))
	for k in floors:
		var wy := gh + 0.6 + k * 3.0
		for i in per_row:
			var wx := cx - w * 0.5 + (i + 0.5) * w / per_row
			_window(b, wx, wy, fz, face, frame, glass, stone)
	# Cornice and parapet.
	b.add_box(stone, Vector3(w + 0.1, 0.35, 0.35), Vector3(cx, h - 0.25, fz + face * 0.12))
	b.add_box(stone, Vector3(w, 0.5, 0.25), Vector3(cx, h + 0.25, front_z - face * 0.12))
	# Roof clutter: AC units, a chimney, maybe a water tank.
	var rng := RandomNumberGenerator.new()
	rng.seed = int(cx * 13.0 + front_z)
	var metal := Tex.mat("steel", Color(0.85, 0.85, 0.85), 1.0)
	for i in rng.randi_range(1, 3):
		var px := cx + rng.randf_range(-w * 0.35, w * 0.35)
		var pz := cz + rng.randf_range(-depth * 0.3, depth * 0.3)
		b.add_box(metal, Vector3(0.9, 0.7, 0.7), Vector3(px, h + 0.35, pz))
	b.add_box(Tex.mat("brick", Color(0.8, 0.8, 0.8), 0.5), Vector3(0.6, 1.4, 0.6), Vector3(cx + w * 0.3, h + 0.7, cz + depth * 0.25))
	b.commit(node, "Details")


func _window(b: Build.Batch, x: float, y: float, fz: float, face: int, frame: Material, glass: Material, sill: Material) -> void:
	var ww := 1.25
	var wh := 1.6
	b.add_box(glass, Vector3(ww, wh, 0.03), Vector3(x, y + wh * 0.5, fz + face * 0.01))
	b.add_box(frame, Vector3(ww + 0.16, 0.08, 0.08), Vector3(x, y + wh + 0.04, fz + face * 0.04))
	b.add_box(frame, Vector3(0.08, wh, 0.08), Vector3(x - ww * 0.5 - 0.04, y + wh * 0.5, fz + face * 0.04))
	b.add_box(frame, Vector3(0.08, wh, 0.08), Vector3(x + ww * 0.5 + 0.04, y + wh * 0.5, fz + face * 0.04))
	b.add_box(frame, Vector3(0.05, wh, 0.05), Vector3(x, y + wh * 0.5, fz + face * 0.035))
	b.add_box(frame, Vector3(ww, 0.05, 0.05), Vector3(x, y + wh * 0.62, fz + face * 0.035))
	b.add_box(sill, Vector3(ww + 0.3, 0.09, 0.2), Vector3(x, y - 0.05, fz + face * 0.1))


func _build_buildings() -> void:
	var root := Node3D.new()
	root.name = "Buildings"
	add_child(root)
	# North side of the road: a continuous row, fronts at z = -8 facing +Z.
	var north := [
		[-38.0, 10.0, 10.0, "brick", Color(0.95, 0.9, 0.88), "", Color.WHITE, ""],
		[-28.0, 10.0, 13.0, "plaster", Color(0.95, 0.9, 0.78), "WASSALON", Color(0.4, 0.8, 1.0), "awning_blue"],
		[-18.5, 9.0, 10.0, "brick", Color(0.85, 0.75, 0.7), "SHOARMA PALEIS", Color(1.0, 0.75, 0.2), "awning_red"],
		[-9.0, 10.0, 16.0, "plaster", Color(0.85, 0.88, 0.92), "", Color.WHITE, ""],
		[1.0, 10.0, 10.0, "brick_cream", Color(0.95, 0.95, 0.9), "TOKO KAASLAND", Color(0.4, 1.0, 0.5), "awning_green"],
		[11.0, 10.0, 13.0, "plaster", Color(1.0, 0.86, 0.78), "", Color.WHITE, ""],
		[21.0, 10.0, 10.0, "brick", Color(1, 1, 1), "SLAGERIJ BERT", Color(1.0, 0.35, 0.3), "awning_red"],
		[31.0, 10.0, 16.0, "plaster", Color(0.92, 0.9, 0.8), "", Color.WHITE, ""],
		[40.5, 9.0, 10.0, "brick", Color(0.8, 0.7, 0.65), "", Color.WHITE, ""],
	]
	for d in north:
		_building(root, d[0], -8.0, 1, d[1], d[2], 12.0, d[3], d[4], d[5], d[6], d[7])
	# South side, either side of the warehouse lot (fronts at z = 8 facing -Z).
	var south := [
		[-30.0, 12.0, 10.0, "plaster", Color(0.95, 0.9, 0.82), "BAKKERIJ", Color(1.0, 0.85, 0.5), "awning_green"],
		[-17.0, 13.0, 13.0, "brick", Color(0.9, 0.8, 0.75), "", Color.WHITE, ""],
		[17.5, 13.0, 7.0, "brick_cream", Color(0.8, 0.82, 0.85), "AUTO SCHADE", Color(1.0, 1.0, 0.4), ""],
		[31.0, 13.0, 13.0, "plaster", Color(1, 0.95, 0.9), "", Color.WHITE, ""],
	]
	for d in south:
		_building(root, d[0], 8.0, -1, d[1], d[2], 16.0, d[3], d[4], d[5], d[6], d[7])
	# Buildings closing off both ends of the street.
	Build.solid(root, Vector3(6, 11, 30), Vector3(-48, 5.5, 0), Tex.mat("brick", Color(0.85, 0.8, 0.75), 0.5), "EndW")
	Build.solid(root, Vector3(6, 12, 30), Vector3(48, 6.0, 0), Tex.mat("plaster", Color(0.95, 0.92, 0.85), 0.3), "EndE")
	# Fences around the warehouse lot.
	var fence := Tex.flat(Color(0.32, 0.33, 0.32), 0.5, 0.6)
	var fb := Build.Batch.new()
	for x in [-9.8, 9.8]:
		Build.collider(root, Vector3(0.1, 2.0, 30.0), Vector3(x, 1.0, 23.0), "LotFence")
		fb.add_box(fence, Vector3(0.06, 0.06, 30.0), Vector3(x, KERB + 1.9, 23.0))
		fb.add_box(fence, Vector3(0.06, 0.06, 30.0), Vector3(x, KERB + 0.1, 23.0))
		for z in range(8, 39, 2):
			fb.add_box(fence, Vector3(0.05, 1.9, 0.05), Vector3(x, KERB + 0.95, z))
		for z in range(8, 38):
			fb.add_box(fence, Vector3(0.02, 1.8, 0.02), Vector3(x, KERB + 0.95, z + 0.5))
	Build.collider(root, Vector3(19.7, 2.0, 0.1), Vector3(0, 1.0, 38.0), "LotFenceBack")
	fb.add_box(fence, Vector3(19.7, 1.9, 0.04), Vector3(0, KERB + 0.95, 38.0))
	fb.commit(root, "Fences")


# --- Warehouse --------------------------------------------------------------

func _profile(half_w: float, wall_h: float, arch_h: float, steps := 18) -> PackedVector2Array:
	var pts := PackedVector2Array()
	pts.append(Vector2(-half_w, 0))
	for i in steps + 1:
		var a := PI - PI * float(i) / steps
		pts.append(Vector2(half_w * cos(a), wall_h + arch_h * sin(a)))
	pts.append(Vector2(half_w, 0))
	return pts


func _build_warehouse() -> void:
	var root := Node3D.new()
	root.name = "Warehouse"
	root.position.y = KERB
	add_child(root)
	# Arched shell in rusty corrugated metal (texture cut from the real warehouse photo).
	var shell := Build.extrude_profile(_profile(WH_HALF_W, WH_WALL_H, WH_ARCH_H), WH_FRONT_Z, WH_BACK_Z, Tex.uv_mat("rust_roof", Color.WHITE, true), 2.5)
	shell.name = "Shell"
	root.add_child(shell)
	roof_nodes.append(shell)
	# Steel arch ribs every 3 m, just inside the shell.
	var rib_mat := Tex.flat(Color(0.2, 0.17, 0.15), 0.6, 0.5).duplicate()
	rib_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	var rib_profile := _profile(WH_HALF_W - 0.12, WH_WALL_H, WH_ARCH_H - 0.12)
	var z := WH_FRONT_Z + 1.5
	while z < WH_BACK_Z:
		var rib := Build.extrude_profile(rib_profile, z - 0.08, z + 0.08, rib_mat)
		rib.name = "Rib"
		root.add_child(rib)
		roof_nodes.append(rib)
		z += 3.0
	# End walls in white corrugated metal: front with a door opening, back closed.
	var wall_mat := Tex.mat("corrugated", Color(0.95, 0.95, 0.93), 0.4, true)
	var front_pts := _profile(WH_HALF_W, WH_WALL_H, WH_ARCH_H)
	front_pts.append(Vector2(DOOR_HALF_W, 0))
	front_pts.append(Vector2(DOOR_HALF_W, DOOR_H))
	front_pts.append(Vector2(-DOOR_HALF_W, DOOR_H))
	front_pts.append(Vector2(-DOOR_HALF_W, 0))
	var front := Build.polygon_wall(front_pts, WH_FRONT_Z, wall_mat)
	front.name = "FrontWall"
	root.add_child(front)
	roof_nodes.append(front)
	var back := Build.polygon_wall(_profile(WH_HALF_W, WH_WALL_H, WH_ARCH_H), WH_BACK_Z, wall_mat)
	back.name = "BackWall"
	root.add_child(back)
	# Door frame, a lamp over the door and the sign.
	var frame := Tex.flat(Color(0.22, 0.19, 0.17), 0.6, 0.4)
	Build.box(root, Vector3(0.15, DOOR_H, 0.25), Vector3(-DOOR_HALF_W - 0.07, DOOR_H * 0.5, WH_FRONT_Z), frame)
	Build.box(root, Vector3(0.15, DOOR_H, 0.25), Vector3(DOOR_HALF_W + 0.07, DOOR_H * 0.5, WH_FRONT_Z), frame)
	Build.box(root, Vector3(DOOR_HALF_W * 2 + 0.3, 0.4, 0.3), Vector3(0, DOOR_H + 0.2, WH_FRONT_Z), frame)
	var sign_board := Build.box(root, Vector3(5.2, 0.7, 0.08), Vector3(0, DOOR_H + 0.95, WH_FRONT_Z - 0.06), Tex.flat(Color(0.1, 0.12, 0.25), 0.5))
	roof_nodes.append(sign_board)
	var sign := Label3D.new()
	sign.text = "EDDY & ZN  -  SPECERIJEN"
	sign.font_size = 72
	sign.pixel_size = 0.006
	sign.modulate = Color(1.0, 0.85, 0.35)
	sign.outline_size = 10
	sign.position = Vector3(0, DOOR_H + 0.95, WH_FRONT_Z - 0.11)
	sign.rotation.y = PI
	root.add_child(sign)
	roof_nodes.append(sign)
	# Colliders: side walls, back wall, front wall either side of the door.
	Build.collider(root, Vector3(0.4, 3.0, WH_BACK_Z - WH_FRONT_Z), Vector3(-WH_HALF_W + 0.1, 1.5, (WH_FRONT_Z + WH_BACK_Z) * 0.5), "WallL")
	Build.collider(root, Vector3(0.4, 3.0, WH_BACK_Z - WH_FRONT_Z), Vector3(WH_HALF_W - 0.1, 1.5, (WH_FRONT_Z + WH_BACK_Z) * 0.5), "WallR")
	Build.collider(root, Vector3(WH_HALF_W * 2, 3.0, 0.4), Vector3(0, 1.5, WH_BACK_Z), "WallBack")
	var side_w := WH_HALF_W - DOOR_HALF_W
	Build.collider(root, Vector3(side_w, 3.0, 0.3), Vector3(-DOOR_HALF_W - side_w * 0.5, 1.5, WH_FRONT_Z), "WallFrontL")
	Build.collider(root, Vector3(side_w, 3.0, 0.3), Vector3(DOOR_HALF_W + side_w * 0.5, 1.5, WH_FRONT_Z), "WallFrontR")
	# Roller shutter, closed until Dad hands over the keys.
	shutter = Build.solid(root, Vector3(DOOR_HALF_W * 2, DOOR_H, 0.12), Vector3(0, DOOR_H * 0.5, WH_FRONT_Z - 0.1), Tex.mat("shutter", Color.WHITE, 0.6), "Shutter")
	# Hide the roof while the player is inside, so the high camera can see in.
	var inside := Area3D.new()
	inside.name = "InsideArea"
	inside.collision_layer = 0
	inside.collision_mask = 1
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = Vector3(WH_HALF_W * 2 - 0.6, 4.0, WH_BACK_Z - WH_FRONT_Z - 0.4)
	cs.shape = bs
	inside.add_child(cs)
	inside.position = Vector3(0, 2.0, (WH_FRONT_Z + WH_BACK_Z) * 0.5 + 0.2)
	inside.body_entered.connect(_on_inside_entered)
	inside.body_exited.connect(_on_inside_exited)
	root.add_child(inside)


func _build_interior() -> void:
	var root := Node3D.new()
	root.name = "Interior"
	root.position.y = KERB
	add_child(root)
	var length_z := WH_BACK_Z - WH_FRONT_Z
	var mid_z := (WH_FRONT_Z + WH_BACK_Z) * 0.5
	Build.box(root, Vector3(WH_HALF_W * 2 - 0.1, 0.02, length_z - 0.1), Vector3(0, 0.012, mid_z), Tex.mat("dirt", Color.WHITE, 0.4), "DirtFloor")
	# White corrugated lower walls with a brown rail, like the reference photo.
	var panel := Tex.mat("corrugated", Color.WHITE, 0.45)
	var rail := Tex.flat(Color(0.38, 0.24, 0.14), 0.7, 0.2)
	for side in [-1, 1]:
		Build.box(root, Vector3(0.06, 2.3, length_z - 0.4), Vector3((WH_HALF_W - 0.28) * side, 1.15, mid_z), panel, "LowerWall")
		Build.box(root, Vector3(0.12, 0.12, length_z - 0.4), Vector3((WH_HALF_W - 0.3) * side, 2.35, mid_z), rail, "Rail")
	# Fluorescent tubes and their light.
	for lz in [WH_FRONT_Z + 6.0, WH_FRONT_Z + 15.0]:
		Build.box(root, Vector3(0.12, 0.08, 1.6), Vector3(-1.5, 5.6, lz), Tex.flat(Color(0.95, 0.97, 1.0), 0.3, 0.0, 3.0), "Tube")
		var light := OmniLight3D.new()
		light.position = Vector3(0, 4.6, lz)
		light.omni_range = 13.0
		light.light_energy = 1.2
		light.light_color = Color(1.0, 0.95, 0.85)
		root.add_child(light)
	var shelf := Props.red_shelf()
	shelf.position = Vector3(WH_HALF_W - 0.75, 0, WH_BACK_Z - 7.0)
	shelf.rotation.y = -PI / 2
	root.add_child(shelf)
	Build.collider(root, Vector3(0.6, 2.0, 1.9), Vector3(WH_HALF_W - 0.75, 1.0, WH_BACK_Z - 7.0), "ShelfCollider")


# --- Junk -------------------------------------------------------------------

func _build_junk() -> void:
	var root := Node3D.new()
	root.name = "Junk"
	root.position.y = KERB
	add_child(root)
	var defs := [
		["Old doner grill", 120, "doner_grill", Vector3(-4.6, 0, 16.0), 0.5, Vector3(0.8, 2.2, 0.7)],
		["Old doner grill", 120, "doner_grill", Vector3(-4.8, 0, 19.0), 0.3, Vector3(0.8, 2.2, 0.7)],
		["Rusty doner grill", 90, "doner_grill", Vector3(4.6, 0, 17.0), -0.6, Vector3(0.8, 2.2, 0.7)],
		["Greasy deep fryer", 60, "deep_fryer", Vector3(-1.6, 0, 22.0), 0.2, Vector3(0.7, 1.1, 0.8)],
		["Greasy deep fryer", 60, "deep_fryer", Vector3(1.4, 0, 25.0), -0.3, Vector3(0.7, 1.1, 0.8)],
		["Meat slicer", 80, "meat_slicer", Vector3(4.4, 0, 22.5), -1.2, Vector3(1.0, 1.3, 0.7)],
		["Broken display fridge", 150, "display_fridge", Vector3(-5.3, 0, 28.5), PI / 2, Vector3(1.2, 1.9, 0.75)],
		["Gas bottles", 30, "gas_bottles", Vector3(2.6, 0, 29.5), 0.0, Vector3(0.8, 0.85, 0.8)],
	]
	for d in defs:
		var body := StaticBody3D.new()
		body.name = "Junk_" + String(d[2])
		body.position = d[3]
		body.rotation.y = d[4]
		var size: Vector3 = d[5]
		var shape := CollisionShape3D.new()
		var bs := BoxShape3D.new()
		bs.size = size
		shape.shape = bs
		shape.position = Vector3(0, size.y * 0.5, 0)
		body.add_child(shape)
		body.add_child(_make_prop(d[2]))
		root.add_child(body)
		var area := Interactable.attach(body, size + Vector3(1.0, 0.4, 1.0), "Haul out: %s  (%d W)" % [d[0], d[1]], Vector3(0, size.y * 0.5, 0))
		area.set_meta("item_name", d[0])
		area.set_meta("price", d[1])
		area.interacted.connect(_haul_out.bind(area, body))
		junk_items.append(area)
		Game.register_junk()


func _make_prop(kind: String) -> Node3D:
	match kind:
		"doner_grill": return Props.doner_grill()
		"deep_fryer": return Props.deep_fryer()
		"meat_slicer": return Props.meat_slicer()
		"display_fridge": return Props.display_fridge()
		"gas_bottles": return Props.gas_bottles()
	return Node3D.new()


func _haul_out(area: Interactable, body: StaticBody3D) -> void:
	if Game.stage != Game.Stage.CLEAR_WAREHOUSE or not area.enabled:
		return
	area.enabled = false
	junk_items.erase(area)
	body.collision_layer = 0
	Game.clear_junk(area.get_meta("item_name"), area.get_meta("price"))
	var tween := create_tween()
	tween.tween_property(body, "scale", Vector3.ONE * 0.01, 0.35).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_IN)
	tween.tween_callback(body.queue_free)


# --- PC ---------------------------------------------------------------------

func _build_pc() -> void:
	var desk := Props.desk_with_pc()
	desk.position = Vector3(3.5, KERB, WH_BACK_Z - 0.8)
	add_child(desk)
	Build.collider(desk, Vector3(1.6, 0.8, 0.8), Vector3(0, 0.4, 0), "DeskCollider")
	pc_interactable = Interactable.attach(desk, Vector3(2.0, 2.0, 2.6), "Use the old PC", Vector3(0, 1.0, -0.6))
	pc_interactable.enabled = false
	_update_pc_prompt()
	pc_interactable.interacted.connect(func(): hud.open_pc())
	Game.junk_changed.connect(func(_c, _t): _update_pc_prompt())


func _update_pc_prompt() -> void:
	var left := Game.junk_total - Game.junk_cleared
	if Game.stage == Game.Stage.MEET_DAD:
		pc_interactable.disabled_prompt = "Talk to Dad first"
	else:
		pc_interactable.disabled_prompt = "Clear out the junk first (%d left)" % left


# --- Eddy Sr. ---------------------------------------------------------------

func _build_dad() -> void:
	_dad = Node3D.new()
	_dad.name = "EddySr"
	_dad.position = Vector3(2.6, KERB, WH_FRONT_Z - 2.2)
	add_child(_dad)
	var model := CharacterModel.new()
	model.head_texture = preload("res://assets/characters/eddy_sr_head.jpg")
	model.torso_texture = preload("res://assets/characters/sr_sweater.jpg")
	model.sleeve_texture = preload("res://assets/characters/sr_sleeve.jpg")
	model.legs_texture = preload("res://assets/characters/sr_trousers.jpg")
	model.skin = Color(0.8, 0.6, 0.5)
	model.shoes = Color(0.2, 0.14, 0.1)
	model.width = 1.05
	model.belly = 0.07
	model.height = 0.95
	_dad.add_child(model)
	Build.collider(_dad, Vector3(0.6, 1.7, 0.5), Vector3(0, 0.85, 0), "DadCollider")
	dad_interactable = Interactable.attach(_dad, Vector3(2.4, 2.0, 2.4), "Talk to Eddy Sr.", Vector3(0, 1.0, 0))
	dad_interactable.interacted.connect(_talk_to_dad)
	_face_player()


func _face_player() -> void:
	var player := get_node_or_null("Player") as Node3D
	if player and _dad:
		var d := player.global_position - _dad.global_position
		_dad.rotation.y = atan2(-d.x, -d.z)


func _intro_dialogue() -> void:
	if Game.stage != Game.Stage.MEET_DAD or Game.in_dialogue():
		return
	_face_player()
	Game.start_dialogue([
		["Eddy Sr.", "Eddy! My boy! Come, come. Look at her. Thirty years I ran this place."],
		["Eddy Sr.", "My knees are finished. My back is finished. Your mother says I am finished. So. She's yours now."],
		["Eddy Jr.", "Dad... it's a shed."],
		["Eddy Sr.", "It's a WAREHOUSE. Here, the keys. Don't lose them. I only have one. Okay, I have three. Don't lose them."],
		["Eddy Sr.", "Inside is all my old shoarma machines. Grills, fryers, the slicer. Beautiful. Useless, but beautiful."],
		["Eddy Sr.", "Clear it out, then sell everything on the computer. With the Wilders you buy spices. REAL spices, not the Lampas garbage."],
		["Eddy Jr.", "The computer is from 1995, Dad."],
		["Eddy Sr.", "And it still works better than you! The recipes are up here. *taps head* Go on, go!"],
	], _on_intro_done)


func _on_intro_done() -> void:
	Game.set_stage(Game.Stage.CLEAR_WAREHOUSE)
	Game.toast.emit("Got the warehouse keys")
	_open_shutter()


func _talk_to_dad() -> void:
	_face_player()
	match Game.stage:
		Game.Stage.MEET_DAD:
			_intro_dialogue()
		Game.Stage.CLEAR_WAREHOUSE:
			Game.start_dialogue([["Eddy Sr.", "What are you looking at me for? The junk won't move itself!"]])
		Game.Stage.USE_PC:
			Game.start_dialogue([["Eddy Sr.", "Now the computer. You press the buttons, the money comes. That's the internet."]])
		Game.Stage.SOLD_JUNK:
			Game.start_dialogue([["Eddy Sr.", "Look at you, a businessman! Now spices. Cumin, paprika, the good stuff."]])


func _open_shutter() -> void:
	if _shutter_open:
		return
	_shutter_open = true
	shutter.collision_layer = 0
	var tween := create_tween()
	tween.tween_property(shutter, "position:y", DOOR_H + 1.6, 1.2).set_trans(Tween.TRANS_SINE)


func _on_stage_changed(_stage) -> void:
	_update_pc_prompt()
	pc_interactable.enabled = Game.stage == Game.Stage.USE_PC


func _on_inside_entered(body: Node3D) -> void:
	if body is Player:
		player_inside = true
		_set_roof_hidden(true)
		set_render_layer(body, INTERIOR_LAYER)
		_fade_sun(0.12)


func _on_inside_exited(body: Node3D) -> void:
	if body is Player:
		player_inside = false
		_set_roof_hidden(false)
		set_render_layer(body, 1)
		_fade_sun(1.0)


## Fades the sun when walking in/out, so the inside reads as a dim shed on
## every renderer (the Compatibility renderer ignores the light cull mask).
func _fade_sun(energy: float) -> void:
	var sun := get_node_or_null("Sun") as DirectionalLight3D
	if sun:
		create_tween().tween_property(sun, "light_energy", energy, 0.4)


## Moves every mesh under `node` to the given render layer mask.
static func set_render_layer(node: Node, mask: int) -> void:
	if node is VisualInstance3D:
		(node as VisualInstance3D).layers = mask
	for c in node.get_children():
		set_render_layer(c, mask)


## Hides the roof from the camera but keeps its shadow, so the inside stays
## dim and lit by the tubes instead of the sun.
func _set_roof_hidden(hidden: bool) -> void:
	for n in roof_nodes:
		if n is GeometryInstance3D and not (n is Label3D):
			(n as GeometryInstance3D).cast_shadow = (
				GeometryInstance3D.SHADOW_CASTING_SETTING_SHADOWS_ONLY if hidden
				else GeometryInstance3D.SHADOW_CASTING_SETTING_ON)
		else:
			n.visible = not hidden


func is_roof_hidden() -> bool:
	var shell := roof_nodes[0] as GeometryInstance3D
	return shell.cast_shadow == GeometryInstance3D.SHADOW_CASTING_SETTING_SHADOWS_ONLY
