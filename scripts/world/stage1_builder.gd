extends Node3D
## Stage 1: a short Kaasland street with Eddy Sr.'s old warehouse.
## Builds the blockout from code so it can be iterated quickly; replace pieces
## with authored scenes/assets as they arrive.
##
## Flow: intro talk with Eddy Sr. outside -> shutter opens -> haul out the old
## shoarma equipment -> the old PC unlocks -> sell the junk for Wilders.

const WH_HALF_W := 7.2      # warehouse half width (m)
const WH_WALL_H := 2.2      # straight wall height before the arch starts
const WH_ARCH_H := 4.0      # arch rise above the walls
const WH_FRONT_Z := 12.0
const WH_BACK_Z := 36.0
const DOOR_HALF_W := 2.0
const DOOR_H := 3.4

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
	_build_warehouse()
	_build_interior()
	_build_junk()
	_build_pc()
	_build_dad()
	hud = preload("res://scripts/ui/hud.gd").new()
	hud.name = "HUD"
	add_child(hud)
	Game.stage_changed.connect(_on_stage_changed)
	get_tree().create_timer(0.8).timeout.connect(_intro_dialogue)


# --- Look -------------------------------------------------------------------

func _build_environment() -> void:
	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.38, 0.5, 0.66)
	sky_mat.sky_horizon_color = Color(0.78, 0.74, 0.66)
	sky_mat.ground_horizon_color = Color(0.7, 0.66, 0.6)
	sky_mat.ground_bottom_color = Color(0.3, 0.28, 0.26)
	var sky := Sky.new()
	sky.sky_material = sky_mat
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.55
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	# GTA3-style haze that swallows the far end of the street.
	env.fog_enabled = true
	env.fog_light_color = Color(0.72, 0.7, 0.64)
	env.fog_density = 0.018
	env.fog_sky_affect = 0.4
	env.adjustment_enabled = true
	env.adjustment_saturation = 1.0
	env.adjustment_contrast = 1.12
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.light_color = Color(1.0, 0.9, 0.76)
	sun.light_energy = 1.0
	sun.shadow_enabled = true
	sun.rotation = Vector3(deg_to_rad(-42), deg_to_rad(35), 0)
	add_child(sun)


# --- Street -----------------------------------------------------------------

func _build_ground_and_street() -> void:
	var root := Node3D.new()
	root.name = "Street"
	add_child(root)
	Build.solid(root, Vector3(180, 1, 180), Vector3(0, -0.5, 0), Tex.mat("concrete", Color.WHITE, 0.3), "Ground")
	Build.box(root, Vector3(96, 0.02, 10), Vector3(0, 0.01, 0), Tex.mat("asphalt", Color.WHITE, 0.4), "Road")
	for x in range(-44, 46, 6):
		Build.box(root, Vector3(2.5, 0.025, 0.15), Vector3(x, 0.012, 0), Tex.flat(Color(0.9, 0.88, 0.8)), "LaneDash")
	for side in [-1, 1]:
		Build.box(root, Vector3(96, 0.03, 3), Vector3(0, 0.015, 6.5 * side), Tex.mat("sidewalk", Color.WHITE, 0.5), "Sidewalk")
		Build.box(root, Vector3(96, 0.04, 0.2), Vector3(0, 0.02, 5.05 * side), Tex.flat(Color(0.5, 0.49, 0.46)), "Curb")
		for x in range(-30, 34, 12):
			var lamp := Props.street_lamp()
			lamp.position = Vector3(x, 0, 7.6 * side)
			lamp.rotation.y = 0.0 if side > 0 else PI
			root.add_child(lamp)
	for x in [-14.0, 15.0, -26.0]:
		var bin := Props.bin()
		bin.position = Vector3(x, 0, 7.4)
		root.add_child(bin)
	var van := Props.oofmobiel()
	van.position = Vector3(-6.5, 0, 3.0)
	van.rotation.y = -PI / 2
	root.add_child(van)
	Build.collider(root, Vector3(5.8, 2.2, 2.0), Vector3(-6.5, 1.1, 3.0), "VanCollider")
	# Invisible bounds at both ends of the street and behind the lot.
	Build.collider(root, Vector3(1, 6, 40), Vector3(-45, 3, 0), "BoundW")
	Build.collider(root, Vector3(1, 6, 40), Vector3(45, 3, 0), "BoundE")


