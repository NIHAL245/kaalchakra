"""Build small, original illustrative GLB models for the Museum exhibits.

These are educational visualizations, not scans or authenticated portraits.
The script uses only Python's standard library so the assets can be regenerated
without Blender or a third-party model package.
"""

from __future__ import annotations

import json
import math
import struct
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "models" / "museum"

MATERIALS = {
    "bronze": ([0.48, 0.24, 0.10, 1], 0.72, 0.30),
    "gold": ([0.78, 0.50, 0.13, 1], 0.78, 0.25),
    "steel": ([0.43, 0.50, 0.56, 1], 0.82, 0.27),
    "dark_steel": ([0.12, 0.16, 0.20, 1], 0.68, 0.32),
    "wood": ([0.30, 0.14, 0.07, 1], 0.08, 0.66),
    "cloth": ([0.88, 0.32, 0.04, 1], 0.02, 0.78),
    "deep_cloth": ([0.36, 0.08, 0.07, 1], 0.02, 0.78),
    "ivory": ([0.81, 0.75, 0.60, 1], 0.08, 0.50),
    "stone": ([0.24, 0.20, 0.16, 1], 0.03, 0.80),
    "blue": ([0.08, 0.20, 0.36, 1], 0.05, 0.68),
    "green": ([0.12, 0.28, 0.16, 1], 0.04, 0.72),
}


