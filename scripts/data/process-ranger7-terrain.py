#!/usr/bin/env python3
"""Turns the NASA Moon Trek exports into web textures for the Ranger 7 impact-site scene.

Inputs (run build-ranger7-terrain.sh first):
  public/3d-assets/ranger-7-terrain/ranger7-height.tif  LOLA LDEM 256 ppd, float32 metres
  public/3d-assets/ranger-7-terrain/ranger7-wac.tif     LRO WAC mosaic 303 ppd, 8-bit grayscale

Outputs:
  ranger7-height.png  16-bit grayscale elevation (LOLA)
  ranger7-albedo.png  8-bit colour albedo derived from the WAC mosaic
  ranger7-lighting.png 8-bit hillshade lit from the real Sun position on 31 July 1964
  ranger7-terrain.json provenance + calibration constants (lat/lon box, elevation range)

The WAC mosaic was imaged under constant illumination, so it is used as an albedo
map. A hillshade computed from the LOLA DEM with the Sun where it actually stood
when Ranger 7 arrived (sub-solar point 21.7 N, 71.7 W for 13:25 UT) is baked in.
"""

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
TERRAIN = ROOT / "public" / "3d-assets" / "ranger-7-terrain"

# Where the Sun was on the Moon on 31 July 1964 at 13:25 UT, computed with the
# standard lunar Mean Sun (Meeus, Astronomical Algorithms): sub-solar point
# latitude ~21.68 N (the Sun passed the Moon's equator on 31 July 1964) and
# longitude 71.71 W, with libration in longitude about -3.9 deg.
SUN_LAT = 21.68
SUN_LON = -71.71

# Public library constants (km) for the lunar mean radius.
MOON_RADIUS_KM = 1737.4


def load(path: Path) -> np.ndarray:
    return np.array(Image.open(path))


def local_normal(height: np.ndarray, dx_m: float, dy_m: float) -> np.ndarray:
    """Surface normal in (east, north, up) where rows run south -> north."""
    dz_dy, dz_dx = np.gradient(height, dy_m, dx_m)
    n = np.stack([-dz_dx, -dz_dy, np.ones_like(height)], axis=-1)
    return n / np.linalg.norm(n, axis=-1, keepdims=True)


def main() -> None:
    height = load(TERRAIN / "ranger7-height.tif").astype(np.float32)
    wac = load(TERRAIN / "ranger7-wac.tif").astype(np.float32) / 255.0

    rows, cols = height.shape
    assert wac.shape == height.shape, "height and WAC exports must match"

    meta_path = TERRAIN / "ranger7-terrain.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    width_km = float(meta["widthKm"])
    dx_m = dy_m = width_km * 1000.0 / cols

    low, high = float(height.min()), float(height.max())
    meters = high - low

    # Unit surface normal; the Sun direction is (east, north, up).
    normal = local_normal(height, dx_m, dy_m)
    sun = np.array(
        [
            np.cos(np.radians(SUN_LAT)) * np.sin(np.radians(SUN_LON)),
            np.sin(np.radians(SUN_LAT)),
            np.cos(np.radians(SUN_LAT)) * np.cos(np.radians(SUN_LON)),
        ]
    )
    shade = np.clip((normal * sun).sum(axis=-1), 0.0, 1.0)

    # Flat ground is lit at cos(angle between Sun and zenith); rescale so the
    # average mare brightness matches the WAC image.
    flat = float(np.clip(sun[2], 0.05, 1.0))
    lighting = np.clip(shade / flat, 0.0, 1.6) * 0.62

    # Albedo: WAC brightness normalised around its median, gently tinted warm-grey.
    albedo_base = np.clip(0.55 + (wac - np.median(wac)) * 0.9, 0.35, 0.95)
    tint = np.array([1.06, 1.0, 0.94])
    albedo = np.stack([albedo_base] * 3, axis=-1) * tint
    albedo = np.clip(albedo, 0.0, 1.0)

    texel = np.round((height - low) / max(meters, 1e-6) * 65535.0).astype(np.int32)
    texel = np.clip(texel, 0, 65535)

    # 8-bit low/high bytes, in separate R and G channels, stay exact through
    # every browser's canvas pipeline (unlike 16-bit grayscale PNGs).
    hi_byte = (texel >> 8).astype(np.uint8)
    lo_byte = (texel & 0xFF).astype(np.uint8)
    Image.fromarray(np.dstack([hi_byte, lo_byte, np.zeros_like(lo_byte)]), mode="RGB").save(
        TERRAIN / "ranger7-height.png"
    )
    Image.fromarray((albedo * 255).astype(np.uint8), mode="RGB").save(
        TERRAIN / "ranger7-albedo.png"
    )
    Image.fromarray((np.clip(lighting, 0, 1) * 255).astype(np.uint8), mode="L").save(
        TERRAIN / "ranger7-lighting.png"
    )

    meta.update(
        {
            "height": {
                "minM": round(low, 2),
                "maxM": round(high, 2),
                "rangeM": round(meters, 2),
                "metersPerPixel": round(dx_m, 2),
                "source": "LOLA DEM 256 ppd (NASA Moon Trek: LRO_LOLA_DEM_Global_256ppd_v06)",
                "note": "LOLA elevations are relative to a mean lunar radius of 1737.4 km.",
            },
            "albedo": {
                "source": "LRO WAC global mosaic 303 ppd (NASA Moon Trek: LRO_WAC_Mosaic_Global_303ppd_v02)",
                "note": "Colour tint added for readability; crater detail is from the original mosaic.",
            },
            "sun": {
                "subSolarLat": SUN_LAT,
                "subSolarLon": SUN_LON,
                "note": "Direction of illumination baked into ranger7-lighting.png.",
            },
        }
    )
    meta_path.write_text(json.dumps(meta, indent=2) + "\n")
    print(
        f"wrote textures: elevation {low:.1f}..{high:.1f} m ({meters:.1f} m relief), "
        f"{dx_m:.1f} m/pixel"
    )


if __name__ == "__main__":
    main()
