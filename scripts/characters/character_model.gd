class_name CharacterModel
extends Node3D
## Low-poly GTA3-era character: smooth lofted body parts (about 1,500
## triangles), photo-textured head, per-vertex lighting like the PS2.
## Body parts are separate pivots so they can swing when walking.
## Swap for a rigged .glb under assets/characters/ when real art exists.

@export var head_texture: Texture2D       ## 512x256 wrap: face in the middle half.
@export var torso_texture: Texture2D      ## u = around the body (front = 0.5), v = neck to hips.
@export var sleeve_texture: Texture2D
@export var legs_texture: Texture2D
@export var skin := Color(0.85, 0.62, 0.5)
@export var shoes := Color(0.1, 0.09, 0.08)
@export var width := 1.0                  ## Shoulder/hip width multiplier.
@export var belly := 0.0                  ## 0 = flat, 0.08 = proper dad belly.
@export var height := 1.0                 ## Overall height multiplier.
@export var hair_volume := 1.0            ## >1 puffs the top of the head (curly hair).

## Set by the owner each frame: 0 = standing, 1 = walking, 2 = running.
var move_amount := 0.0

const SIDES := 10

var _body: Node3D
var _arm_l: Node3D
var _arm_r: Node3D
var _fore_l: Node3D
var _fore_r: Node3D
var _leg_l: Node3D
var _leg_r: Node3D
var _shin_l: Node3D
var _shin_r: Node3D
var _t := 0.0


func _ready() -> void:
	_build()


func _process(delta: float) -> void:
	_t += delta * (3.0 + move_amount * 4.5)
	var amt := clampf(move_amount, 0.0, 1.6)
	var s := sin(_t)
	_arm_l.rotation.x = s * 0.55 * amt
	_arm_r.rotation.x = -s * 0.55 * amt
	_fore_l.rotation.x = -0.15 - maxf(0.0, s) * 0.4 * amt
	_fore_r.rotation.x = -0.15 - maxf(0.0, -s) * 0.4 * amt
	_leg_l.rotation.x = -s * 0.6 * amt
	_leg_r.rotation.x = s * 0.6 * amt
	_shin_l.rotation.x = maxf(0.0, s) * 0.8 * amt
	_shin_r.rotation.x = maxf(0.0, -s) * 0.8 * amt
	_body.position.y = absf(cos(_t)) * 0.035 * amt + sin(_t * 0.4) * 0.006


# --- Materials --------------------------------------------------------------

func _mat(tex: Texture2D, color := Color.WHITE) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_PER_VERTEX
	m.albedo_color = color
	m.roughness = 0.9
	if tex:
		m.albedo_texture = tex
		m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	return m


# --- Lofting ----------------------------------------------------------------

## rings: Array of [y, rx, rz, v] from top to bottom (v = texture row).
## Front of the body is -Z; u = 0.5 there.
static func loft(rings: Array, sides := SIDES, cx := 0.0, cz := 0.0, u_scale := 1.0) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for r in rings:
		for i in sides + 1:
			var th := TAU * float(i) / sides
			st.set_uv(Vector2(0.5 + u_scale * float(i) / sides, r[3]))
			st.add_vertex(Vector3(cx - r[1] * sin(th), r[0], cz - r[2] * cos(th)))
	var row := sides + 1
	for j in rings.size() - 1:
		for i in sides:
			var a := j * row + i
			var b := a + 1
			var c := a + row
			var d := c + 1
			st.add_index(a); st.add_index(b); st.add_index(c)
			st.add_index(b); st.add_index(d); st.add_index(c)
	st.generate_normals()
	return st.commit()


func _part(parent: Node3D, mesh: ArrayMesh, mat: Material, node_name: String) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.name = node_name
	mi.mesh = mesh
	mi.material_override = mat
	parent.add_child(mi)
	return mi


func _pivot(parent: Node3D, pos: Vector3, node_name: String) -> Node3D:
	var p := Node3D.new()
	p.name = node_name
	p.position = pos
	parent.add_child(p)
	return p


# --- Build ------------------------------------------------------------------

