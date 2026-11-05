"""A working map prototype: MapLibre (5.x UMD here; the Astro build bundles 6.x ESM) + a Protomaps extract of TP.HCM, styled with
the ShopNexus tokens, with price pins, clusters and a 3 km radius.

    python3 tools/build_map_proto.py          (run from .superdesign/)
    bun prototypes/map/serve.ts               then open http://localhost:4610

The extract comes from the Protomaps daily build:
    tmp/bin/pmtiles extract https://build.protomaps.com/<date>.pmtiles \
        prototypes/map/hcm.pmtiles --bbox=106.58,10.70,106.86,10.92 --maxzoom=15
"""
import json
import os
import random

from build import a
from build_c import header
from common import LISTINGS, head, icon, img, split_price


def price_value(price):
    num, unit = split_price(price)
    return round(float(num.replace(',', '.')) * 1e6) if 'tr' in unit else int(num.replace('.', ''))

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "prototypes", "map", "index.html")

# Approximate areas (lng, lat). A listing never shows its exact spot: its point
# is snapped to a ~550 m grid before it leaves the server.
AREAS = [("Bình Thạnh", 106.709, 10.806), ("Q.1", 106.700, 10.776), ("Q.3", 106.684, 10.783), ("Phú Nhuận", 106.680, 10.800),
         ("Gò Vấp", 106.668, 10.835), ("Tân Bình", 106.652, 10.801), ("Thủ Đức", 106.756, 10.820), ("Q.2 cũ", 106.738, 10.787),
         ("Q.7", 106.722, 10.738), ("Q.10", 106.667, 10.773)]


def snap(v, step=0.005):
    return round(round(v / step) * step, 6)


def features():
    random.seed(7)
    out = []
    for i in range(44):
        photo, price, title, cond, *_rest = LISTINGS[i % len(LISTINGS)]
        name, lng, lat = AREAS[i % len(AREAS)]
        p = [snap(lng + random.uniform(-0.012, 0.012)), snap(lat + random.uniform(-0.01, 0.01))]
        out_price = price_value(price)
        short = (f"{out_price / 1e6:.1f}".rstrip("0").rstrip(".").replace(".", ",") + " tr") if out_price >= 1e6 else f"{out_price // 1000} k"
        out.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": p},
                    "properties": {"id": i, "title": title, "price": price, "short": short, "cond": cond, "area": name, "photo": img(photo, 160, 160)}})
    return {"type": "FeatureCollection", "features": out}


FLAVOR = {
    # Tokens: surface #F7FAF8, surfaceContainer #EBEFED, high #E6E9E7, highest #E0E3E1,
    # secondaryContainer #C7E6E0, mint #97E7DB, outlineVariant #BEC9C6, onSurfaceVariant #3E4947.
    "background": "#F7FAF8", "earth": "#F1F4F2", "park_a": "#C7E6E0", "park_b": "#C7E6E0", "wood_a": "#C7E6E0", "wood_b": "#C7E6E0",
    "scrub_a": "#D6EDE8", "scrub_b": "#D6EDE8", "water": "#AEDDD6", "pedestrian": "#EBEFED", "hospital": "#EBEFED", "school": "#EBEFED",
    "industrial": "#EBEFED", "aerodrome": "#E6E9E7", "runway": "#E0E3E1", "zoo": "#C7E6E0", "military": "#EBEFED", "sand": "#EFEDE4", "beach": "#EFEDE4",
    "buildings": "#E0E3E1", "pier": "#E0E3E1",
    "minor_service": "#FFFFFF", "minor_a": "#FFFFFF", "minor_b": "#FFFFFF", "other": "#FFFFFF", "link": "#FFFFFF", "major": "#FFFFFF", "highway": "#FFFFFF",
    "minor_service_casing": "#E0E3E1", "minor_casing": "#D9DEDC", "link_casing": "#D3D9D7", "major_casing_late": "#C6CECB", "major_casing_early": "#C6CECB",
    "highway_casing_late": "#BEC9C6", "highway_casing_early": "#BEC9C6", "railway": "#BEC9C6", "boundaries": "#889390",
    "roads_label_minor": "#6E7977", "roads_label_minor_halo": "#FFFFFF", "roads_label_major": "#3E4947", "roads_label_major_halo": "#FFFFFF",
    "subplace_label": "#47645F", "subplace_label_halo": "#F7FAF8", "city_label": "#181C1C", "city_label_halo": "#F7FAF8",
    "address_label": "#889390", "address_label_halo": "#FFFFFF", "ocean_label": "#47645F",
}