func _building(parent: Node3D, center: Vector3, size: Vector3, kind: String, tint: Color, sign := "", sign_color := Color.WHITE, sign_face := -1) -> void:
	Build.solid(parent, size, center + Vector3(0, size.y * 0.5, 0), Tex.mat(kind, tint, 0.25), "Building")
	Build.box(parent, Vector3(size.x + 0.3, 0.35, size.z + 0.3), center + Vector3(0, size.y + 0.17, 0), Tex.flat(tint.darkened(0.35)), "Cornice")
	if sign != "":
		# Lit shop sign over the ground floor on the street-facing side.
		var face_z := center.z + size.z * 0.5 * -sign_face
		var panel_z := face_z + 0.12 * -sign_face
		var panel := Build.box(parent, Vector3(minf(size.x - 1.0, 7.0), 0.8, 0.2), Vector3(center.x, 3.2, panel_z), Tex.flat(sign_color.darkened(0.6), 0.6), "Sign")
		var label := Label3D.new()
		label.text = sign
		label.font_size = 64
		label.pixel_size = 0.006
		label.modulate = sign_color
		label.outline_size = 8
		label.position = Vector3(center.x, 3.2, panel_z + 0.12 * -sign_face)
		label.rotation.y = 0.0 if sign_face < 0 else PI
		parent.add_child(label)
		panel.name = "Sign_" + sign.replace(" ", "_")