class Model:
    def __init__(self) -> None:
        self.triangles = defaultdict(list)

    def face(self, material: str, a, b, c) -> None:
        self.triangles[material].append((tuple(a), tuple(b), tuple(c)))

    def turn_front_to_camera(self) -> None:
        """Rotate a Y-facing disk so its decorated side faces the viewer (+Z)."""
        self.triangles = defaultdict(list, {
            material: [tuple((x, -z, y) for x, y, z in triangle) for triangle in faces]
            for material, faces in self.triangles.items()
        })

    def box(self, material: str, center, size) -> None:
        cx, cy, cz = center
        sx, sy, sz = (value / 2 for value in size)
        p = [
            (cx - sx, cy - sy, cz - sz), (cx + sx, cy - sy, cz - sz),
            (cx + sx, cy + sy, cz - sz), (cx - sx, cy + sy, cz - sz),
            (cx - sx, cy - sy, cz + sz), (cx + sx, cy - sy, cz + sz),
            (cx + sx, cy + sy, cz + sz), (cx - sx, cy + sy, cz + sz),
        ]
        faces = [
            (0, 3, 2, 1), (4, 5, 6, 7), (0, 4, 7, 3),
            (1, 2, 6, 5), (0, 1, 5, 4), (3, 7, 6, 2),
        ]
        for q in faces:
            self.face(material, p[q[0]], p[q[1]], p[q[2]])
            self.face(material, p[q[0]], p[q[2]], p[q[3]])

    def sphere(self, material: str, center, radii, segments=16, rings=10) -> None:
        cx, cy, cz = center
        rx, ry, rz = radii
        points = []
        for row in range(rings + 1):
            phi = math.pi * row / rings
            points.append([])
            for col in range(segments):
                theta = 2 * math.pi * col / segments
                points[-1].append((
                    cx + rx * math.sin(phi) * math.cos(theta),
                    cy + ry * math.cos(phi),
                    cz + rz * math.sin(phi) * math.sin(theta),
                ))
        for row in range(rings):
            for col in range(segments):
                nxt = (col + 1) % segments
                a, b = points[row][col], points[row][nxt]
                c, d = points[row + 1][col], points[row + 1][nxt]
                self._outward_face(material, a, b, c, center)
                self._outward_face(material, b, d, c, center)

    def _outward_face(self, material, a, b, c, center) -> None:
        ab = tuple(b[i] - a[i] for i in range(3))
        ac = tuple(c[i] - a[i] for i in range(3))
        normal = (
            ab[1] * ac[2] - ab[2] * ac[1],
            ab[2] * ac[0] - ab[0] * ac[2],
            ab[0] * ac[1] - ab[1] * ac[0],
        )
        radial = tuple((a[i] + b[i] + c[i]) / 3 - center[i] for i in range(3))
        if sum(normal[i] * radial[i] for i in range(3)) < 0:
            b, c = c, b
        self.face(material, a, b, c)

    def cylinder(self, material: str, center, radius, height, segments=20, caps=True) -> None:
        cx, cy, cz = center
        lower, upper = [], []
        for i in range(segments):
            angle = 2 * math.pi * i / segments
            x, z = radius * math.cos(angle), radius * math.sin(angle)
            lower.append((cx + x, cy - height / 2, cz + z))
            upper.append((cx + x, cy + height / 2, cz + z))
        for i in range(segments):
            j = (i + 1) % segments
            self.face(material, lower[i], upper[i], upper[j])
            self.face(material, lower[i], upper[j], lower[j])
        if caps:
            bottom, top = (cx, cy - height / 2, cz), (cx, cy + height / 2, cz)
            for i in range(segments):
                j = (i + 1) % segments
                self.face(material, bottom, lower[i], lower[j])
                self.face(material, top, upper[j], upper[i])

    def prism(self, material: str, outline, depth, z_center=0) -> None:
        """Extrude a convex counter-clockwise outline in the XY plane."""
        front_z, back_z = z_center + depth / 2, z_center - depth / 2
        front = [(x, y, front_z) for x, y in outline]
        back = [(x, y, back_z) for x, y in outline]
        cx = sum(x for x, _ in outline) / len(outline)
        cy = sum(y for _, y in outline) / len(outline)
        middle = (cx, cy, front_z)
        for i in range(len(front)):
            self.face(material, middle, front[i], front[(i + 1) % len(front)])
            self.face(material, (cx, cy, back_z), back[(i + 1) % len(back)], back[i])
            a, b = front[i], front[(i + 1) % len(front)]
            c, d = back[(i + 1) % len(back)], back[i]
            mid = tuple((a[k] + b[k] + c[k] + d[k]) / 4 for k in range(3))
            edge = (b[0] - a[0], b[1] - a[1], 0)
            outward = (edge[1], -edge[0], 0)
            radial = (mid[0] - cx, mid[1] - cy, 0)
            if sum(outward[k] * radial[k] for k in range(3)) >= 0:
                self.face(material, a, b, c)
                self.face(material, a, c, d)
            else:
                self.face(material, a, c, b)
                self.face(material, a, d, c)

    def sword(self, curved=False, gauntlet=False, dagger=False) -> None:
        if dagger:
            outline = [(-.035, -.35), (.035, -.35), (.06, -.18), (.035, .05),
                       (0, .43), (-.035, .05), (-.06, -.18)]
            self.prism("steel", outline, .045)
            self.cylinder("gold", (0, -.37, 0), .10, .07)
            self.sphere("wood", (0, -.53, 0), (.075, .14, .07), 10, 6)
        elif curved:
            outline = [(-.055, -.62), (.055, -.62), (.13, -.18), (.14, .25),
                       (.10, .70), (.02, 1.12), (-.05, .78), (-.10, .35), (-.10, -.12)]
            self.prism("steel", outline, .045)
            self.box("gold", (0, -.64, 0), (.30, .055, .08))
            self.cylinder("wood", (0, -.78, 0), .065, .25, 12)
            self.sphere("gold", (0, -.93, 0), (.095, .045, .08), 12, 7)
        elif gauntlet:
            self.prism("steel", [(-.07, -.60), (.07, -.60), (.08, .60), (0, 1.12), (-.08, .60)], .045)
            self.box("gold", (0, -.61, 0), (.38, .35, .14))
            self.box("dark_steel", (0, -.45, .06), (.32, .36, .08))
            self.cylinder("wood", (0, -.79, 0), .075, .28, 12)
        else:
            self.prism("steel", [(-.11, -.60), (.11, -.60), (.12, .20), (.08, .72), (0, 1.28), (-.08, .72), (-.12, .20)], .045)
            self.box("gold", (0, -.62, 0), (.38, .06, .08))
            self.cylinder("wood", (0, -.79, 0), .065, .25, 12)
            self.sphere("gold", (0, -.94, 0), (.085, .05, .08), 12, 7)

    def coin(self, metal="gold", oblong=False) -> None:
        if oblong:
            self.cylinder(metal, (0, 0, 0), .15, .12, 8)
            self.sphere(metal, (0, .03, .16), (.10, .10, .10), 12, 7)
        else:
            self.cylinder(metal, (0, 0, 0), .44, .11, 40)
            self.cylinder("dark_steel", (0, .063, 0), .34, .012, 40)
            self.cylinder(metal, (0, .072, 0), .30, .018, 40)
            for angle in range(0, 360, 60):
                x, z = .18 * math.cos(math.radians(angle)), .18 * math.sin(math.radians(angle))
                self.sphere("ivory", (x, .091, z), (.025, .009, .025), 8, 5)
            self.box("dark_steel", (0, .092, 0), (.23, .012, .025))
            self.box("dark_steel", (0, .092, 0), (.025, .012, .23))

    def royal_bust(self, robe="deep_cloth", headwear="turban", trim="gold") -> None:
        self.cylinder("stone", (0, -.92, 0), .48, .18)
        self.cylinder(trim, (0, -.80, 0), .40, .07)
        self.prism(robe, [(-.38, -.76), (.38, -.76), (.32, -.25), (.22, .08), (-.22, .08), (-.32, -.25)], .30)
        self.box(trim, (0, -.47, .16), (.08, .46, .035))
        self.cylinder("ivory", (0, .00, 0), .12, .24, 16)
        self.sphere("ivory", (0, .34, 0), (.25, .34, .22), 18, 12)
        # A deliberately simplified, non-identifying face and beard silhouette.
        self.sphere("wood", (0, .11, .17), (.14, .13, .07), 12, 7)
        self.sphere("deep_cloth", (0, -.02, .19), (.13, .08, .07), 12, 7)
        if headwear == "crown":
            self.cylinder(trim, (0, .62, 0), .24, .10)
            self.prism(trim, [(-.20, .65), (.20, .65), (.15, .91), (0, .83), (-.15, .91)], .18)
            self.sphere("bronze", (0, .83, .11), (.045, .06, .04), 10, 6)
        elif headwear == "turban":
            self.sphere(robe, (0, .62, 0), (.29, .16, .25), 16, 9)
            self.box(trim, (0, .60, .22), (.07, .22, .035))
            self.prism(trim, [(.03, .61), (.10, .62), (.35, .88), (.27, .90)], .035, .03)
        else:
            self.sphere(robe, (0, .57, 0), (.28, .13, .25), 16, 9)
            self.sphere(trim, (.20, .65, 0), (.06, .08, .07), 10, 6)
        self.sphere(trim, (-.20, .34, .02), (.035, .06, .035), 8, 5)
        self.sphere(trim, (.20, .34, .02), (.035, .06, .035), 8, 5)

    def shield(self) -> None:
        self.cylinder("dark_steel", (0, 0, 0), .58, .12, 40)
        self.cylinder("steel", (0, .065, 0), .51, .025, 40)
        self.cylinder("bronze", (0, .09, 0), .15, .08, 24)
        for angle in range(0, 360, 90):
            x, z = .38 * math.cos(math.radians(angle)), .38 * math.sin(math.radians(angle))
            self.sphere("gold", (x, .095, z), (.07, .055, .07), 12, 7)

    def wagh_nakh(self) -> None:
        self.box("gold", (0, -.02, 0), (.50, .16, .10))
        self.box("bronze", (0, -.02, .08), (.28, .25, .08))
        for x in (-.19, -.065, .065, .19):
            self.prism("steel", [(x - .035, .04), (x + .035, .04),
                                  (x + .055, .37), (x + .02, .50),
                                  (x - .015, .34), (x - .025, .17)], .055)
        self.sphere("gold", (-.24, -.02, .03), (.085, .085, .07), 10, 6)
        self.sphere("gold", (.24, -.02, .03), (.085, .085, .07), 10, 6)

    def spear(self) -> None:
        self.cylinder("wood", (0, 0, 0), .035, 1.75, 10)
        self.prism("steel", [(-.10, .58), (.10, .58), (.075, .94), (0, 1.25), (-.075, .94)], .06)
        # The loop at the base suggests the historical tether without over-detail.
        self.cylinder("bronze", (.09, -.64, .04), .12, .035, 14)

    def helmet(self) -> None:
        self.cylinder("steel", (0, -.25, 0), .49, .10, 32)
        # Stacked rings form an open-backed, pointed steel cap.
        levels = [(-.22, .46), (-.12, .45), (.08, .39), (.26, .27), (.42, .11)]
        seg = 24
        for (y0, r0), (y1, r1) in zip(levels, levels[1:]):
            lower, upper = [], []
            for i in range(seg):
                a = math.tau * i / seg
                lower.append((r0 * math.cos(a), y0, r0 * math.sin(a)))
                upper.append((r1 * math.cos(a), y1, r1 * math.sin(a)))
            for i in range(seg):
                j = (i + 1) % seg
                self._outward_face("steel", lower[i], upper[i], upper[j], (0, -.1, 0))
                self._outward_face("steel", lower[i], upper[j], lower[j], (0, -.1, 0))
        self.box("gold", (0, .01, .45), (.055, .48, .055))
        self.box("dark_steel", (0, -.25, .48), (.20, .12, .035))

    def armor(self) -> None:
        self.prism("deep_cloth", [(-.43, -.72), (.43, -.72), (.34, .30), (.25, .52), (-.25, .52), (-.34, .30)], .34)
        self.box("steel", (0, .22, .22), (.46, .32, .10))
        self.box("steel", (-.27, -.02, .20), (.11, .42, .10))
        self.box("steel", (.27, -.02, .20), (.11, .42, .10))
        self.box("gold", (0, -.12, .25), (.48, .06, .05))
        for y in (-.52, -.35, .04):
            for x in (-.24, -.12, 0, .12, .24):
                self.sphere("bronze", (x, y, .19), (.025, .025, .018), 8, 5)

    def flag(self) -> None:
        self.cylinder("dark_steel", (-.40, .05, 0), .035, 1.85, 12)
        self.sphere("gold", (-.40, 1.02, 0), (.085, .07, .08), 12, 7)
        self.prism("cloth", [(-.34, .86), (.52, .76), (.24, .50), (.52, .22), (-.34, .32)], .035, .02)
        self.box("gold", (0, .55, .045), (.04, .12, .018))

    def seal(self) -> None:
        self.cylinder("bronze", (0, 0, 0), .48, .20, 8)
        self.cylinder("gold", (0, .11, 0), .39, .025, 8)
        self.cylinder("bronze", (0, .13, 0), .31, .022, 8)
        for i in range(8):
            angle = math.tau * i / 8
            self.sphere("gold", (.23 * math.cos(angle), .15, .23 * math.sin(angle)), (.035, .018, .035), 8, 5)
        self.box("ivory", (0, .155, 0), (.30, .018, .035))
        self.box("ivory", (0, .155, 0), (.035, .018, .30))
        self.sphere("gold", (0, .16, 0), (.07, .025, .07), 10, 6)