func _build() -> void:
	scale = Vector3.ONE * height
	_body = _pivot(self, Vector3.ZERO, "Body")
	var w := width
	var b := belly
	var skin_mat := _mat(null, skin)
	var shirt_mat := _mat(torso_texture)
	var sleeve_mat := _mat(sleeve_texture)
	var legs_mat := _mat(legs_texture)
	var shoe_mat := _mat(null, shoes)

	# Torso: neck base and rounded shoulders down to hips; belly pushes the front out.
	var torso := loft([
		[1.535, 0.07, 0.06, 0.0],
		[1.5, 0.17 * w, 0.1, 0.05],
		[1.46, 0.215 * w, 0.115, 0.12],
		[1.36, 0.21 * w, 0.125 + b * 0.3, 0.3],
		[1.22, 0.195 * w + b * 0.4, 0.12 + b, 0.56],
		[1.08, 0.185 * w + b * 0.4, 0.115 + b * 0.9, 0.8],
		[0.97, 0.178 * w + b * 0.2, 0.11 + b * 0.4, 0.95],
		[0.9, 0.172 * w, 0.105, 1.0],
	], 12, 0.0, -b * 0.25)
	_part(_body, torso, shirt_mat, "Torso")

	# Neck in plain skin, so the face photo isn't stretched down it.
	_part(_body, loft([[1.62, 0.052, 0.056, 0.0], [1.5, 0.058, 0.062, 1.0]], 8), skin_mat, "Neck")

	# Head: big and round like a GTA3 ped, photo face on the front half.
	var hv := hair_volume
	var head := Node3D.new()
	head.name = "Head"
	head.position = Vector3(0, 1.585, -0.01)
	head.scale = Vector3.ONE * 1.12
	_body.add_child(head)
	_part(head, loft([
		[0.29 + 0.02 * (hv - 1.0), 0.005, 0.005, 0.0],
		[0.275 + 0.02 * (hv - 1.0), 0.05 * hv, 0.055 * hv, 0.05],
		[0.245 + 0.012 * (hv - 1.0), 0.085 * hv, 0.092 * hv, 0.15],
		[0.2, 0.1, 0.104, 0.28],
		[0.15, 0.102, 0.106, 0.42],
		[0.1, 0.1, 0.102, 0.58],
		[0.05, 0.09, 0.094, 0.75],
		[0.01, 0.07, 0.078, 0.9],
		[-0.01, 0.05, 0.06, 1.0],
	], 14), _mat(head_texture), "Skull")

	# Arms: shoulder -> elbow -> hand, hanging just outside the shoulders.
	var sx := 0.2 * w + 0.045
	_arm_l = _pivot(_body, Vector3(-sx, 1.42, 0), "ArmL")
	_arm_r = _pivot(_body, Vector3(sx, 1.42, 0), "ArmR")
	for arm in [_arm_l, _arm_r]:
		var side := -1.0 if arm == _arm_l else 1.0
		arm.rotation.z = 0.06 * side
		_part(arm, loft([[0.05, 0.03, 0.03, 0.0], [0.025, 0.06 * w, 0.062, 0.1], [-0.12, 0.057 * w, 0.058, 0.4], [-0.3, 0.047, 0.047, 1.0]], 8), sleeve_mat, "UpperArm")
		var fore := _pivot(arm, Vector3(0, -0.29, 0), "Forearm")
		_part(fore, loft([[0.01, 0.047, 0.047, 0.0], [-0.24, 0.04, 0.038, 1.0]], 8), sleeve_mat, "Lower")
		_part(fore, loft([[-0.23, 0.032, 0.03, 0.0], [-0.27, 0.042, 0.028, 0.5], [-0.33, 0.034, 0.02, 1.0]], 8), skin_mat, "Hand")
		if arm == _arm_l:
			_fore_l = fore
		else:
			_fore_r = fore

	# Legs: hip -> knee -> shoe.
	_leg_l = _pivot(_body, Vector3(-0.09 * w, 0.93, 0), "LegL")
	_leg_r = _pivot(_body, Vector3(0.09 * w, 0.93, 0), "LegR")
	for leg in [_leg_l, _leg_r]:
		_part(leg, loft([[0.04, 0.088 * w, 0.09, 0.0], [-0.2, 0.078 * w, 0.08, 0.45], [-0.44, 0.062, 0.064, 1.0]], 8), legs_mat, "Thigh")
		var shin := _pivot(leg, Vector3(0, -0.43, 0), "Shin")
		_part(shin, loft([[0.01, 0.062, 0.064, 0.0], [-0.2, 0.055, 0.058, 0.5], [-0.42, 0.048, 0.05, 1.0]], 8), legs_mat, "Lower")
		_part(shin, loft([[-0.4, 0.05, 0.06, 0.0], [-0.45, 0.058, 0.11, 0.5], [-0.5, 0.055, 0.12, 1.0]], 8, 0.0, -0.04), shoe_mat, "Shoe")
		if leg == _leg_l:
			_shin_l = shin
		else:
			_shin_r = shin