func _build_buildings() -> void:
	var root := Node3D.new()
	root.name = "Buildings"
	add_child(root)
	# North side of the road: a continuous row, fronts at z = -8.
	var north := [
		[-38.0, 10.0, 9.0, "brick", Color(1, 1, 1), "", Color.WHITE],
		[-28.0, 10.0, 12.0, "facade", Color(1, 0.95, 0.85), "WASSALON", Color(0.4, 0.8, 1.0)],
		[-18.5, 9.0, 7.0, "brick", Color(0.85, 0.75, 0.7), "SHOARMA PALEIS", Color(1.0, 0.75, 0.2)],
		[-9.0, 10.0, 14.0, "facade", Color(0.9, 0.95, 1.0), "", Color.WHITE],
		[1.0, 10.0, 8.0, "brick", Color(0.75, 0.8, 0.75), "TOKO KAASLAND", Color(0.4, 1.0, 0.5)],
		[11.0, 10.0, 11.0, "facade", Color(1, 0.9, 0.85), "", Color.WHITE],
		[21.0, 10.0, 7.5, "brick", Color(1, 1, 1), "SLAGERIJ BERT", Color(1.0, 0.35, 0.3)],
		[31.0, 10.0, 13.0, "facade", Color(0.95, 0.92, 0.8), "", Color.WHITE],
		[40.5, 9.0, 9.0, "brick", Color(0.8, 0.7, 0.65), "", Color.WHITE],
	]
	for b in north:
		_building(root, Vector3(b[0], 0, -14.0), Vector3(b[1], b[2], 12.0), b[3], b[4], b[5], b[6], -1)
	# South side, either side of the warehouse lot (fronts at z = 8).
	var south := [
		[-30.0, 12.0, 8.0, "facade", Color(0.95, 0.9, 0.82), "BAKKERIJ", Color(1.0, 0.85, 0.5)],
		[-17.0, 13.0, 10.0, "brick", Color(0.9, 0.8, 0.75), "", Color.WHITE],
		[17.5, 13.0, 6.5, "brick", Color(0.8, 0.85, 0.9), "AUTO SCHADE", Color(1.0, 1.0, 0.4)],
		[31.0, 13.0, 11.0, "facade", Color(1, 0.95, 0.9), "", Color.WHITE],
	]
	for b in south:
		_building(root, Vector3(b[0], 0, 16.0), Vector3(b[1], b[2], 16.0), b[3], b[4], b[5], b[6], 1)
	# Buildings closing off both ends of the street.
	_building(root, Vector3(-48.0, 0, 0), Vector3(6, 10, 24), "brick", Color(0.85, 0.8, 0.75))
	_building(root, Vector3(48.0, 0, 0), Vector3(6, 11, 24), "facade", Color(0.95, 0.92, 0.85))
	# Fences around the warehouse lot.
	var fence := Tex.flat(Color(0.35, 0.36, 0.35), 0.6, 0.5)
	for x in [-9.8, 9.8]:
		Build.solid(root, Vector3(0.1, 2.0, 30.0), Vector3(x, 1.0, 23.0), fence, "LotFence")
	Build.solid(root, Vector3(19.7, 2.0, 0.1), Vector3(0, 1.0, 38.0), fence, "LotFenceBack")


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
	add_child(root)
	var shell_mat := Tex.mat("rust_roof", Color.WHITE, 0.5, true)
	var shell := Build.extrude_profile(_profile(WH_HALF_W, WH_WALL_H, WH_ARCH_H), WH_FRONT_Z, WH_BACK_Z, shell_mat)
	shell.name = "Shell"
	root.add_child(shell)
	roof_nodes.append(shell)
	# Steel arch ribs every 3 m, just inside the shell.
	var rib_mat := Tex.flat(Color(0.22, 0.2, 0.19), 0.6, 0.5)
	rib_mat = rib_mat.duplicate()
	rib_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	var rib_profile := _profile(WH_HALF_W - 0.12, WH_WALL_H, WH_ARCH_H - 0.12)
	var z := WH_FRONT_Z + 1.5
	while z < WH_BACK_Z:
		var rib := Build.extrude_profile(rib_profile, z - 0.08, z + 0.08, rib_mat)
		rib.name = "Rib"
		root.add_child(rib)
		roof_nodes.append(rib)
		z += 3.0
	# End walls: front with a door opening, back closed.
	var wall_mat := Tex.mat("corrugated", Color(0.92, 0.92, 0.9), 0.5, true)
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
	# Door frame and sign.
	var frame := Tex.flat(Color(0.25, 0.22, 0.2), 0.6, 0.4)
	Build.box(root, Vector3(0.15, DOOR_H, 0.25), Vector3(-DOOR_HALF_W - 0.07, DOOR_H * 0.5, WH_FRONT_Z), frame)
	Build.box(root, Vector3(0.15, DOOR_H, 0.25), Vector3(DOOR_HALF_W + 0.07, DOOR_H * 0.5, WH_FRONT_Z), frame)
	Build.box(root, Vector3(DOOR_HALF_W * 2 + 0.3, 0.4, 0.3), Vector3(0, DOOR_H + 0.2, WH_FRONT_Z), frame)
	var sign := Label3D.new()
	sign.text = "EDDY & ZN  -  SPECERIJEN"
	sign.font_size = 72
	sign.pixel_size = 0.006
	sign.modulate = Color(1.0, 0.85, 0.35)
	sign.outline_size = 10
	sign.position = Vector3(0, DOOR_H + 0.95, WH_FRONT_Z - 0.05)
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
	shutter = Build.solid(root, Vector3(DOOR_HALF_W * 2, DOOR_H, 0.12), Vector3(0, DOOR_H * 0.5, WH_FRONT_Z - 0.1), Tex.mat("shutter", Color.WHITE, 1.0), "Shutter")
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
	add_child(root)
	var length_z := WH_BACK_Z - WH_FRONT_Z
	var mid_z := (WH_FRONT_Z + WH_BACK_Z) * 0.5
	Build.box(root, Vector3(WH_HALF_W * 2 - 0.1, 0.03, length_z - 0.1), Vector3(0, 0.02, mid_z), Tex.mat("dirt", Color.WHITE, 0.5), "DirtFloor")
	# White corrugated lower walls with a brown rail, like the reference photo.
	var panel := Tex.mat("corrugated", Color.WHITE, 0.6)
	var rail := Tex.flat(Color(0.4, 0.26, 0.16), 0.7, 0.2)
	for side in [-1, 1]:
		Build.box(root, Vector3(0.06, 2.3, length_z - 0.4), Vector3((WH_HALF_W - 0.28) * side, 1.15, mid_z), panel, "LowerWall")
		Build.box(root, Vector3(0.12, 0.12, length_z - 0.4), Vector3((WH_HALF_W - 0.3) * side, 2.35, mid_z), rail, "Rail")
	# Fluorescent tubes and their light.
	for lz in [WH_FRONT_Z + 6.0, WH_FRONT_Z + 15.0]:
		Build.box(root, Vector3(0.12, 0.08, 1.6), Vector3(-1.5, 5.6, lz), Tex.flat(Color(0.95, 0.97, 1.0), 0.3, 0.0, 3.0), "Tube")
		var light := OmniLight3D.new()
		light.position = Vector3(0, 4.6, lz)
		light.omni_range = 13.0
		light.light_energy = 1.4
		light.light_color = Color(0.95, 0.97, 1.0)
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
	desk.position = Vector3(3.5, 0, WH_BACK_Z - 0.8)
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
	_dad.position = Vector3(2.6, 0, WH_FRONT_Z - 2.2)
	add_child(_dad)
	var model := CharacterModel.new()
	model.skin = Color(0.86, 0.66, 0.56)
	model.shirt = Color(0.13, 0.15, 0.22)
	model.pants = Color(0.35, 0.34, 0.33)
	model.hair_color = Color(0.93, 0.92, 0.9)
	model.hair = CharacterModel.Hair.BALDING_WHITE
	model.collar_trim = true
	model.width = 1.08
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


func _on_inside_exited(body: Node3D) -> void:
	if body is Player:
		player_inside = false
		_set_roof_hidden(false)


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
