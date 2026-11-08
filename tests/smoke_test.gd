extends SceneTree
## Headless smoke test. Run from the project root:
##   godot --headless --fixed-fps 60 --script res://tests/smoke_test.gd
## Exits 0 on success, 1 on any failure. Keep it fast; it runs on every MR.

const MAIN_SCENE := "res://scenes/main.tscn"
const REQUIRED_ACTIONS := [
	"move_left", "move_right", "move_forward", "move_back",
	"sprint", "camera_left", "camera_right",
]
const SETTLE_FRAMES := 90

var _failures: PackedStringArray = []
var _main: Node
var _frames := 0


func _initialize() -> void:
	for action in REQUIRED_ACTIONS:
		if not InputMap.has_action(action):
			_failures.append("missing input action: %s" % action)

	var packed := load(MAIN_SCENE) as PackedScene
	if packed == null:
		_finish("could not load %s" % MAIN_SCENE)
		return
	_main = packed.instantiate()
	root.add_child(_main)


func _process(_delta: float) -> bool:
	if _main == null:
		return false
	_frames += 1
	if _frames < SETTLE_FRAMES:
		return false

	var player := _main.get_node_or_null("Player") as CharacterBody3D
	if player == null:
		_failures.append("Player node missing")
	else:
		var script := player.get_script() as Script
		if script == null or not script.can_instantiate():
			_failures.append("Player script failed to compile")
		if not player.is_on_floor():
			_failures.append("Player did not land on the floor (y=%.2f)" % player.global_position.y)

	var rig := _main.get_node_or_null("CameraRig") as Node3D
	if rig == null or rig.get_script() == null or not (rig.get_script() as Script).can_instantiate():
		_failures.append("CameraRig missing or its script failed to compile")
	else:
		var camera := rig.get_node_or_null("Camera3D") as Camera3D
		if camera == null or not camera.current:
			_failures.append("CameraRig camera is not the current camera")
		elif player and camera.global_position.y <= player.global_position.y + 1.8:
			_failures.append("camera is not above the player's head")

	_finish("")
	return true


func _finish(extra: String) -> void:
	if extra != "":
		_failures.append(extra)
	if _failures.is_empty():
		print("SMOKE TEST PASSED")
		quit(0)
	else:
		for f in _failures:
			printerr("SMOKE TEST FAILURE: ", f)
		quit(1)
