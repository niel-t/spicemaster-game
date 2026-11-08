class_name Props
## Blockout builders for Stage 1 props. Each returns a Node3D whose origin is
## at floor level and whose front faces -Z.

static func _steel() -> StandardMaterial3D:
	return Tex.mat("steel", Color.WHITE, 1.5)


static func _rusty() -> StandardMaterial3D:
	return Tex.flat(Color(0.48, 0.36, 0.28), 0.9, 0.3)


static func _root(node_name: String) -> Node3D:
	var n := Node3D.new()
	n.name = node_name
	return n


## Vertical doner/shoarma rotisserie: cabinet, spit, empty skewer, heater panel.
static func doner_grill() -> Node3D:
	var n := _root("DonerGrill")
	Build.box(n, Vector3(0.75, 0.15, 0.6), Vector3(0, 0.95, 0), _steel())
	Build.box(n, Vector3(0.7, 0.85, 0.55), Vector3(0, 0.45, 0), _rusty())
	Build.box(n, Vector3(0.75, 1.1, 0.08), Vector3(0, 1.6, 0.25), _steel())
	for i in 4:
		Build.box(n, Vector3(0.6, 0.05, 0.02), Vector3(0, 1.2 + i * 0.25, 0.2), Tex.flat(Color(0.75, 0.35, 0.12), 0.6, 0.2, 0.3))
	Build.cylinder(n, 0.025, 1.2, Vector3(0, 1.6, -0.05), _steel(), -1.0, 6)
	Build.cylinder(n, 0.14, 0.5, Vector3(0, 1.45, -0.05), Tex.flat(Color(0.35, 0.22, 0.14), 0.95), 0.2)
	Build.box(n, Vector3(0.5, 0.04, 0.4), Vector3(0, 2.18, 0.05), _steel())
	return n


static func deep_fryer() -> Node3D:
	var n := _root("DeepFryer")
	Build.box(n, Vector3(0.6, 0.9, 0.7), Vector3(0, 0.45, 0), _steel())
	Build.box(n, Vector3(0.52, 0.04, 0.6), Vector3(0, 0.91, 0), Tex.flat(Color(0.2, 0.16, 0.08), 0.3))
	for x in [-0.13, 0.13]:
		Build.box(n, Vector3(0.22, 0.12, 0.3), Vector3(x, 0.98, -0.05), Tex.flat(Color(0.55, 0.55, 0.5), 0.6, 0.5))
		Build.box(n, Vector3(0.03, 0.03, 0.3), Vector3(x, 1.02, -0.32), Tex.flat(Color(0.1, 0.1, 0.1)))
	Build.box(n, Vector3(0.5, 0.06, 0.02), Vector3(0, 0.75, -0.36), Tex.flat(Color(0.15, 0.15, 0.15)))
	return n


static func meat_slicer() -> Node3D:
	var n := _root("MeatSlicer")
	Build.box(n, Vector3(1.0, 0.8, 0.6), Vector3(0, 0.4, 0), _rusty())
	Build.box(n, Vector3(0.6, 0.12, 0.45), Vector3(0, 0.86, 0), _steel())
	var blade := Build.cylinder(n, 0.22, 0.03, Vector3(0.05, 1.1, 0), _steel(), -1.0, 16)
	blade.rotation.z = PI / 2
	Build.box(n, Vector3(0.25, 0.25, 0.3), Vector3(-0.2, 1.05, 0.05), Tex.flat(Color(0.85, 0.83, 0.78), 0.6))
	return n


static func display_fridge() -> Node3D:
	var n := _root("DisplayFridge")
	Build.box(n, Vector3(1.2, 1.9, 0.7), Vector3(0, 0.95, 0), Tex.flat(Color(0.88, 0.88, 0.86), 0.7))
	Build.box(n, Vector3(1.05, 1.45, 0.02), Vector3(0, 1.05, -0.36), Tex.flat(Color(0.16, 0.22, 0.26), 0.1, 0.2))
	Build.box(n, Vector3(1.2, 0.18, 0.02), Vector3(0, 1.83, -0.36), Tex.flat(Color(0.75, 0.12, 0.1), 0.7))
	return n


