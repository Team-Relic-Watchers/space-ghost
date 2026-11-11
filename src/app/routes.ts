export const ROUTES = {
  /** The home page: the title, the two ways in and the four features. */
  home: '/',
  /** The campaign map: all 17 machines, each one clickable. */
  ghostsMap: '/ghosts',
  /** One machine's star quiz, opened from its story page. */
  ghostQuiz: '/ghosts/:sequence/quiz',
  /** The puzzle corner: any machine's cartoon, rebuilt piece by piece. */
  puzzle: '/puzzle',
  warp: '/warp',
  ranger7: '/ranger-7',
  /** Deep link to the 3D exploration scene on its own (also reachable as a stop). */
  ranger7Showcase: '/ranger-7/scene',
} as const
