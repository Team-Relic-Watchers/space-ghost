import type { Bilingual } from '../storyBible'

/**
 * The real photographs and diagrams that accompany each machine.
 *
 * They are the NASA archive images copied into `public/images/ghosts`, grouped
 * by the machine's file name stem. Each set keeps the same three jobs:
 *
 * - `hero`    the machine's real photograph, shown in its ring and at the top
 *             of its story page;
 * - `design`  the technical illustration, used in the Design & Technology part
 *             and behind the robot's voice card;
 * - `discovery` the picture the machine itself took, shown beside the
 *             Discovery part.
 *
 * Viking 1 is the one mission in the archive without a technical illustration,
 * so its set has only two entries. Everything else is optional at the type
 * level too, which keeps the story page honest when an image is missing.
 */

export const GHOST_PHOTO_DIR = '/images/ghosts'

export type PhotoFit = 'cover' | 'contain'

export interface GhostPhoto {
  /** Public URL of the image. */
  src: string
  /** A short title shown below the picture. */
  title: Bilingual
  /** The archive the picture came from. */
  credit: string
  /** How the image should fill its frame. Diagrams use `contain`. */
  fit?: PhotoFit
}

export interface GhostPhotoSet {
  hero: GhostPhoto
  cartoon: GhostPhoto
  design?: GhostPhoto
  discovery?: GhostPhoto
}

const image = (slug: string, file: string): string => `${GHOST_PHOTO_DIR}/${slug}/${file}`

const cartoon = (slug: string, title: Bilingual): GhostPhoto => ({
  src: image(slug, 'cartoon.jpg'),
  title,
  credit: 'Space Ghosts',
})

