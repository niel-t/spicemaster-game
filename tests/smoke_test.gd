extends SceneTree
## Headless smoke test. Run from the project root:
##   godot --headless --path . --fixed-fps 60 --script res://tests/smoke_test.gd
## Plays through Stage 1 without input: intro dialogue, shutter opens, walk
## inside (roof hides), haul out all junk, PC unlocks, sell everything.
## Exits 0 on success, 1 on any failure.

const STAGE_SCENE := "res://scenes/stage1.tscn"
const REQUIRED_ACTIONS := [
	"move_left", "move_right", "move_forward", "move_back",
	"sprint", "camera_left", "camera_right", "interact",
]

var _failures: PackedStringArray = []


func _initialize() -> void:
	# Watchdog: if a script fails to load the test would otherwise hang CI.
	create_timer(120.0).timeout.connect(func(): _finish("timed out after 120 s"))
	_run()


func _check(ok: bool, message: String) -> void:
	if not ok:
		_failures.append(message)


func _frames(n: int) -> void:
	for i in n:
		await process_frame


func _run() -> void:
	for action in REQUIRED_ACTIONS:
		_check(InputMap.has_action(action), "missing input action: %s" % action)

	var packed := load(STAGE_SCENE) as PackedScene
	if packed == null:
		_finish("could not load %s" % STAGE_SCENE)
		return
	var stage := packed.instantiate()
	root.add_child(stage)
	var game: Node = root.get_node("Game")
	await _frames(90)

	var player := stage.get_node_or_null("Player") as CharacterBody3D
	_check(player != null and (player.get_script() as Script).can_instantiate(), "Player missing or script failed")
	if player == null:
		_finish("")
		return
	_check(player.is_on_floor(), "Player did not land (y=%.2f)" % player.global_position.y)
	var camera := stage.get_node("CameraRig/Camera3D") as Camera3D
	_check(camera.current, "camera is not current")
	_check(camera.global_position.y > player.global_position.y + 1.8, "camera is not above Eddy's head")

	# 1. Intro dialogue starts on its own and runs to the end.
	_check(game.in_dialogue(), "intro dialogue did not start")
	_check(game.ui_locked, "UI should be locked during dialogue")
	var guard := 0
	while game.in_dialogue() and guard < 50:
		game.advance_dialogue()
		guard += 1
	_check(game.stage == game.Stage.CLEAR_WAREHOUSE, "stage did not advance after talking to Dad")
	_check(stage.shutter.collision_layer == 0, "shutter still blocks the door")
	_check(not stage.pc_interactable.enabled, "PC should be locked before the warehouse is cleared")

	# 2. Walk inside: the roof hides so the camera can see in.
	player.global_position = Vector3(0, 0.4, 22.0)
	await _frames(20)
	_check(stage.player_inside, "player not detected inside the warehouse")
	_check(stage.is_roof_hidden(), "roof still visible with the player inside")

	# 3. Haul out every piece of junk.
	var total: int = game.junk_total
	_check(total >= 6, "expected at least 6 junk items, got %d" % total)
	var expected_money := 0
	for it in stage.junk_items.duplicate():
		expected_money += int(it.get_meta("price"))
		it.interact()
	await _frames(40)
	_check(game.junk_cleared == total, "cleared %d of %d junk items" % [game.junk_cleared, total])
	_check(game.stage == game.Stage.USE_PC, "stage did not advance to USE_PC")
	_check(stage.pc_interactable.enabled, "PC did not unlock after clearing")

	# 4. Use the PC and sell everything.
	stage.pc_interactable.interact()
	await _frames(2)
	var pc := stage.hud.pc_screen as Control
	_check(pc.visible, "PC screen did not open")
	game.sell_all()
	_check(game.money == expected_money, "money %d != expected %d" % [game.money, expected_money])
	_check(game.stage == game.Stage.SOLD_JUNK, "stage did not advance after selling")
	pc.close_pc()
	_check(not game.ui_locked, "UI still locked after closing the PC")

	# 5. Walk back out: roof comes back.
	player.global_position = Vector3(0, 0.4, 6.0)
	await _frames(20)
	_check(not stage.is_roof_hidden(), "roof did not come back outside")
	_finish("")


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
