class_name CharacterModel
extends Node3D
## Blocky GTA3-style person built from boxes. The look is set by the exported
## fields, so Eddy Jr., Eddy Sr. and future NPCs share one script. Swap for a
## real .glb under assets/characters/ when the art exists.

enum Hair { CURLY, BALDING_WHITE, SHORT }

@export var skin := Color(0.87, 0.68, 0.55)
@export var shirt := Color(0.62, 0.74, 0.9)
@export var pants := Color(0.2, 0.24, 0.32)
@export var shoes := Color(0.12, 0.1, 0.09)
@export var hair_color := Color(0.12, 0.09, 0.07)
@export var hair: Hair = Hair.SHORT
@export var glasses := false
@export var open_collar := false      ## Open shirt collar (Eddy Jr.)
@export var collar_trim := false      ## Red/white sweater collar stripes (Eddy Sr.)
@export var width := 1.0              ## Body width multiplier (stocky > 1)
@export var height := 1.0             ## Overall height multiplier

## Set by the owner each frame: 0 = standing, 1 = walking, 2 = running.
var move_amount := 0.0

var _arm_l: Node3D
var _arm_r: Node3D
var _leg_l: Node3D
var _leg_r: Node3D
var _body: Node3D
var _t := 0.0


func _ready() -> void:
	_build()


func _process(delta: float) -> void:
	_t += delta * (4.0 + move_amount * 4.0)
	var swing := sin(_t) * 0.5 * clampf(move_amount, 0.0, 1.6)
	_arm_l.rotation.x = swing
	_arm_r.rotation.x = -swing
	_leg_l.rotation.x = -swing
	_leg_r.rotation.x = swing
	# Idle breathing / walking bob.
	_body.position.y = absf(sin(_t)) * 0.04 * move_amount + sin(_t * 0.5) * 0.008


func _mat(c: Color) -> StandardMaterial3D:
	return Tex.flat(c, 0.9)


func _limb(pivot_pos: Vector3, size: Vector3, color: Color, end_color := Color(), end_h := 0.0) -> Node3D:
	var pivot := Node3D.new()
	pivot.position = pivot_pos
	_body.add_child(pivot)
	Build.box(pivot, size, Vector3(0, -size.y * 0.5, 0), _mat(color))
	if end_h > 0.0:
		Build.box(pivot, Vector3(size.x * 1.02, end_h, size.z * 1.1), Vector3(0, -size.y - end_h * 0.5, 0), _mat(end_color))
	return pivot


