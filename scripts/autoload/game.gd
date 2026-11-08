extends Node
## Global state for the current run (autoload name: Game).
## Owns the Stage 1 quest flow, money, dialogue queue and the "UI is open" lock.

signal money_changed(amount: int)
signal objective_changed(text: String)
signal prompt_changed(text: String)
signal toast(text: String)
signal stage_changed(stage: Stage)
signal junk_changed(cleared: int, total: int)
signal dialogue_line(speaker: String, text: String)
signal dialogue_finished

enum Stage { MEET_DAD, CLEAR_WAREHOUSE, USE_PC, SOLD_JUNK }

var money := 0
var stage: Stage = Stage.MEET_DAD
var junk_total := 0
var junk_cleared := 0
## Junk hauled out of the warehouse, waiting to be sold on the PC: {"name": String, "price": int}
var hauled: Array[Dictionary] = []
## True while dialogue or the PC is open; the player and camera ignore input.
var ui_locked := false

var _lines: Array = []
var _line_index := -1
var _on_dialogue_done := Callable()


func reset() -> void:
	money = 0
	stage = Stage.MEET_DAD
	junk_total = 0
	junk_cleared = 0
	hauled.clear()
	ui_locked = false
	_lines = []
	_line_index = -1
	money_changed.emit(money)
	objective_changed.emit(objective_text())


func set_stage(new_stage: Stage) -> void:
	stage = new_stage
	stage_changed.emit(stage)
	objective_changed.emit(objective_text())


func objective_text() -> String:
	match stage:
		Stage.MEET_DAD:
			return "Talk to Eddy Sr."
		Stage.CLEAR_WAREHOUSE:
			return "Clear out Dad's old shoarma junk (%d/%d)" % [junk_cleared, junk_total]
		Stage.USE_PC:
			return "Sell the junk on the old PC"
		Stage.SOLD_JUNK:
			return "Buy your first spices (coming in the next build)"
	return ""


func add_money(amount: int) -> void:
	money += amount
	money_changed.emit(money)


func set_prompt(text: String) -> void:
	prompt_changed.emit(text)


# --- Junk -------------------------------------------------------------------

func register_junk() -> void:
	junk_total += 1
	junk_changed.emit(junk_cleared, junk_total)
	objective_changed.emit(objective_text())


func clear_junk(item_name: String, price: int) -> void:
	hauled.append({"name": item_name, "price": price})
	junk_cleared += 1
	junk_changed.emit(junk_cleared, junk_total)
	toast.emit("Hauled out: %s" % item_name)
	if junk_cleared >= junk_total and stage == Stage.CLEAR_WAREHOUSE:
		set_stage(Stage.USE_PC)
		toast.emit("Warehouse cleared! Now sell it all on the PC.")
	else:
		objective_changed.emit(objective_text())


func sell(index: int) -> int:
	if index < 0 or index >= hauled.size():
		return 0
	var item: Dictionary = hauled[index]
	hauled.remove_at(index)
	add_money(item.price)
	if hauled.is_empty() and stage == Stage.USE_PC:
		set_stage(Stage.SOLD_JUNK)
	return item.price


func sell_all() -> int:
	var total := 0
	while not hauled.is_empty():
		total += sell(0)
	return total


# --- Dialogue ---------------------------------------------------------------

## lines: Array of [speaker, text] pairs. on_done runs after the last line.
func start_dialogue(lines: Array, on_done := Callable()) -> void:
	if lines.is_empty():
		return
	_lines = lines
	_line_index = -1
	_on_dialogue_done = on_done
	ui_locked = true
	set_prompt("")
	advance_dialogue()


func in_dialogue() -> bool:
	return _line_index >= 0 and _line_index < _lines.size()


func advance_dialogue() -> void:
	_line_index += 1
	if _line_index < _lines.size():
		var line: Array = _lines[_line_index]
		dialogue_line.emit(line[0], line[1])
		return
	_lines = []
	_line_index = -1
	ui_locked = false
	dialogue_finished.emit()
	if _on_dialogue_done.is_valid():
		var done := _on_dialogue_done
		_on_dialogue_done = Callable()
		done.call()
