class_name CameraRig
extends Node3D
## High third-person follow camera. The framing target is the "PS3" reference:
## the camera sits behind and well above the character, looking down so the
## character stands in the lower-middle of the frame with the world spread out
## ahead. Tune distance/height/pitch in the inspector rather than in code.

@export var target_path: NodePath
@export var distance := 5.0          ## Horizontal distance behind the target (m).
@export var height := 3.8            ## Camera height above the target's feet (m).
@export var look_height := 0.9       ## Point on the target the camera aims at (m).
@export var follow_smoothing := 8.0  ## Higher = snappier follow.
@export var yaw_speed := 2.2         ## Keyboard/stick orbit speed (rad/s).
@export var mouse_sensitivity := 0.004

@onready var camera: Camera3D = $Camera3D

var _target: Node3D
var _yaw := 0.0


func _ready() -> void:
	_target = get_node_or_null(target_path) as Node3D
	_yaw = rotation.y
	camera.current = true
	if _target:
		global_position = _target.global_position
	_place_camera()


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		_yaw -= event.relative.x * mouse_sensitivity
	elif event is InputEventMouseButton and event.pressed:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	elif event.is_action_pressed("ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _process(delta: float) -> void:
	_yaw -= Input.get_axis("camera_left", "camera_right") * yaw_speed * delta
	rotation.y = _yaw
	if _target:
		var weight := 1.0 - exp(-follow_smoothing * delta)
		global_position = global_position.lerp(_target.global_position, weight)
	_place_camera()


func _place_camera() -> void:
	camera.position = Vector3(0.0, height, distance)
	camera.look_at(global_position + Vector3.UP * look_height, Vector3.UP)
