extends Control
## The old "Kaasdows 95" PC. For Stage 1 it runs one program, Kaasplaats,
## where Eddy Jr. sells the junk he hauled out of the warehouse.

const GREY := Color(0.75, 0.75, 0.75)
const DARK := Color(0.5, 0.5, 0.5)
const NAVY := Color(0.0, 0.0, 0.5)
const TEAL := Color(0.0, 0.5, 0.5)

var _list: VBoxContainer
var _status: Label
var _sell_all: Button
var _clock: Label


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	# Dim the game behind the "monitor".
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.75)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(dim)
	# Beige CRT bezel.
	var bezel := Panel.new()
	bezel.add_theme_stylebox_override("panel", _box(Color(0.86, 0.82, 0.7), Color(0.6, 0.57, 0.48), 3, 18))
	bezel.anchor_left = 0.5
	bezel.anchor_right = 0.5
	bezel.anchor_top = 0.5
	bezel.anchor_bottom = 0.5
	bezel.offset_left = -470
	bezel.offset_top = -330
	bezel.offset_right = 470
	bezel.offset_bottom = 330
	add_child(bezel)
	var screen := ColorRect.new()
	screen.color = TEAL
	screen.position = Vector2(40, 36)
	screen.size = Vector2(860, 560)
	screen.clip_contents = true
	bezel.add_child(screen)
	var brand := Label.new()
	brand.text = "KAASTRON 486"
	brand.add_theme_color_override("font_color", Color(0.45, 0.42, 0.35))
	brand.add_theme_font_size_override("font_size", 14)
	brand.position = Vector2(40, 610)
	bezel.add_child(brand)

	# Desktop icons.
	for i in 2:
		var icon := Label.new()
		icon.text = ["[#]\nMy Computer", "[W]\nKaasplaats"][i]
		icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		icon.add_theme_color_override("font_color", Color.WHITE)
		icon.add_theme_font_size_override("font_size", 13)
		icon.position = Vector2(14, 14 + i * 76)
		icon.size = Vector2(90, 60)
		screen.add_child(icon)

	# Taskbar.
	var bar := Panel.new()
	bar.add_theme_stylebox_override("panel", _box(GREY, Color.WHITE, 2))
	bar.position = Vector2(0, 528)
	bar.size = Vector2(860, 32)
	screen.add_child(bar)
	var start := Button.new()
	start.text = "Start"
	start.position = Vector2(4, 3)
	start.size = Vector2(70, 26)
	_style_button(start)
	bar.add_child(start)
	_clock = Label.new()
	_clock.text = "4:20 PM"
	_clock.add_theme_color_override("font_color", Color.BLACK)
	_clock.position = Vector2(780, 6)
	bar.add_child(_clock)

	# Kaasplaats window.
	var win := Panel.new()
	win.add_theme_stylebox_override("panel", _box(GREY, DARK, 2))
	win.position = Vector2(140, 40)
	win.size = Vector2(620, 460)
	screen.add_child(win)
	var title := ColorRect.new()
	title.color = NAVY
	title.position = Vector2(3, 3)
	title.size = Vector2(614, 26)
	win.add_child(title)
	var tl := Label.new()
	tl.text = "Kaasplaats.kl - Sell your old stuff!"
	tl.add_theme_color_override("font_color", Color.WHITE)
	tl.position = Vector2(8, 2)
	title.add_child(tl)
	var close := Button.new()
	close.text = "X"
	close.position = Vector2(588, 3)
	close.size = Vector2(22, 20)
	_style_button(close)
	close.pressed.connect(close_pc)
	title.add_child(close)

	var body := VBoxContainer.new()
	body.position = Vector2(14, 38)
	body.size = Vector2(592, 410)
	body.add_theme_constant_override("separation", 6)
	win.add_child(body)
	var head := _text("Your listings. Buyers are waiting. Probably.", 15)
	body.add_child(head)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(592, 290)
	var well := PanelContainer.new()
	well.add_theme_stylebox_override("panel", _box(Color.WHITE, DARK, 2, 0, 6))
	well.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(well)
	_list = VBoxContainer.new()
	_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	well.add_child(_list)
	body.add_child(scroll)
	var row := HBoxContainer.new()
	_sell_all = Button.new()
	_sell_all.text = "Sell everything"
	_style_button(_sell_all)
	_sell_all.pressed.connect(func(): Game.sell_all(); _refresh())
	row.add_child(_sell_all)
	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(spacer)
	var shutdown := Button.new()
	shutdown.text = "Shut down"
	_style_button(shutdown)
	shutdown.pressed.connect(close_pc)
	row.add_child(shutdown)
	body.add_child(row)
	_status = _text("", 14)
	_status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_status.custom_minimum_size = Vector2(590, 0)
	body.add_child(_status)


func _box(bg: Color, border: Color, border_w := 2, radius := 0, margin := 0) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.set_border_width_all(border_w)
	s.set_corner_radius_all(radius)
	s.set_content_margin_all(margin)
	return s


func _style_button(b: Button) -> void:
	b.add_theme_stylebox_override("normal", _box(GREY, Color(0.25, 0.25, 0.25), 2, 0, 4))
	b.add_theme_stylebox_override("hover", _box(Color(0.82, 0.82, 0.82), Color(0.25, 0.25, 0.25), 2, 0, 4))
	b.add_theme_stylebox_override("pressed", _box(DARK, Color(0.1, 0.1, 0.1), 2, 0, 4))
	b.add_theme_color_override("font_color", Color.BLACK)
	b.add_theme_color_override("font_hover_color", Color.BLACK)
	b.add_theme_color_override("font_pressed_color", Color.BLACK)


func _text(t: String, size: int) -> Label:
	var l := Label.new()
	l.text = t
	l.add_theme_color_override("font_color", Color.BLACK)
	l.add_theme_font_size_override("font_size", size)
	return l


func open() -> void:
	visible = true
	Game.ui_locked = true
	Game.set_prompt("")
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	_refresh()


func close_pc() -> void:
	visible = false
	Game.ui_locked = false


func _refresh() -> void:
	for c in _list.get_children():
		c.queue_free()
	for i in Game.hauled.size():
		var item: Dictionary = Game.hauled[i]
		var row := HBoxContainer.new()
		var name_l := _text(item.name, 15)
		name_l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(name_l)
		row.add_child(_text("%d W" % item.price, 15))
		var b := Button.new()
		b.text = "Sell"
		_style_button(b)
		b.pressed.connect(_sell_item.bind(i))
		row.add_child(b)
		_list.add_child(row)
	_sell_all.disabled = Game.hauled.is_empty()
	if Game.hauled.is_empty():
		_list.add_child(_text("Nothing left to sell.", 15))
		_status.text = "Sold! You now have %d Wilders. Next up: buying spices (coming in the next build)." % Game.money if Game.money > 0 else "Haul junk out of the warehouse to list it here."
	else:
		var total := 0
		for item in Game.hauled:
			total += item.price
		_status.text = "%d items listed, worth %d Wilders." % [Game.hauled.size(), total]


func _sell_item(index: int) -> void:
	Game.sell(index)
	_refresh()


func _unhandled_input(event: InputEvent) -> void:
	if visible and event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		close_pc()
