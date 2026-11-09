import { z } from 'zod'
import { keyFacts } from './hotspots'

/**
 * Ranger 7 photographs used in the game. All five are NASA/JPL images from the
 * NSSDCA image catalog; files are local JPEG copies of the NSSDCA hires GIFs.
 * Wording of the captions follows the NSSDCA image captions.
 */
export const photographSchema = z.object({
  id: z.enum(['b001', 'a100', 'b200', 'a199']),
  src: z.string().min(1),
  /** What the image shows. */
  titleKey: z.string(),
  /** Caption detail (frame channel, distance). */
  metaKey: z.string(),
  /** NASA publication data carried with the image for credits. */
  credit: z.string(),
  sourceUrl: z.string().url(),
  width: z.number(),
  height: z.number(),
})

export type Photograph = z.infer<typeof photographSchema>

export const photographs: Photograph[] = z.array(photographSchema).parse([
  {
    id: 'b001',
    src: '/images/ranger-7/ra7_b001.jpg',
    titleKey: 'b001',
    metaKey: 'b001',
    credit: 'NASA/JPL — Ranger 7, frame B001',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/ra7_b001.html',
    width: 720,
    height: 707,
  },
  {
    id: 'a100',
    src: '/images/ranger-7/ra7_a100.jpg',
    titleKey: 'a100',
    metaKey: 'a100',
    credit: 'NASA/JPL — Ranger 7, frame A100',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/ra7_a100.html',
    width: 681,
    height: 720,
  },
  {
    id: 'b200',
    src: '/images/ranger-7/ra7_b200.jpg',
    titleKey: 'b200',
    metaKey: 'b200',
    credit: 'NASA/JPL — Ranger 7, frame B200',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/ra7_b200.html',
    width: 720,
    height: 652,
  },
  {
    id: 'a199',
    src: '/images/ranger-7/ra7_a199.jpg',
    titleKey: 'a199',
    metaKey: 'a199',
    credit: 'NASA/JPL — Ranger 7, frame A199 (last camera-A image before impact)',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/ra7_a199.html',
    width: 720,
    height: 712,
  },
])

/** The large frame shown for the "first look" step (frame A001, 17.2 min before impact). */
export const firstPhotograph = {
  src: '/images/ranger-7/ra7_a001.jpg',
  credit: 'NASA/JPL — Ranger 7, frame A001 (first picture of the Moon by a U.S. spacecraft)',
  sourceUrl: 'https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/ra7_a001.html',
  width: 676,
  height: 720,
}

/**
 * The short challenge. Questions stick to facts the player has just been shown.
 * The correct index is data, never rendered.
 */
/** The final transmitted frame, revealed after impact. */
export const finalImage = {
  src: '/images/ranger-7/ra7_a199.jpg',
  credit: 'NASA/JPL — Ranger 7, frame A199 (last A-camera image before impact)',
  sourceUrl: 'https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/ra7_a199.html',
}

/** Every NASA image used in the game, for the credits line. */
export const photoCredits = [
  { label: 'A001', credit: firstPhotograph.credit },
  ...photographs.map((p) => ({ label: p.id.toUpperCase(), credit: p.credit })),
].filter((c) => c.label !== 'A199')

export const quizSchema = z.object({
  id: z.enum(['cameras', 'images', 'distance', 'finalImage', 'location']),
  choices: z.array(z.enum(['a', 'b', 'c'])).length(3),
  correct: z.enum(['a', 'b', 'c']),
})

export type QuizQuestion = z.infer<typeof quizSchema>

export const quiz: QuizQuestion[] = z.array(quizSchema).parse([
  { id: 'cameras', choices: ['a', 'b', 'c'], correct: 'b' },
  { id: 'images', choices: ['a', 'b', 'c'], correct: 'c' },
  { id: 'distance', choices: ['a', 'b', 'c'], correct: 'a' },
  { id: 'finalImage', choices: ['a', 'b', 'c'], correct: 'b' },
])

export const challengeFacts = keyFacts
