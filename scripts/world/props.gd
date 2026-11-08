class_name Props
## Blockout builders for Stage 1 props. Each returns a Node3D whose origin is
## at floor level and whose front faces -Z.

static func _steel() -> StandardMaterial3D:
	return Tex.flat(Color(0.62, 0.63, 0.64), 0.45, 0.6)


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


## The Oofmobiel: Eddy's blue van.
static func oofmobiel() -> Node3D:
	var n := _root("Oofmobiel")
	var blue := Tex.flat(Color(0.12, 0.28, 0.62), 0.4, 0.3)
	var glass := Tex.flat(Color(0.1, 0.14, 0.18), 0.1, 0.3)
	var tyre := Tex.flat(Color(0.06, 0.06, 0.06), 0.9)
	Build.box(n, Vector3(1.9, 1.5, 4.9), Vector3(0, 1.25, 0.1), blue)
	Build.box(n, Vector3(1.88, 0.7, 0.9), Vector3(0, 0.85, -2.65), blue)
	Build.box(n, Vector3(1.8, 0.6, 0.05), Vector3(0, 1.55, -2.31), glass)
	for side in [-1, 1]:
		Build.box(n, Vector3(0.02, 0.5, 0.8), Vector3(0.96 * side, 1.6, -1.6), glass)
		Build.box(n, Vector3(0.02, 0.45, 2.6), Vector3(0.96 * side, 1.62, 0.9), glass)
		for z in [-2.0, 1.7]:
			var w := Build.cylinder(n, 0.38, 0.28, Vector3(0.86 * side, 0.38, z), tyre, -1.0, 12)
			w.rotation.z = PI / 2
	Build.box(n, Vector3(1.6, 0.12, 0.06), Vector3(0, 0.55, -3.1), Tex.flat(Color(0.7, 0.7, 0.7), 0.4, 0.7))
	Build.box(n, Vector3(0.35, 0.12, 0.03), Vector3(-0.6, 0.9, -3.11), Tex.flat(Color(1, 0.95, 0.8), 0.3, 0.0, 1.5))
	Build.box(n, Vector3(0.35, 0.12, 0.03), Vector3(0.6, 0.9, -3.11), Tex.flat(Color(1, 0.95, 0.8), 0.3, 0.0, 1.5))
	return n


static func street_lamp() -> Node3D:
	var n := _root("StreetLamp")
	var pole := Tex.flat(Color(0.25, 0.27, 0.27), 0.6, 0.5)
	Build.cylinder(n, 0.07, 5.5, Vector3(0, 2.75, 0), pole, -1.0, 6)
	Build.box(n, Vector3(0.12, 0.08, 1.4), Vector3(0, 5.45, -0.65), pole)
	Build.box(n, Vector3(0.3, 0.12, 0.5), Vector3(0, 5.38, -1.3), Tex.flat(Color(1, 0.9, 0.7), 0.4, 0.0, 0.8))
	return n


static func bin() -> Node3D:
	var n := _root("Bin")
	Build.box(n, Vector3(0.7, 1.0, 0.7), Vector3(0, 0.5, 0), Tex.flat(Color(0.16, 0.35, 0.18), 0.8))
	Build.box(n, Vector3(0.74, 0.06, 0.74), Vector3(0, 1.03, 0), Tex.flat(Color(0.12, 0.28, 0.14), 0.8))
	return n
