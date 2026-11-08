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


## Extrudes a 2D profile (XY, ordered left to right) along Z from z0 to z1 as a
## single open surface. Good for arched roofs. Use a double-sided material.
static func extrude_profile(profile: PackedVector2Array, z0: float, z1: float, material: Material) -> MeshInstance3D:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in profile.size() - 1:
		var a := profile[i]
		var b := profile[i + 1]
		var p0 := Vector3(a.x, a.y, z0)
		var p1 := Vector3(b.x, b.y, z0)
		var p2 := Vector3(b.x, b.y, z1)
		var p3 := Vector3(a.x, a.y, z1)
		for p in [p0, p1, p2, p0, p2, p3]:
			st.add_vertex(p)
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
		st.add_vertex(Vector3(p.x, p.y, z))
	st.generate_normals()
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = material
	return mi
