class_name Player
extends CharacterBody3D
## Eddy Jr.: walks relative to the camera, turns to face the direction of
## travel, and interacts with the nearest Interactable in range.

@export var walk_speed := 3.5
@export var sprint_speed := 6.0
@export var acceleration := 12.0
@export var turn_speed := 10.0
## The camera rig whose yaw defines "forward". Optional; falls back to world -Z.
@export var camera_rig_path: NodePath
## Optional CharacterModel to animate.
@export var model_path: NodePath
@export var interact_radius := 1.7

var _camera_rig: Node3D
var _model: CharacterModel
var _sensor: Area3D
var _focus: Interactable
var _last_prompt := ""


func _ready() -> void:
	if not camera_rig_path.is_empty():
		_camera_rig = get_node_or_null(camera_rig_path) as Node3D
	if not model_path.is_empty():
		_model = get_node_or_null(model_path) as CharacterModel
	_sensor = Area3D.new()
	_sensor.name = "InteractSensor"
	_sensor.collision_layer = 0
	_sensor.collision_mask = Interactable.LAYER
	var shape := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = interact_radius
	shape.shape = sphere
	shape.position = Vector3(0, 1.0, 0)
	_sensor.add_child(shape)
	add_child(_sensor)


func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity += get_gravity() * delta

	var input := Vector2.ZERO
	if not Game.ui_locked:
		input = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction := Vector3(input.x, 0.0, input.y)
	if _camera_rig:
		direction = direction.rotated(Vector3.UP, _camera_rig.global_rotation.y)

	var speed := sprint_speed if Input.is_action_pressed("sprint") else walk_speed
	var target := direction * speed
	velocity.x = move_toward(velocity.x, target.x, acceleration * delta)
	velocity.z = move_toward(velocity.z, target.z, acceleration * delta)

	if direction.length_squared() > 0.01:
		var target_yaw := atan2(-direction.x, -direction.z)
		rotation.y = lerp_angle(rotation.y, target_yaw, turn_speed * delta)

	move_and_slide()
	if _model:
		_model.move_amount = Vector2(velocity.x, velocity.z).length() / walk_speed
	_update_focus()


## Picks the nearest Interactable that has something to say, and shows its prompt.
func _update_focus() -> void:
	var best: Interactable = null
	var best_d := INF
	for area in _sensor.get_overlapping_areas():
		var it := area as Interactable
		if it == null or it.current_prompt() == "":
			continue
		var d := global_position.distance_squared_to(it.global_position)
		if d < best_d:
			best_d = d
			best = it
	_focus = best
	var text := "" if (best == null or Game.ui_locked) else best.current_prompt()
	if text != _last_prompt:
		_last_prompt = text
		Game.set_prompt(text)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("interact") and not Game.ui_locked and _focus and _focus.enabled:
		get_viewport().set_input_as_handled()
		_focus.interact()
		_last_prompt = "<refresh>"  # force a prompt refresh next frame
