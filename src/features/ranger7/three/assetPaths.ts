export const GLB = {
  moon: '/3d-assets/moon_small.glb',
  ranger7: '/3d-assets/ranger-7/ranger-7.glb',
} as const

export const TERRAIN = {
  json: '/3d-assets/ranger-7-terrain/ranger7-terrain.json',
  height: '/3d-assets/ranger-7-terrain/ranger7-height.png',
  albedo: '/3d-assets/ranger-7-terrain/ranger7-albedo.png',
  lighting: '/3d-assets/ranger-7-terrain/ranger7-lighting.png',
} as const

export const PHOTO = (id: string) => `/images/ranger-7/ra7_${id}.jpg`
