"""Generate the direction-C illustrations with gpt-image-2.5 on the user's proxy.

    python3 tools/gen_art.py [name ...]      (run from .superdesign/)

Each call goes through /v1/images/edits with the app's own mascot drawings as
references, so the character stays the one in app/core/designsystem. Output:
../art/<name>.png (kept in the repo's .superdesign/art/).
"""
import base64
import concurrent.futures as cf
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(ROOT, "tmp", "art")
OUT = os.path.join(ROOT, "art")
URL = "http://khoakomlem-internal.ddns.net:8317/v1/images/edits"
KEY = open(os.path.expanduser("~/.config/cliproxyapi-remote.key")).read().strip()

STYLE = (
    "Flat vector illustration in exactly the style of the reference drawings: simple geometric shapes, one slightly darker "
    "tone for shadow sides, no outlines, no gradients, no texture, no noise. Palette only: deep teal #066A61 and #005049, "
    "mint #97E7DB and #C7E6E0, off-white #F7FAF8, slate #3E4947, terracotta #95482A, peach #FFCDBC, cardboard brown. "
    "The mascot is the same character as in the references: an off-white shopping bag with soft rounded corners, a thick "
    "teal handle, a pill-shaped dark slate screen for a face with light-teal arc eyes, a small smile and peach cheeks, "
    "teal arms and stubby teal legs. No text, no letters, no numbers, no logos anywhere."
)

JOBS = {
    "hero-street": dict(
        size="1536x1024", background="opaque", refs=["art_deal.png", "art_cod_ready.png"],
        prompt=STYLE + " Scene: a sunny residential street in Bình Thạnh, Saigon. A row of narrow Vietnamese tube houses with "
        "small balconies, potted plants and shutters, a leafy tree, two parked motorbikes. On the sidewalk, neighbours' "
        "second-hand things set out for sale: a bicycle, a mustard armchair, an acoustic guitar, a desk lamp, a rice "
        "cooker, a small stack of books. The mascot walks along the sidewalk waving, carrying a small cardboard box. "
        "Composition: buildings and action fill the right 60 percent and the bottom; the upper-left 40 percent is calm, "
        "empty, very pale mint sky (#E3F2EF) left clear for a headline. Wide 3:2 frame, edges bleed off the canvas."),
    "door-check": dict(
        size="1024x1024", background="transparent", refs=["art_search.png", "art_received.png"],
        prompt=STYLE + " The mascot stands beside an open cardboard delivery box, holding a smartphone up in one hand and "
        "looking at it closely through a magnifying glass in the other, curious and careful. A small teal checkmark "
        "sparkle floats near the phone. Full body, centred, generous empty margin, transparent background."),
    "map-guide": dict(
        size="1024x1024", background="transparent", refs=["art_deal.png", "art_search.png"],
        prompt=STYLE + " The mascot holds open a large folded paper map in mint and off-white with a few teal roads, and "
        "points ahead cheerfully with its other arm. A terracotta location pin floats above its head. Full body, centred, "
        "generous empty margin, transparent background."),
    "boxes-wave": dict(
        size="1024x1024", background="transparent", refs=["art_cod_ready.png", "art_deal.png"],
        prompt=STYLE + " The mascot sits on top of a neat stack of three cardboard parcels, waving with one arm and holding "
        "a teal smartphone in the other, relaxed and happy. Full body, centred, generous empty margin, transparent "
        "background."),
}


def run(name):
    job = JOBS[name]
    cmd = ["curl", "-s", "-m", "600", URL, "-H", f"Authorization: Bearer {KEY}",
           "-F", "model=gpt-image-2.5", "-F", f"prompt={job['prompt']}", "-F", f"size={job['size']}",
           "-F", "quality=high", "-F", f"background={job['background']}", "-F", "n=1"]
    for r in job["refs"]:
        cmd += ["-F", f"image[]=@{os.path.join(REF, r)}"]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    try:
        data = json.loads(out)["data"][0]["b64_json"]
    except Exception:
        return name, "failed: " + out[:300]
    path = os.path.join(OUT, f"{name}.png")
    with open(path, "wb") as f:
        f.write(base64.b64decode(data))
    return name, path


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    names = sys.argv[1:] or list(JOBS)
    with cf.ThreadPoolExecutor(len(names)) as pool:
        for name, result in pool.map(run, names):
            print(name, result, flush=True)
