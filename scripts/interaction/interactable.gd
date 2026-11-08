class_name Interactable
extends Area3D
## Something the player can press Interact on. The player's sensor finds the
## nearest one in range and shows its prompt. Lives on physics layer 4.

signal interacted

const LAYER := 1 << 3

@export var prompt := "Interact"
@export var enabled := true
## Shown (without acting) while disabled. Empty = hide the prompt when disabled.
@export var disabled_prompt := ""


func _init() -> void:
	collision_layer = LAYER
	collision_mask = 0
	monitoring = false
	monitorable = true


func current_prompt() -> String:
	return prompt if enabled else disabled_prompt


func interact() -> void:
	if enabled:
		interacted.emit()


## Adds an Interactable with a box-shaped trigger to `parent`.
static func attach(parent: Node3D, size: Vector3, prompt_text: String, offset := Vector3.ZERO) -> Interactable:
	var area := Interactable.new()
	area.name = "Interactable"
	area.prompt = prompt_text
	area.position = offset
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = size
	shape.shape = box
	area.add_child(shape)
	parent.add_child(area)
	return area