def glb_bytes(name: str, model: Model, caption: str) -> bytes:
    binary = bytearray()
    views, accessors, gltf_materials, primitives = [], [], [], []

    def add_chunk(data: bytes, target: int, component_type: int, kind: str,
                  count: int, minimum=None, maximum=None):
        while len(binary) % 4:
            binary.append(0)
        offset = len(binary)
        binary.extend(data)
        view_index = len(views)
        views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(data), "target": target})
        accessor = {"bufferView": view_index, "componentType": component_type, "count": count, "type": kind}
        if minimum is not None:
            accessor["min"] = minimum
            accessor["max"] = maximum
        accessors.append(accessor)
        return len(accessors) - 1

    for material_name, color_triangles in model.triangles.items():
        if not color_triangles:
            continue
        positions, normals, indices = [], [], []
        for tri in color_triangles:
            a, b, c = tri
            ab = tuple(b[i] - a[i] for i in range(3))
            ac = tuple(c[i] - a[i] for i in range(3))
            n = (
                ab[1] * ac[2] - ab[2] * ac[1],
                ab[2] * ac[0] - ab[0] * ac[2],
                ab[0] * ac[1] - ab[1] * ac[0],
            )
            length = math.sqrt(sum(value * value for value in n)) or 1
            n = tuple(value / length for value in n)
            base = len(positions) // 3
            for point in tri:
                positions.extend(point)
                normals.extend(n)
            indices.extend((base, base + 1, base + 2))
        pts = list(zip(*(iter(positions),) * 3))
        pos_bytes = struct.pack(f"<{len(positions)}f", *positions)
        norm_bytes = struct.pack(f"<{len(normals)}f", *normals)
        index_bytes = struct.pack(f"<{len(indices)}I", *indices)
        position_accessor = add_chunk(
            pos_bytes, 34962, 5126, "VEC3", len(positions) // 3,
            [min(point[i] for point in pts) for i in range(3)],
            [max(point[i] for point in pts) for i in range(3)],
        )
        normal_accessor = add_chunk(norm_bytes, 34962, 5126, "VEC3", len(normals) // 3)
        index_accessor = add_chunk(index_bytes, 34963, 5125, "SCALAR", len(indices))
        base_color, metallic, roughness = MATERIALS[material_name]
        gltf_materials.append({
            "name": material_name.replace("_", " ").title(),
            "pbrMetallicRoughness": {
                "baseColorFactor": base_color,
                "metallicFactor": metallic,
                "roughnessFactor": roughness,
            },
        })
        primitives.append({
            "attributes": {"POSITION": position_accessor, "NORMAL": normal_accessor},
            "indices": index_accessor,
            "material": len(gltf_materials) - 1,
            "mode": 4,
        })

    gltf = {
        "asset": {"version": "2.0", "generator": "KaalChakra Museum model builder",
                  "copyright": "Original illustrative educational model created for KaalChakra.",
                  "extras": {"caption": caption, "note": "Illustration, not an authenticated scan or portrait."}},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": name}],
        "meshes": [{"name": name, "primitives": primitives}],
        "materials": gltf_materials,
        "buffers": [{"byteLength": len(binary)}],
        "bufferViews": views,
        "accessors": accessors,
    }
    json_chunk = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    json_chunk += b" " * ((-len(json_chunk)) % 4)
    binary.extend(b"\0" * ((-len(binary)) % 4))
    total_length = 12 + 8 + len(json_chunk) + 8 + len(binary)
    return b"".join((
        struct.pack("<III", 0x46546C67, 2, total_length),
        struct.pack("<II", len(json_chunk), 0x4E4F534A), json_chunk,
        struct.pack("<II", len(binary), 0x004E4942), binary,
    ))


def make_models():
    models = {}
    kings = {
        "shivaji-maharaj": ("deep_cloth", "turban", "gold"),
        "sambhaji-maharaj": ("blue", "turban", "gold"),
        "rajaram-maharaj": ("green", "crown", "gold"),
        "tararani": ("deep_cloth", "bun", "bronze"),
        "shahu-maharaj": ("blue", "crown", "gold"),
    }
    for slug, style in kings.items():
        model = Model()
        model.royal_bust(*style)
        models[slug] = (model, "Symbolic royal bust")

    weapon_builders = {
        "bhavani-talwar": lambda m: m.sword(curved=True),
        "wagh-nakh": lambda m: m.wagh_nakh(),
        "dhal": lambda m: m.shield(),
        "patta": lambda m: m.sword(gauntlet=True),
        "bichwa": lambda m: m.sword(dagger=True),
        "vita": lambda m: m.spear(),
    }
    for slug, build in weapon_builders.items():
        model = Model()
        build(model)
        if slug == "dhal":
            model.turn_front_to_camera()
        models[slug] = (model, "Stylized weapon illustration")

    for slug, metal, oblong in [
        ("shivrai", "bronze", False), ("hon", "gold", False),
        ("shivrai-rupaya", "steel", False), ("larin", "steel", True),
    ]:
        model = Model()
        model.coin(metal, oblong)
        model.turn_front_to_camera()
        models[slug] = (model, "Stylized historical coin illustration")

    model = Model()
    model.seal()
    model.turn_front_to_camera()
    models["rajmudra"] = (model, "Stylized royal seal illustration")
    model = Model()
    model.armor()
    models["chilkhat"] = (model, "Stylized body armour illustration")
    model = Model()
    model.flag()
    models["bhagwa-dhwaj"] = (model, "Stylized saffron standard illustration")
    return models


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    models = make_models()
    for slug, (model, caption) in models.items():
        name = slug.replace("-", " ").title()
        path = OUTPUT / f"{slug}.glb"
        path.write_bytes(glb_bytes(name, model, caption))
        print(f"Wrote {path.relative_to(ROOT)} ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