static func gas_bottles() -> Node3D:
	var n := _root("GasBottles")
	var colors := [Color(0.85, 0.35, 0.1), Color(0.8, 0.15, 0.1), Color(0.6, 0.6, 0.62)]
	var offsets := [Vector3(-0.25, 0, 0), Vector3(0.22, 0, 0.05), Vector3(0, 0, 0.32)]
	for i in 3:
		var o: Vector3 = offsets[i]
		Build.cylinder(n, 0.16, 0.7, o + Vector3(0, 0.35, 0), Tex.flat(colors[i], 0.6, 0.3))
		Build.cylinder(n, 0.05, 0.1, o + Vector3(0, 0.75, 0), Tex.flat(Color(0.3, 0.3, 0.3), 0.5, 0.6))
	return n


## Wooden desk with the beige 90s PC, CRT monitor and keyboard.
static func desk_with_pc() -> Node3D:
	var n := _root("DeskWithPC")
	var wood := Tex.flat(Color(0.45, 0.28, 0.16), 0.7)
	Build.box(n, Vector3(1.6, 0.06, 0.8), Vector3(0, 0.76, 0), wood)
	for x in [-0.75, 0.75]:
		for z in [-0.35, 0.35]:
			Build.box(n, Vector3(0.06, 0.73, 0.06), Vector3(x, 0.365, z), wood)
	var beige := Tex.flat(Color(0.86, 0.82, 0.7), 0.6)
	# Desktop case lying flat, monitor on top (like the reference photo).
	Build.box(n, Vector3(0.6, 0.18, 0.5), Vector3(0, 0.88, 0.1), beige)
	Build.box(n, Vector3(0.22, 0.04, 0.01), Vector3(0.12, 0.9, -0.151), Tex.flat(Color(0.6, 0.57, 0.48)))
	Build.box(n, Vector3(0.3, 0.05, 0.25), Vector3(0, 0.995, 0.1), beige)
	Build.box(n, Vector3(0.5, 0.42, 0.45), Vector3(0, 1.24, 0.12), beige)
	Build.box(n, Vector3(0.4, 0.3, 0.01), Vector3(0, 1.25, -0.106), Tex.flat(Color(0.0, 0.5, 0.5), 0.3, 0.0, 0.6), "Screen")
	Build.box(n, Vector3(0.62, 0.03, 0.2), Vector3(0, 0.805, -0.25), beige)
	Build.box(n, Vector3(0.1, 0.03, 0.14), Vector3(0.45, 0.805, -0.22), beige)
	# Chair.
	var dark := Tex.flat(Color(0.15, 0.15, 0.17), 0.8)
	Build.box(n, Vector3(0.5, 0.08, 0.5), Vector3(0, 0.48, -0.75), dark)
	Build.box(n, Vector3(0.5, 0.5, 0.06), Vector3(0, 0.78, -1.0), dark)
	Build.cylinder(n, 0.04, 0.44, Vector3(0, 0.22, -0.75), Tex.flat(Color(0.3, 0.3, 0.3), 0.5, 0.6))
	return n


## Red metal shelving unit like in the Stage 01 reference photo.
static func red_shelf() -> Node3D:
	var n := _root("RedShelf")
	var red := Tex.flat(Color(0.72, 0.12, 0.1), 0.6, 0.3)
	for x in [-0.9, 0.9]:
		for z in [-0.25, 0.25]:
			Build.box(n, Vector3(0.05, 2.0, 0.05), Vector3(x, 1.0, z), red)
	for y in [0.3, 0.8, 1.3, 1.8]:
		Build.box(n, Vector3(1.85, 0.04, 0.55), Vector3(0, y, 0), red)
	return n


## Car side profile in (Z, Y): front of the car is -Z.
static func _car_body(n: Node3D, color: Color, profile: PackedVector2Array, half_w: float, windows: Array) -> void:
	var paint := Tex.flat(color, 0.35, 0.4).duplicate()
	paint.cull_mode = BaseMaterial3D.CULL_DISABLED
	n.add_child(Build.prism(profile, half_w, paint))
	var glass := Tex.glass(Color(0.08, 0.1, 0.13))
	for w in windows:
		# w = PackedVector2Array window outline in (Z, Y), drawn on both sides.
		for side in [-1.0, 1.0]:
			var mi := Build.prism(w, 0.005, glass)
			mi.position.x = (half_w + 0.006) * side
			n.add_child(mi)


