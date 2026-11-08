extends CanvasLayer
## On-screen HUD in a GTA3 spirit: money counter top right, objective top
## left, interact prompt, subtitle-style dialogue box and short toasts.
## Also owns the PC screen overlay.

var money_label: Label
var objective_label: Label
var prompt_label: Label
var toast_label: Label
var dialogue_panel: PanelContainer
var speaker_label: Label
var line_label: Label
var pc_screen: Control

var _toast_tween: Tween


func _ready() -> void:
	layer = 10
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)

	money_label = _label(root, 34, Color(0.42, 0.74, 0.32))
	place(money_label, 1, 0, -320, 18, 300, 40)
	money_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT

	objective_label = _label(root, 20, Color(0.95, 0.92, 0.82))
	objective_label.position = Vector2(22, 20)
	objective_label.size = Vector2(700, 30)

	var help := _label(root, 14, Color(0.85, 0.85, 0.85, 0.8))
	help.text = "WASD move   Shift sprint   E interact   Mouse / arrow keys turn camera"
	help.position = Vector2(22, 52)
	help.size = Vector2(700, 20)

	prompt_label = _label(root, 22, Color(1.0, 0.86, 0.3))
	place(prompt_label, 0.5, 1, -400, -230, 800, 30)
	prompt_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER

	toast_label = _label(root, 24, Color(0.95, 0.95, 0.95))
	place(toast_label, 0.5, 0, -400, 90, 800, 34)
	toast_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_label.modulate.a = 0.0

	dialogue_panel = PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0, 0, 0, 0.62)
	style.set_content_margin_all(16)
	style.set_corner_radius_all(4)
	dialogue_panel.add_theme_stylebox_override("panel", style)
	place(dialogue_panel, 0.5, 1, -430, -190, 860, 150)
	var vb := VBoxContainer.new()
	dialogue_panel.add_child(vb)
	speaker_label = _label(vb, 20, Color(1.0, 0.82, 0.25))
	line_label = _label(vb, 22, Color(1, 1, 1))
	line_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	line_label.custom_minimum_size = Vector2(820, 0)
	var hint := _label(vb, 14, Color(0.8, 0.8, 0.8))
	hint.text = "[E] continue"
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	dialogue_panel.visible = false
	root.add_child(dialogue_panel)

	pc_screen = preload("res://scripts/ui/pc_screen.gd").new()
	pc_screen.name = "PCScreen"
	pc_screen.visible = false
	add_child(pc_screen)

	Game.money_changed.connect(_on_money)
	Game.objective_changed.connect(func(t): objective_label.text = t)
	Game.prompt_changed.connect(func(t): prompt_label.text = ("[E] " + t) if t != "" else "")
	Game.toast.connect(show_toast)
	Game.dialogue_line.connect(_on_line)
	Game.dialogue_finished.connect(func(): dialogue_panel.visible = false)
	_on_money(Game.money)
	objective_label.text = Game.objective_text()


func _label(parent: Node, size: int, color: Color) -> Label:
	var l := Label.new()
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	l.add_theme_constant_override("outline_size", maxi(4, size / 4))
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(l)
	return l


func _on_money(amount: int) -> void:
	money_label.text = "W%08d" % amount


func _on_line(speaker: String, text: String) -> void:
	speaker_label.text = speaker
	line_label.text = text
	dialogue_panel.visible = true
	prompt_label.text = ""


func show_toast(text: String) -> void:
	toast_label.text = text
	if _toast_tween:
		_toast_tween.kill()
	toast_label.modulate.a = 1.0
	_toast_tween = create_tween()
	_toast_tween.tween_interval(2.2)
	_toast_tween.tween_property(toast_label, "modulate:a", 0.0, 0.6)


func open_pc() -> void:
	pc_screen.open()


func _unhandled_input(event: InputEvent) -> void:
	if Game.in_dialogue() and (event.is_action_pressed("interact") or event.is_action_pressed("ui_accept")):
		get_viewport().set_input_as_handled()
		Game.advance_dialogue()


static func place(c: Control, ax: float, ay: float, x: float, y: float, w: float, h: float) -> void:
	c.anchor_left = ax
	c.anchor_right = ax
	c.anchor_top = ay
	c.anchor_bottom = ay
	c.offset_left = x
	c.offset_top = y
	c.offset_right = x + w
	c.offset_bottom = y + h
