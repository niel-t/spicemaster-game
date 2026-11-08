class_name Player
extends CharacterBody3D
## Placeholder Eddy Jr. controller: walks relative to the camera and turns to
## face the direction of travel. Swap the capsule mesh for the real character
## model under assets/characters/ when it exists.

@export var walk_speed := 3.5
@export var sprint_speed := 6.0
@export var acceleration := 12.0
@export var turn_speed := 10.0
## The camera rig whose yaw defines "forward". Optional; falls back to world -Z.
@export var camera_rig_path: NodePath

var _camera_rig: Node3D


func _ready() -> void:
	if not camera_rig_path.is_empty():
		_camera_rig = get_node_or_null(camera_rig_path) as Node3D


func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity += get_gravity() * delta

	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
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