static func _wheels(n: Node3D, half_w: float, zs: Array, r := 0.32) -> void:
	var tyre := Tex.flat(Color(0.05, 0.05, 0.05), 0.9)
	var hub := Tex.flat(Color(0.6, 0.6, 0.62), 0.4, 0.7)
	for side in [-1.0, 1.0]:
		for z in zs:
			var w := Build.cylinder(n, r, 0.22, Vector3((half_w - 0.08) * side, r, z), tyre, -1.0, 12)
			w.rotation.z = PI / 2
			var h := Build.cylinder(n, r * 0.55, 0.23, Vector3((half_w - 0.08) * side, r, z), hub, -1.0, 8)
			h.rotation.z = PI / 2


static func _lights(n: Node3D, half_w: float, front_z: float, back_z: float, y: float) -> void:
	for side in [-1.0, 1.0]:
		Build.box(n, Vector3(0.3, 0.12, 0.04), Vector3((half_w - 0.25) * side, y, front_z - 0.01), Tex.flat(Color(1, 0.96, 0.85), 0.3, 0.0, 1.2))
		Build.box(n, Vector3(0.3, 0.12, 0.04), Vector3((half_w - 0.25) * side, y, back_z + 0.01), Tex.flat(Color(0.8, 0.05, 0.05), 0.3, 0.0, 0.8))


## Four-door 90s saloon.
static func sedan(color: Color) -> Node3D:
	var n := _root("Sedan")
	var hw := 0.86
	var body := PackedVector2Array([
		Vector2(-2.3, 0.28), Vector2(-2.35, 0.62), Vector2(-2.2, 0.78), Vector2(-1.0, 0.86),
		Vector2(-0.55, 1.32), Vector2(0.75, 1.34), Vector2(1.3, 0.92), Vector2(2.2, 0.86),
		Vector2(2.3, 0.62), Vector2(2.25, 0.28),
	])
	var windows := [
		PackedVector2Array([Vector2(-0.95, 0.9), Vector2(-0.52, 1.27), Vector2(0.08, 1.28), Vector2(0.08, 0.9)]),
		PackedVector2Array([Vector2(0.16, 0.9), Vector2(0.16, 1.28), Vector2(0.72, 1.29), Vector2(1.2, 0.92)]),
	]
	_car_body(n, color, body, hw, windows)
	var wind := Build.prism(PackedVector2Array([Vector2(-1.0, 0.88), Vector2(-0.56, 1.3), Vector2(-0.5, 1.3), Vector2(-0.94, 0.88)]), hw - 0.06, Tex.glass(Color(0.08, 0.1, 0.13)))
	n.add_child(wind)
	_wheels(n, hw, [-1.45, 1.4])
	_lights(n, hw, -2.35, 2.3, 0.68)
	Build.box(n, Vector3(hw * 2 + 0.04, 0.12, 0.08), Vector3(0, 0.38, -2.33), Tex.flat(Color(0.15, 0.15, 0.15)))
	Build.box(n, Vector3(hw * 2 + 0.04, 0.12, 0.08), Vector3(0, 0.38, 2.28), Tex.flat(Color(0.15, 0.15, 0.15)))
	return n


## Small hatchback.
static func hatchback(color: Color) -> Node3D:
	var n := _root("Hatchback")
	var hw := 0.8
	var body := PackedVector2Array([
		Vector2(-1.85, 0.28), Vector2(-1.9, 0.62), Vector2(-1.75, 0.76), Vector2(-0.8, 0.84),
		Vector2(-0.35, 1.32), Vector2(1.5, 1.32), Vector2(1.75, 0.95), Vector2(1.8, 0.28),
	])
	var windows := [
		PackedVector2Array([Vector2(-0.75, 0.88), Vector2(-0.33, 1.26), Vector2(0.45, 1.26), Vector2(0.45, 0.88)]),
		PackedVector2Array([Vector2(0.53, 0.88), Vector2(0.53, 1.26), Vector2(1.45, 1.26), Vector2(1.66, 0.96), Vector2(1.66, 0.88)]),
	]
	_car_body(n, color, body, hw, windows)
	_wheels(n, hw, [-1.15, 1.2], 0.3)
	_lights(n, hw, -1.9, 1.8, 0.68)
	return n