func _build() -> void:
	scale = Vector3(1, height, 1)
	_body = Node3D.new()
	_body.name = "Body"
	add_child(_body)
	var w := width
	# Legs (hip pivot at 0.92 m), shoes at the bottom.
	_leg_l = _limb(Vector3(-0.12 * w, 0.92, 0), Vector3(0.17 * w, 0.84, 0.2), pants, shoes, 0.08)
	_leg_r = _limb(Vector3(0.12 * w, 0.92, 0), Vector3(0.17 * w, 0.84, 0.2), pants, shoes, 0.08)
	# Torso.
	Build.box(_body, Vector3(0.48 * w, 0.62, 0.28 * w), Vector3(0, 1.22, 0), _mat(shirt), "Torso")
	Build.box(_body, Vector3(0.5 * w, 0.1, 0.3 * w), Vector3(0, 0.94, 0), _mat(pants), "Belt")
	if open_collar:
		# Open collar showing a V of skin and chest hair.
		Build.box(_body, Vector3(0.14, 0.2, 0.02), Vector3(0, 1.43, -0.141 * w), _mat(skin.darkened(0.1)))
		Build.box(_body, Vector3(0.1, 0.12, 0.02), Vector3(0, 1.4, -0.152 * w), _mat(Color(0.22, 0.16, 0.12)))
		Build.box(_body, Vector3(0.11, 0.06, 0.05), Vector3(-0.1, 1.52, -0.13 * w), _mat(shirt.lightened(0.15)))
		Build.box(_body, Vector3(0.11, 0.06, 0.05), Vector3(0.1, 1.52, -0.13 * w), _mat(shirt.lightened(0.15)))
	if collar_trim:
		Build.box(_body, Vector3(0.3, 0.035, 0.29 * w), Vector3(0, 1.5, 0), _mat(Color(0.75, 0.12, 0.12)))
		Build.box(_body, Vector3(0.26, 0.03, 0.291 * w), Vector3(0, 1.465, 0), _mat(Color(0.92, 0.9, 0.86)))
	# Arms (shoulder pivots), hands in skin colour.
	_arm_l = _limb(Vector3(-0.3 * w, 1.5, 0), Vector3(0.13, 0.56, 0.15), shirt, skin, 0.1)
	_arm_r = _limb(Vector3(0.3 * w, 1.5, 0), Vector3(0.13, 0.56, 0.15), shirt, skin, 0.1)
	# Neck and head.
	Build.box(_body, Vector3(0.12, 0.08, 0.12), Vector3(0, 1.57, 0), _mat(skin), "Neck")
	var head := Node3D.new()
	head.name = "Head"
	head.position = Vector3(0, 1.73, 0)
	_body.add_child(head)
	Build.box(head, Vector3(0.26, 0.28, 0.26), Vector3.ZERO, _mat(skin), "Skull")
	Build.box(head, Vector3(0.05, 0.07, 0.05), Vector3(0, -0.02, -0.15), _mat(skin.darkened(0.05)), "Nose")
	# Eyes and a grin (front is -Z).
	for x in [-0.06, 0.06]:
		Build.box(head, Vector3(0.04, 0.03, 0.01), Vector3(x, 0.03, -0.131), _mat(Color(0.08, 0.06, 0.05)))
	Build.box(head, Vector3(0.11, 0.025, 0.01), Vector3(0, -0.08, -0.131), _mat(Color(0.95, 0.93, 0.9)), "Grin")
	Build.box(head, Vector3(0.03, 0.06, 0.05), Vector3(-0.14, 0, 0), _mat(skin), "EarL")
	Build.box(head, Vector3(0.03, 0.06, 0.05), Vector3(0.14, 0, 0), _mat(skin), "EarR")
	if glasses:
		var g := _mat(Color(0.05, 0.05, 0.05))
		for x in [-0.065, 0.065]:
			Build.box(head, Vector3(0.09, 0.012, 0.012), Vector3(x, 0.06, -0.138), g)
			Build.box(head, Vector3(0.09, 0.012, 0.012), Vector3(x, 0.005, -0.138), g)
			Build.box(head, Vector3(0.012, 0.055, 0.012), Vector3(x - 0.045, 0.033, -0.138), g)
			Build.box(head, Vector3(0.012, 0.055, 0.012), Vector3(x + 0.045, 0.033, -0.138), g)
		Build.box(head, Vector3(0.012, 0.012, 0.26), Vector3(-0.135, 0.05, 0), g)
		Build.box(head, Vector3(0.012, 0.012, 0.26), Vector3(0.135, 0.05, 0), g)
	var hm := _mat(hair_color)
	match hair:
		Hair.CURLY:
			# A messy mop of curls on top and at the sides.
			var rng := RandomNumberGenerator.new()
			rng.seed = 7
			for i in 22:
				var p := Vector3(rng.randf_range(-0.13, 0.13), rng.randf_range(0.12, 0.2), rng.randf_range(-0.1, 0.14))
				var s := rng.randf_range(0.07, 0.1)
				Build.box(head, Vector3(s, s, s), p, hm)
			Build.box(head, Vector3(0.28, 0.08, 0.2), Vector3(0, 0.12, 0.04), hm)
			Build.box(head, Vector3(0.04, 0.12, 0.18), Vector3(-0.135, 0.06, 0.05), hm)
			Build.box(head, Vector3(0.04, 0.12, 0.18), Vector3(0.135, 0.06, 0.05), hm)
		Hair.BALDING_WHITE:
			# Bald crown, white tufts at the sides and back, bushy brows.
			Build.box(head, Vector3(0.05, 0.13, 0.2), Vector3(-0.135, 0.04, 0.04), hm)
			Build.box(head, Vector3(0.05, 0.13, 0.2), Vector3(0.135, 0.04, 0.04), hm)
			Build.box(head, Vector3(0.27, 0.15, 0.05), Vector3(0, 0.04, 0.13), hm)
			Build.box(head, Vector3(0.2, 0.04, 0.1), Vector3(0, 0.145, -0.06), hm)
			for x in [-0.065, 0.065]:
				Build.box(head, Vector3(0.07, 0.02, 0.02), Vector3(x, 0.065, -0.135), hm)
		Hair.SHORT:
			Build.box(head, Vector3(0.28, 0.07, 0.28), Vector3(0, 0.14, 0.01), hm)