CSS = """
  html, body { height: 100%; }
  .maplibregl-ctrl-attrib { font-family: "Be Vietnam Pro", sans-serif; font-size: 11px; }
  .pin { transform: translate(-50%, -100%); cursor: pointer; }
  .pin span { display: block; white-space: nowrap; border-radius: 9999px; padding: 6px 12px; font: 500 14px/20px "Be Vietnam Pro";
    background: var(--md-surface-container-lowest); color: var(--md-on-surface); box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 4px 8px 3px rgba(0,0,0,.15); }
  .pin.on span { background: var(--md-primary); color: var(--md-on-primary); }
  .pin i { display: block; width: 8px; height: 8px; margin: -4px auto 0; transform: rotate(45deg); background: inherit; }
  .pin span + i { background: var(--md-surface-container-lowest); } .pin.on span + i { background: var(--md-primary); }
  .cluster { display: grid; place-items: center; border-radius: 9999px; cursor: pointer; font: 500 14px "Be Vietnam Pro";
    background: var(--md-secondary-container); color: var(--md-on-secondary-container); border: 3px solid var(--md-surface-container-lowest);
    box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 4px 8px 3px rgba(0,0,0,.15); }
  .me { width: 18px; height: 18px; border-radius: 9999px; background: var(--md-primary); border: 3px solid #fff; box-shadow: 0 0 0 10px rgb(0 80 73 / .18); }
"""