## The Oofmobiel: Eddy's blue van (a boxy panel van).
static func oofmobiel() -> Node3D:
	var n := _root("Oofmobiel")
	var hw := 0.95
	var body := PackedVector2Array([
		Vector2(-2.55, 0.3), Vector2(-2.6, 0.75), Vector2(-2.45, 1.0), Vector2(-1.75, 1.15),
		Vector2(-1.25, 1.95), Vector2(2.4, 1.98), Vector2(2.45, 0.3),
	])
	var windows := [
		PackedVector2Array([Vector2(-1.7, 1.2), Vector2(-1.28, 1.88), Vector2(-0.6, 1.88), Vector2(-0.6, 1.2)]),
	]
	_car_body(n, Color(0.13, 0.3, 0.62), body, hw, windows)
	var wind := Build.prism(PackedVector2Array([Vector2(-1.76, 1.17), Vector2(-1.27, 1.93), Vector2(-1.2, 1.93), Vector2(-1.69, 1.17)]), hw - 0.06, Tex.glass(Color(0.08, 0.1, 0.13)))
	n.add_child(wind)
	_wheels(n, hw, [-1.75, 1.6], 0.36)
	_lights(n, hw, -2.6, 2.45, 0.8)
	# Side lettering on the panel.
	for side in [-1.0, 1.0]:
		var l := Label3D.new()
		l.text = "EDDY & ZN\nSPECERIJEN"
		l.font_size = 48
		l.pixel_size = 0.005
		l.modulate = Color(1.0, 0.85, 0.3)
		l.outline_size = 6
		l.position = Vector3((hw + 0.02) * side, 1.35, 0.9)
		l.rotation.y = PI / 2 * side
		n.add_child(l)
	return n


static func street_lamp() -> Node3D:
	var n := _root("StreetLamp")
	var pole := Tex.flat(Color(0.2, 0.22, 0.22), 0.5, 0.6)
	Build.cylinder(n, 0.1, 0.5, Vector3(0, 0.25, 0), pole, 0.07, 8)
	Build.cylinder(n, 0.06, 6.0, Vector3(0, 3.0, 0), pole, 0.045, 8)
	var arm := Build.cylinder(n, 0.035, 1.4, Vector3(0, 5.9, -0.6), pole, -1.0, 6)
	arm.rotation.x = PI / 2 - 0.15
	Build.box(n, Vector3(0.28, 0.12, 0.6), Vector3(0, 5.95, -1.3), pole)
	Build.box(n, Vector3(0.22, 0.03, 0.5), Vector3(0, 5.88, -1.3), Tex.flat(Color(1, 0.88, 0.62), 0.4, 0.0, 1.0))
	return n


static func bollard() -> Node3D:
	var n := _root("Bollard")
	Build.cylinder(n, 0.07, 0.9, Vector3(0, 0.45, 0), Tex.flat(Color(0.35, 0.12, 0.1), 0.6, 0.3), 0.06, 8)
	Build.cylinder(n, 0.075, 0.06, Vector3(0, 0.75, 0), Tex.flat(Color(0.85, 0.85, 0.8)), -1.0, 8)
	return n


static func bike_rack() -> Node3D:
	var n := _root("BikeRack")
	var m := Tex.flat(Color(0.5, 0.52, 0.52), 0.4, 0.7)
	for i in 4:
		var hoop := Build.cylinder(n, 0.02, 0.8, Vector3(i * 0.6, 0.4, 0), m, -1.0, 6)
		hoop.rotation.x = 0.0
		Build.box(n, Vector3(0.04, 0.04, 0.6), Vector3(i * 0.6, 0.8, 0), m)
	return n


static func bin() -> Node3D:
	var n := _root("Bin")
	Build.box(n, Vector3(0.7, 1.0, 0.7), Vector3(0, 0.5, 0), Tex.flat(Color(0.16, 0.35, 0.18), 0.8))
	Build.box(n, Vector3(0.74, 0.06, 0.74), Vector3(0, 1.03, 0), Tex.flat(Color(0.12, 0.28, 0.14), 0.8))
	return n
