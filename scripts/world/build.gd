class_name Build
## Small helpers for building blockout geometry from code.


static func box(parent: Node, size: Vector3, pos: Vector3, material: Material, node_name := "Box") -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.name = node_name
	var mesh := BoxMesh.new()
	mesh.size = size
	mi.mesh = mesh
	mi.material_override = material
	mi.position = pos
	parent.add_child(mi)
	return mi


static func cylinder(parent: Node, radius: float, height: float, pos: Vector3, material: Material, top_radius := -1.0, sides := 10) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.bottom_radius = radius
	mesh.top_radius = radius if top_radius < 0.0 else top_radius
	mesh.height = height
	mesh.radial_segments = sides
	mesh.rings = 1
	mi.mesh = mesh
	mi.material_override = material
	mi.position = pos
	parent.add_child(mi)
	return mi


## A StaticBody3D with a box collider (no mesh). Returns the body.
static func collider(parent: Node, size: Vector3, pos: Vector3, node_name := "Collider") -> StaticBody3D:
	var body := StaticBody3D.new()
	body.name = node_name
	body.position = pos
	var shape := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = size
	shape.shape = bs
	body.add_child(shape)
	parent.add_child(body)
	return body


## A solid box: visible mesh plus matching collider.
static func solid(parent: Node, size: Vector3, pos: Vector3, material: Material, node_name := "Solid") -> StaticBody3D:
	var body := collider(parent, size, pos, node_name)
	box(body, size, Vector3.ZERO, material, "Mesh")
	return body


## Kerb-style step that a CharacterBody can walk up: a wedge collider rising
## from y=0 at `low_z` to `height` at `high_z`, running along X.
static func ramp_collider(parent: Node, x0: float, x1: float, low_z: float, high_z: float, height: float) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.name = "Kerb"
	var shape := CollisionShape3D.new()
	var poly := ConvexPolygonShape3D.new()
	poly.points = PackedVector3Array([
		Vector3(x0, 0, low_z), Vector3(x1, 0, low_z),
		Vector3(x0, 0, high_z), Vector3(x1, 0, high_z),
		Vector3(x0, height, high_z), Vector3(x1, height, high_z),
	])
	shape.shape = poly
	body.add_child(shape)
	parent.add_child(body)
	return body


## Extrudes a 2D profile (XY, ordered) along Z from z0 to z1 as one open
## surface with UVs: u follows the profile (arc length), v follows Z.
static func extrude_profile(profile: PackedVector2Array, z0: float, z1: float, material: Material, uv_metres := 4.0) -> MeshInstance3D:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var arc := [0.0]
	for i in range(1, profile.size()):
		arc.append(arc[i - 1] + profile[i].distance_to(profile[i - 1]))
	for i in profile.size() - 1:
		var a := profile[i]
		var b := profile[i + 1]
		var ua: float = arc[i] / uv_metres
		var ub: float = arc[i + 1] / uv_metres
		var v0 := z0 / uv_metres
		var v1 := z1 / uv_metres
		var quad := [
			[Vector3(a.x, a.y, z0), Vector2(ua, v0)], [Vector3(b.x, b.y, z0), Vector2(ub, v0)],
			[Vector3(b.x, b.y, z1), Vector2(ub, v1)], [Vector3(a.x, a.y, z0), Vector2(ua, v0)],
			[Vector3(b.x, b.y, z1), Vector2(ub, v1)], [Vector3(a.x, a.y, z1), Vector2(ua, v1)],
		]
		for q in quad:
			st.set_uv(q[1])
			st.add_vertex(q[0])
	st.generate_normals()
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = material
	return mi


## Flat polygon (XY) at depth z, triangulated. Use a double-sided material.
static func polygon_wall(points: PackedVector2Array, z: float, material: Material) -> MeshInstance3D:
	var tris := Geometry2D.triangulate_polygon(points)
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for idx in tris:
		var p := points[idx]
		st.set_normal(Vector3(0, 0, -1))
		st.add_vertex(Vector3(p.x, p.y, z))
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = material
	return mi


## Side-profile prism: polygon in (Z, Y) extruded across X from -half_w to
## +half_w, with both side caps. Used for car bodies.
static func prism(profile_zy: PackedVector2Array, half_w: float, material: Material) -> MeshInstance3D:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var n := profile_zy.size()
	for i in n:
		var a := profile_zy[i]
		var b := profile_zy[(i + 1) % n]
		var p0 := Vector3(-half_w, a.y, a.x)
		var p1 := Vector3(half_w, a.y, a.x)
		var p2 := Vector3(half_w, b.y, b.x)
		var p3 := Vector3(-half_w, b.y, b.x)
		var nrm := (p1 - p0).cross(p3 - p0).normalized()
		for p in [p0, p2, p1, p0, p3, p2]:
			st.set_normal(-nrm)
			st.add_vertex(p)
	var tris := Geometry2D.triangulate_polygon(profile_zy)
	for side in [-1.0, 1.0]:
		for t in range(0, tris.size(), 3):
			var ids := [tris[t], tris[t + 1], tris[t + 2]]
			if side < 0.0:
				ids.reverse()
			for idx in ids:
				var p := profile_zy[idx]
				st.set_normal(Vector3(side, 0, 0))
				st.add_vertex(Vector3(half_w * side, p.y, p.x))
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = material
	return mi


## Collects many boxes per material into a few merged meshes (fewer draw calls).
class Batch:
	var _tools := {}
	var _mats := {}

	func add_box(material: Material, size: Vector3, center: Vector3, basis := Basis.IDENTITY) -> void:
		var key := material.get_instance_id()
		if not _tools.has(key):
			var st := SurfaceTool.new()
			st.begin(Mesh.PRIMITIVE_TRIANGLES)
			_tools[key] = st
			_mats[key] = material
		var st: SurfaceTool = _tools[key]
		var h := size * 0.5
		var faces := [
			[Vector3(1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1)],
			[Vector3(-1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, -1)],
			[Vector3(0, 1, 0), Vector3(0, 0, 1), Vector3(1, 0, 0)],
			[Vector3(0, -1, 0), Vector3(0, 0, -1), Vector3(1, 0, 0)],
			[Vector3(0, 0, 1), Vector3(-1, 0, 0), Vector3(0, 1, 0)],
			[Vector3(0, 0, -1), Vector3(1, 0, 0), Vector3(0, 1, 0)],
		]
		for f in faces:
			var nrm: Vector3 = f[0]
			var u: Vector3 = f[1]
			var v: Vector3 = f[2]
			var c := nrm * h
			var du := u * h
			var dv := v * h
			var corners := [c - du - dv, c + du - dv, c + du + dv, c - du + dv]
			for idx in [0, 2, 1, 0, 3, 2]:
				st.set_normal(basis * nrm)
				st.add_vertex(center + basis * corners[idx])

	func commit(parent: Node, node_name := "Batch") -> void:
		for key in _tools:
			var st: SurfaceTool = _tools[key]
			var mi := MeshInstance3D.new()
			mi.name = node_name
			mi.mesh = st.commit()
			mi.material_override = _mats[key]
			parent.add_child(mi)
