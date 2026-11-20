#!/bin/sh
# Renders the app's maskable icon and push badge from the SVGs beside them
# (librsvg). Astro does not rasterize SVG, so the PNGs are committed.
cd "$(dirname "$0")" &&
  rsvg-convert -w 512 -h 512 maskable.svg -o maskable-512.png &&
  rsvg-convert -w 96 -h 96 badge.svg -o badge-96.png
