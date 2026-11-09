import { describe, expect, it } from 'vitest'
import { machines } from './machines'
import { ghostPhotos } from './photos'

describe('the machine photographs', () => {
  it('gives every machine a real photograph in its own folder', () => {
    for (const machine of machines) {
      const photos = ghostPhotos[machine.slug]
      expect(photos, machine.slug).toBeDefined()
      expect(photos.hero.src).toMatch(
        new RegExp(`^/images/ghosts/${machine.slug}/real\\.(jpg|jpeg|webp)$`),
      )
      expect(photos.hero.title.en).toBeTruthy()
      expect(photos.hero.title.bn).toBeTruthy()
      expect(photos.cartoon.src).toBe(`/images/ghosts/${machine.slug}/cartoon.jpg`)
      expect(photos.cartoon.title.en).toBeTruthy()
      expect(photos.cartoon.title.bn).toBeTruthy()
    }
  })

  it('gives every machine a technical illustration except Viking 1', () => {
    for (const machine of machines) {
      const photos = ghostPhotos[machine.slug]
      if (machine.slug === 'viking-1') {
        expect(photos.design).toBeUndefined()
      } else {
        expect(photos.design, machine.slug).toBeDefined()
        expect(photos.design?.fit).toBe('contain')
      }
    }
  })

  it('gives every machine an image it took itself', () => {
    for (const machine of machines) {
      const photos = ghostPhotos[machine.slug]
      expect(photos.discovery, machine.slug).toBeDefined()
      expect(photos.discovery?.src).toContain(`/images/ghosts/${machine.slug}/`)
    }
  })

  it('keeps every Apollo 15 rover photograph together for its detail-page gallery', () => {
    const roverPhotos = ghostPhotos['apollo-15-lunar-roving-vehicle']

    expect(roverPhotos).toBeDefined()
    expect([
      roverPhotos.hero.src,
      roverPhotos.cartoon.src,
      roverPhotos.design?.src,
      roverPhotos.discovery?.src,
    ]).toEqual([
      '/images/ghosts/apollo-15-lunar-roving-vehicle/real.jpg',
      '/images/ghosts/apollo-15-lunar-roving-vehicle/cartoon.jpg',
      '/images/ghosts/apollo-15-lunar-roving-vehicle/technical.png',
      '/images/ghosts/apollo-15-lunar-roving-vehicle/taken.jpeg',
    ])
  })
})