def build():
    data = json.dumps(features(), ensure_ascii=False)
    flavor = json.dumps(FLAVOR)
    body = f"""<body>
<div class="flex h-screen flex-col bg-surface font-sans text-on-surface">
  {header(quick="always").replace('text-on-surface-variant">Bản đồ', 'bg-secondary-container text-on-secondary-container">Bản đồ', 1).replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1)}
  <main class="mx-auto mt-4 grid w-full max-w-[1328px] grid-cols-[1fr_380px] grid-rows-[minmax(0,1fr)] gap-4 px-6 pb-6" style="height: calc(100vh - 100px)">
    <div class="relative overflow-hidden rounded-xl">
      <div id="map" class="h-full w-full"></div>
      <div class="absolute left-4 top-4 flex gap-2">
        {"".join(f'<button type="button" data-r="{r}" class="radius state h-10 rounded-full px-4 text-label-l shadow-float {"bg-primary text-on-primary" if r == 3 else "bg-surface-container-lowest text-on-surface"}">{r} km</button>' for r in (1, 3, 5, 10))}
      </div>
      <p class="absolute bottom-3 left-4 rounded-full bg-surface-container-lowest/90 px-3 py-1.5 text-label-m text-on-surface-variant">{icon("shield-person-outline-rounded", 14, "inline-block align-[-3px]")} Vị trí người bán được làm tròn khoảng 500 m</p>
    </div>
    <aside class="flex min-h-0 flex-col rounded-xl bg-surface-container-low p-5">
      <div class="flex items-baseline justify-between"><h1 class="text-title-l"><span id="count">0</span> món trong khung</h1><span class="text-body-s text-on-surface-variant">kéo để xem thêm</span></div>
      <ul id="list" class="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1"></ul>
    </aside>
  </main>
</div>
<script src="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js"></script>
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css">
<script src="https://unpkg.com/pmtiles@4.5.0/dist/pmtiles.js"></script>
<script src="https://unpkg.com/@protomaps/basemaps@5.7.2/dist/basemaps.js"></script>
<script>
const DATA = {data};
const FLAVOR = {{ ...basemaps.namedFlavor("white"), ...{flavor} }};
const ME = [106.705, 10.795];

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({{
  container: "map",
  center: ME, zoom: 13.2, minZoom: 11, maxZoom: 18,
  maxBounds: [[106.55, 10.66], [106.90, 10.96]],
  attributionControl: {{ compact: false }},
  style: {{
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{{fontstack}}/{{range}}.pbf",
    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
    sources: {{
      protomaps: {{ type: "vector", url: "pmtiles://" + location.origin + "/hcm.pmtiles",
        attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>' }},
      listings: {{ type: "geojson", data: DATA, cluster: true, clusterRadius: 56, clusterMaxZoom: 14 }},
      radius: {{ type: "geojson", data: circle(ME, 3) }},
    }},
    layers: [
      ...basemaps.layers("protomaps", FLAVOR, {{ lang: "vi" }}).filter(l => !l.id.startsWith("pois")),
      {{ id: "radius-fill", type: "fill", source: "radius", paint: {{ "fill-color": "#005049", "fill-opacity": 0.06 }} }},
      {{ id: "radius-line", type: "line", source: "radius", paint: {{ "line-color": "#005049", "line-width": 2, "line-dasharray": [2, 2] }} }},
      {{ id: "listings-hit", type: "circle", source: "listings", paint: {{ "circle-radius": 1, "circle-opacity": 0 }} }},
    ],
  }},
}});
map.addControl(new maplibregl.NavigationControl({{ showCompass: false }}), "bottom-right");

function circle([lng, lat], km, n = 96) {{
  const pts = [];
  for (let i = 0; i <= n; i++) {{
    const t = (i / n) * 2 * Math.PI;
    pts.push([lng + (km / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.cos(t), lat + (km / 110.57) * Math.sin(t)]);
  }}
  return {{ type: "Feature", geometry: {{ type: "Polygon", coordinates: [pts] }} }};
}}

new maplibregl.Marker({{ element: Object.assign(document.createElement("div"), {{ className: "me" }}) }}).setLngLat(ME).addTo(map);

let markers = {{}}, selected = 0;
function render() {{
  const next = {{}};
  for (const f of map.querySourceFeatures("listings")) {{
    const p = f.properties, cl = p.cluster;
    const key = cl ? "c" + p.cluster_id : "p" + p.id;
    if (next[key]) continue;
    let m = markers[key];
    if (!m) {{
      const el = document.createElement("div");
      if (cl) {{
        const size = 36 + Math.min(24, Math.sqrt(p.point_count) * 5);
        el.className = "cluster"; el.style.width = el.style.height = size + "px"; el.textContent = p.point_count;
        el.onclick = () => map.getSource("listings").getClusterExpansionZoom(p.cluster_id).then(z => map.easeTo({{ center: f.geometry.coordinates, zoom: z }}));
      }} else {{
        el.className = "pin" + (p.id === selected ? " on" : ""); el.innerHTML = "<span>" + p.short + "</span><i></i>";
        el.onclick = () => {{ selected = p.id; Object.values(markers).forEach(x => x.remove()); markers = {{}}; render(); list(); }};
      }}
      m = new maplibregl.Marker({{ element: el, anchor: cl ? "center" : "bottom" }}).setLngLat(f.geometry.coordinates);
    }}
    next[key] = m;
    if (!markers[key]) m.addTo(map);
  }}
  for (const k in markers) if (!next[k]) markers[k].remove();
  markers = next;
}}

function list() {{
  const b = map.getBounds();
  const items = DATA.features.filter(f => b.contains(f.geometry.coordinates));
  document.getElementById("count").textContent = items.length;
  document.getElementById("list").innerHTML = items.slice(0, 40).map(f => {{
    const p = f.properties;
    return `<li class="flex items-center gap-3 rounded-lg p-2 ${{p.id === selected ? "bg-secondary-container" : ""}}">
      <img src="${{p.photo}}" alt="" class="h-14 w-14 rounded-md object-cover">
      <div class="min-w-0 flex-1"><p class="text-title-m">${{p.price}}</p><p class="truncate text-body-m">${{p.title}}</p>
      <p class="text-body-s text-on-surface-variant">${{p.cond}} · ${{p.area}}</p></div></li>`;
  }}).join("");
}}

map.on("load", () => {{ render(); list(); }});
map.on("data", e => {{ if (e.sourceId === "listings" && e.isSourceLoaded) render(); }});
map.on("move", render);
map.on("moveend", list);
document.querySelectorAll(".radius").forEach(btn => btn.onclick = () => {{
  document.querySelectorAll(".radius").forEach(b => b.className = b.className.replace("bg-primary text-on-primary", "bg-surface-container-lowest text-on-surface"));
  btn.className = btn.className.replace("bg-surface-container-lowest text-on-surface", "bg-primary text-on-primary");
  map.getSource("radius").setData(circle(ME, +btn.dataset.r));
}});
</script>
</body>
</html>"""
    return head("Bản đồ · thử MapLibre", CSS) + body


if __name__ == "__main__":
    with open(OUT, "w") as f:
        f.write(build())
    print("wrote", OUT)