/** Every machine's photographs, keyed by the machine's URL-safe slug. */
export const ghostPhotos: Record<string, GhostPhotoSet> = {
  'ranger-7': {
    hero: {
      src: image('ranger-7', 'real.jpg'),
      title: { en: 'Ranger 7 at JPL', bn: 'জেপিএলে রেঞ্জার ৭' },
      credit: 'NASA / JPL',
    },
    cartoon: cartoon('ranger-7', { en: 'Ranger 7 cartoon', bn: 'রেঞ্জার ৭-এর কার্টুন ছবি' }),
    design: {
      src: image('ranger-7', 'technical.gif'),
      title: { en: "Ranger 7's flight plan", bn: 'রেঞ্জার ৭-এর উড়ান-পরিকল্পনা' },
      credit: 'NASA',
      fit: 'contain',
    },
    discovery: {
      src: image('ranger-7', 'taken.jpg'),
      title: { en: 'The first close-up of the Moon', bn: 'চাঁদের প্রথম কাছের ছবি' },
      credit: 'NASA / JPL',
    },
  },
  'surveyor-1': {
    hero: {
      src: image('surveyor-1', 'real.webp'),
      title: { en: 'Surveyor 1, ready to land', bn: 'অবতরণের জন্য তৈরি সার্ভেয়র ১' },
      credit: 'NASA',
    },
    cartoon: cartoon('surveyor-1', { en: 'Surveyor 1 cartoon', bn: 'সার্ভেয়র ১-এর কার্টুন ছবি' }),
    design: {
      src: image('surveyor-1', 'technical.webp'),
      title: { en: "Surveyor 1's spacecraft diagram", bn: 'সার্ভেয়র ১-এর যন্ত্র-নকশা' },
      credit: 'NASA',
      fit: 'contain',
    },
    discovery: {
      src: image('surveyor-1', 'taken.jpg'),
      title: { en: "Surveyor 1's shadow on the Moon", bn: 'চাঁদে সার্ভেয়র ১-এর ছায়া' },
      credit: 'NASA / JPL',
    },
  },
  'lunar-orbiter-1': {
    hero: {
      src: image('lunar-orbiter-1', 'real.jpg'),
      title: { en: 'Lunar Orbiter above the Moon', bn: 'চাঁদের ওপরে লুনার অরবিটার' },
      credit: 'NASA',
    },
    cartoon: cartoon('lunar-orbiter-1', {
      en: 'Lunar Orbiter 1 cartoon',
      bn: 'লুনার অরবিটার ১-এর কার্টুন ছবি',
    }),
    design: {
      src: image('lunar-orbiter-1', 'technical.jpg'),
      title: { en: "Lunar Orbiter's camera system", bn: 'লুনার অরবিটারের ক্যামেরা-ব্যবস্থা' },
      credit: 'NASA',
      fit: 'contain',
    },
    discovery: {
      src: image('lunar-orbiter-1', 'taken.jpg'),
      title: { en: 'Earthrise, seen from the Moon', bn: 'চাঁদ থেকে দেখা পৃথিবীর উদয়' },
      credit: 'NASA',
    },
  },
  eagle: {
    hero: {
      src: image('eagle', 'real.webp'),
      title: { en: "Eagle's descent stage on the Moon", bn: 'চাঁদে ঈগলের ডিসেন্ট স্টেজ' },
      credit: 'NASA',
    },
    cartoon: cartoon('eagle', { en: 'Eagle lunar module cartoon', bn: 'ঈগল লুনার মডিউলের কার্টুন ছবি' }),
    design: {
      src: image('eagle', 'technical.webp'),
      title: { en: 'The lunar module, labelled', bn: 'চাঁদ-যানের যন্ত্র-নকশা' },
      credit: 'NASA',
      fit: 'contain',
    },
    discovery: {
      src: image('eagle', 'taken.jpg'),
      title: { en: 'Earth above the Eagle', bn: 'ঈগলের ওপরে পৃথিবী' },
      credit: 'NASA',
    },
  },
  'apollo-15-lunar-roving-vehicle': {
    hero: {
      src: image('apollo-15-lunar-roving-vehicle', 'real.jpg'),
      title: { en: 'Apollo 15 on the Moon', bn: 'চাঁদে অ্যাপোলো ১৫' },
      credit: 'NASA',
    },
    cartoon: cartoon('apollo-15-lunar-roving-vehicle', {
      en: 'Apollo 15 lunar rover cartoon',
      bn: 'অ্যাপোলো ১৫ চাঁদ-গাড়ির কার্টুন ছবি',
    }),
    design: {
      src: image('apollo-15-lunar-roving-vehicle', 'technical.webp'),
      title: { en: "The lunar rover's anatomy", bn: 'চাঁদ-গাড়ির গঠন' },
      credit: 'NASA',
      fit: 'contain',
    },
    discovery: {
      src: image('apollo-15-lunar-roving-vehicle', 'taken.jpeg'),
      title: { en: 'Riding across Hadley-Apennine', bn: 'হ্যাডলি-অ্যাপেনাইনে চড়ে বেড়ানো' },
      credit: 'NASA',
    },
  },
  'pioneer-10': {
    hero: {
      src: image('pioneer-10', 'real.jpeg'),
      title: { en: 'Pioneer 10 in deep space', bn: 'মহাকাশের গভীরে পায়োনিয়ার ১০' },
      credit: 'NASA / Ames',
    },
    cartoon: cartoon('pioneer-10', { en: 'Pioneer 10 cartoon', bn: 'পায়োনিয়ার ১০-এর কার্টুন ছবি' }),
    design: {
      src: image('pioneer-10', 'technical.jpg'),
      title: { en: "Pioneer 10's spacecraft diagram", bn: 'পায়োনিয়ার ১০-এর যন্ত্র-নকশা' },
      credit: 'NASA / Ames',
      fit: 'contain',
    },
    discovery: {
      src: image('pioneer-10', 'taken.jpg'),
      title: { en: 'Ganymede, seen by Pioneer 10', bn: 'পায়োনিয়ার ১০-এর দেখা গ্যানিমিড' },
      credit: 'NASA / Ames',
    },
  },
  'viking-1': {
    hero: {
      src: image('viking-1', 'real.jpg'),
      title: { en: 'Viking 1, ready for Mars', bn: 'মঙ্গলের জন্য তৈরি ভাইকিং ১' },
      credit: 'NASA / JPL',
    },
    cartoon: cartoon('viking-1', { en: 'Viking 1 cartoon', bn: 'ভাইকিং ১-এর কার্টুন ছবি' }),
    discovery: {
      src: image('viking-1', 'taken.jpg'),
      title: { en: 'The surface of Mars', bn: 'মঙ্গলের পৃষ্ঠ' },
      credit: 'NASA / JPL',
    },
  },
  'voyager-1': {
    hero: {
      src: image('voyager-1', 'real.jpeg'),
      title: { en: 'Voyager 1 in the clean room', bn: 'পরিচ্ছন্ন কক্ষে ভয়েজার ১' },
      credit: 'NASA / JPL-Caltech',
    },
    cartoon: cartoon('voyager-1', { en: 'Voyager 1 cartoon', bn: 'ভয়েজার ১-এর কার্টুন ছবি' }),
    design: {
      src: image('voyager-1', 'technical.jpeg'),
      title: { en: "Voyager 1's instruments", bn: 'ভয়েজার ১-এর যন্ত্রপাতি' },
      credit: 'NASA / JPL-Caltech',
      fit: 'contain',
    },
    discovery: {
      src: image('voyager-1', 'taken.webp'),
      title: { en: 'The Pale Blue Dot', bn: 'ফ্যাকাশে নীল বিন্দু' },
      credit: 'NASA / JPL-Caltech',
    },
  },
  'voyager-2': {
    hero: {
      src: image('voyager-2', 'real.jpg'),
      title: { en: 'Voyager 2 in the clean room', bn: 'পরিচ্ছন্ন কক্ষে ভয়েজার ২' },
      credit: 'NASA / JPL-Caltech',
    },
    cartoon: cartoon('voyager-2', { en: 'Voyager 2 cartoon', bn: 'ভয়েজার ২-এর কার্টুন ছবি' }),
    design: {
      src: image('voyager-2', 'technical.webp'),
      title: { en: "Voyager 2's spacecraft diagram", bn: 'ভয়েজার ২-এর যন্ত্র-নকশা' },
      credit: 'NASA / JPL-Caltech',
      fit: 'contain',
    },
    discovery: {
      src: image('voyager-2', 'taken.jpg'),
      title: { en: "Jupiter's storms", bn: 'বৃহস্পতির ঝড়' },
      credit: 'NASA / JPL-Caltech',
    },
  },
  'mars-pathfinder': {
    hero: {
      src: image('mars-pathfinder', 'real.jpg'),
      title: { en: 'Ares Vallis, from Pathfinder', bn: 'পাথফাইন্ডারের চোখে আরেস ভ্যালিস' },
      credit: 'NASA / JPL',
    },
    cartoon: cartoon('mars-pathfinder', {
      en: 'Mars Pathfinder and Sojourner cartoon',
      bn: 'মার্স পাথফাইন্ডার ও সোজার্নারের কার্টুন ছবি',
    }),
    design: {
      src: image('mars-pathfinder', 'taken.jpg'),
      title: { en: "Pathfinder's lander, labelled", bn: 'পাথফাইন্ডার ল্যান্ডারের নকশা' },
      credit: 'NASA / JPL',
      fit: 'contain',
    },
    discovery: {
      src: image('mars-pathfinder', 'technical.jpg'),
      title: { en: 'Sojourner on Mars', bn: 'মঙ্গলে সোজার্নার' },
      credit: 'NASA / JPL',
    },
  },
  sojourner: {
    hero: {
      src: image('sojourner', 'real.jpg'),
      title: { en: 'Sojourner on Mars', bn: 'মঙ্গলে সোজার্নার' },
      credit: 'NASA / JPL',
    },
    cartoon: cartoon('sojourner', { en: 'Sojourner rover cartoon', bn: 'সোজার্নার রোভারের কার্টুন ছবি' }),
    design: {
      src: image('sojourner', 'technical.jpg'),
      title: { en: 'The Pathfinder lander and rover', bn: 'পাথফাইন্ডার ল্যান্ডার ও রোভার' },
      credit: 'NASA / JPL',
      fit: 'contain',
    },
    discovery: {
      src: image('sojourner', 'taken.jpg'),
      title: { en: 'The view from Ares Vallis', bn: 'আরেস ভ্যালিসের দৃশ্য' },
      credit: 'NASA / JPL',
    },
  },
  'deep-space-1': {
    hero: {
      src: image('deep-space-1', 'real.jpg'),
      title: { en: 'Deep Space 1', bn: 'ডিপ স্পেস ১' },
      credit: 'NASA / JPL',
    },
    cartoon: cartoon('deep-space-1', { en: 'Deep Space 1 cartoon', bn: 'ডিপ স্পেস ১-এর কার্টুন ছবি' }),
    design: {
      src: image('deep-space-1', 'technical.gif'),
      title: { en: "Deep Space 1's ion engine", bn: 'ডিপ স্পেস ১-এর আয়ন-ইনজিন' },
      credit: 'NASA / JPL',
      fit: 'contain',
    },
    discovery: {
      src: image('deep-space-1', 'taken.jpg'),
      title: { en: 'Comet Borrelly', bn: 'ধূমকেতু বোরেলি' },
      credit: 'NASA / JPL',
    },
  },
  opportunity: {
    hero: {
      src: image('opportunity', 'real.jpg'),
      title: { en: 'Opportunity on Mars', bn: 'মঙ্গলে অপরচুনিটি' },
      credit: 'NASA / JPL-Caltech',
    },
    cartoon: cartoon('opportunity', { en: 'Opportunity rover cartoon', bn: 'অপরচুনিটি রোভারের কার্টুন ছবি' }),
    design: {
      src: image('opportunity', 'technical.webp'),
      title: { en: "Opportunity's parts", bn: 'অপরচুনিটির যন্ত্রাংশ' },
      credit: 'NASA / JPL-Caltech',
      fit: 'contain',
    },
    discovery: {
      src: image('opportunity', 'taken.jpg'),
      title: { en: "Opportunity's final view", bn: 'অপরচুনিটির শেষ দৃশ্য' },
      credit: 'NASA / JPL-Caltech',
    },
  },
  'new-horizons': {
    hero: {
      src: image('new-horizons', 'real.webp'),
      title: { en: 'New Horizons in the clean room', bn: 'পরিচ্ছন্ন কক্ষে নিউ হরাইজনস' },
      credit: 'NASA / JHUAPL / SwRI',
    },
    cartoon: cartoon('new-horizons', { en: 'New Horizons cartoon', bn: 'নিউ হরাইজনসের কার্টুন ছবি' }),
    design: {
      src: image('new-horizons', 'technical.webp'),
      title: { en: "New Horizons' instruments", bn: 'নিউ হরাইজনসের যন্ত্রপাতি' },
      credit: 'NASA / JHUAPL / SwRI',
      fit: 'contain',
    },
    discovery: {
      src: image('new-horizons', 'taken.jpg'),
      title: { en: "Pluto's heart", bn: 'প্লুটোর হৃদয়' },
      credit: 'NASA / JHUAPL / SwRI',
    },
  },
  phoenix: {
    hero: {
      src: image('phoenix', 'real.jpg'),
      title: { en: 'Phoenix in the lab', bn: 'ল্যাবে ফিনিক্স' },
      credit: 'NASA / JPL-Caltech',
    },
    cartoon: cartoon('phoenix', { en: 'Phoenix lander cartoon', bn: 'ফিনিক্স ল্যান্ডারের কার্টুন ছবি' }),
    design: {
      src: image('phoenix', 'technical.jpg'),
      title: { en: "Phoenix's instruments", bn: 'ফিনিক্সের যন্ত্রপাতি' },
      credit: 'NASA / JPL-Caltech',
      fit: 'contain',
    },
    discovery: {
      src: image('phoenix', 'taken.jpg'),
      title: { en: 'Digging at the Martian north pole', bn: 'মঙ্গলের উত্তর মেরুতে খোঁড়াখুঁড়ি' },
      credit: 'NASA / JPL-Caltech',
    },
  },
  insight: {
    hero: {
      src: image('insight', 'real.jpg'),
      title: { en: 'InSight on Mars', bn: 'মঙ্গলে ইনসাইট' },
      credit: 'NASA / JPL-Caltech',
    },
    cartoon: cartoon('insight', { en: 'InSight lander cartoon', bn: 'ইনসাইট ল্যান্ডারের কার্টুন ছবি' }),
    design: {
      src: image('insight', 'technical.jpg'),
      title: { en: "InSight's labelled instruments", bn: 'ইনসাইটের যন্ত্রপাতির নকশা' },
      credit: 'NASA / JPL-Caltech',
      fit: 'contain',
    },
    discovery: {
      src: image('insight', 'taken.jpg'),
      title: { en: "Dust on InSight's solar panel", bn: 'ইনসাইটের সৌর প্যানেলে ধুলো' },
      credit: 'NASA / JPL-Caltech',
    },
  },
  ingenuity: {
    hero: {
      src: image('ingenuity', 'real.jpg'),
      title: { en: 'Ingenuity on Mars', bn: 'মঙ্গলে ইনজেনুইটি' },
      credit: 'NASA / JPL-Caltech',
    },
    cartoon: cartoon('ingenuity', { en: 'Ingenuity helicopter cartoon', bn: 'ইনজেনুইটি হেলিকপ্টারের কার্টুন ছবি' }),
    design: {
      src: image('ingenuity', 'technical.jpg'),
      title: { en: "Ingenuity's anatomy", bn: 'ইনজেনুইটির গঠন' },
      credit: 'NASA / JPL-Caltech',
      fit: 'contain',
    },
    discovery: {
      src: image('ingenuity', 'taken.jpg'),
      title: { en: 'The first aerial colour photo of Mars', bn: 'মঙ্গলের প্রথম রঙিন আকাশ-ছবি' },
      credit: 'NASA / JPL-Caltech',
    },
  },
}
