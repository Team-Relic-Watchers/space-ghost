#!/usr/bin/env bash
# Rebuilds the Ranger 7 impact-site terrain textures from NASA Moon Trek (LOLA DEM + LRO WAC).
# Source services: https://trek.nasa.gov/moon/  (NASA/JPL, public domain)
#
# The tile is centred on the centre of Ranger 7 frame A199 (10.60 S, 20.69 W),
# the last camera-A image before impact. It spans 23.8 km (~0.785 deg) — about the
# width of that frame — and the impact point (10.70 S, 20.612 W, IAU 2015) is
# marked in src/content/ranger7/impactSite.ts.
set -euo pipefail
OUT="$(cd "$(dirname "$0")/../.." && pwd)/public/3d-assets/ranger-7-terrain"
mkdir -p "$OUT"

SIZE=512
# Seleneographic box: east<west because the site is west longitude.
DEM_BBOX="-20.5345,-11.3875,-20.8430,-9.8125"
SAME_BBOX="-19.8425,-11.3875,-20.8430,-9.8125"

curl -sL --max-time 120 \
  "https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_Global_256ppd_v06/ImageServer/exportImage?bbox=${DEM_BBOX}&bboxSR=4326&imageSR=4326&size=${SIZE},${SIZE}&format=tiff&pixelType=F32&f=image" \
  -o "$OUT/ranger7-height.tif"

curl -sL --max-time 120 \
  "https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_Global_303ppd_v02/ImageServer/exportImage?bbox=${SAME_BBOX}&bboxSR=4326&imageSR=4326&size=${SIZE},${SIZE}&format=tiff&pixelType=U8&f=image" \
  -o "$OUT/ranger7-wac.tif"

echo "fetched height + WAC tiles into $OUT"
