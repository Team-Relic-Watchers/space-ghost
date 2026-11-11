# 🚀 Space Ghosts

### A learning platform for NASA's space robots and rovers — in English and বাংলা

> Seventeen NASA spacecraft are still out there, some of them silent, some still talking.
> **Space Ghosts** turns their stories into a journey: children travel back through time,
> meet the machines that were left behind on the Moon, on Mars and in deep space, and
> learn what really happened to each one — by reading, listening, playing and exploring.

Built for young explorers with **React 19 + TypeScript + Three.js**, running entirely in the
browser: no backend, no login, no tracking, and no autoplay.

**সংক্ষেপে বাংলায়:** নাসার ১৭টি স্পেস রোবট/রুভারের গল্প নিয়ে তৈরি একটি শেখার প্ল্যাটফর্ম।
টাইম মেশিনে ২০২৬ থেকে ১৯৬৪ সালে ভ্রমণ, প্রফেসর প্যান্ডাস্টাইনের সাথে গল্প শোনা,
৩ডি মডেল ঘুরে দেখা, মাইক্রোসফট টিটিএস-এর ভয়েসে ইংরেজি ও বাংলা পড়া,
তারকা কুইজ, মিশন পাজল আর দুই ভাষায় সম্পূর্ণ গল্প — সবই ব্রাউজারের ভেতরেই চলে।

---

## ✨ Highlights

| | Feature | What it does |
|---|---|---|
| 🕰️ | **Time travel** | The Time Machine on Mission Control warps the reader from 2026 back to 1964 — and on to 17 missions that span 1964 → 2021. |
| 🐼 | **Pandastein** | A professor panda with a comic speech bubble guides the whole journey, explains every part of every story and never talks without being asked. |
| 📖 | **Storytelling** | **7 parts × 17 machines = 119 bilingual stories.** Each part scrolls into view and is read aloud, with a Mission File of five facts and the machine's own "robot voice". |
| 🔊 | **Voice** | The **browser's reading voices** with a picker in every story (*Microsoft Mark / Ruhul / Nayan* on Windows, whatever the device offers elsewhere), with a play / pause / resume card in every card. Bangla is never read by an English voice. |
| 🎧 | **Background music** | The *Interstellar* theme plays for 10 seconds, loops, and only ever sounds **under the voice** — quietly, at 24% volume. |
| ⭐ | **Star quiz** | **10 questions × 17 machines = 170 questions.** Four options each, one star per right answer, best score kept forever, with a bilingual explanation after every answer. |
| 🧩 | **Mission jigsaw** | Every machine's cartoon is torn into a 3×3 board; **5 pieces are missing** and must be dragged (or tapped) back home. |
| 🌐 | **Multilanguage** | **245 strings × 2 languages.** English and বাংলা — including local digits, local number formatting and a full Bangla story bible. |
| 🛰️ | **3D model** | Ranger 7 as a real 3D model you can spin and inspect (5 hotspots), the NASA Moon GLB, and the impact site rebuilt from **LOLA elevation data** with the **Sun exactly where it was on 31 July 1964**. |

---

## 🚀 The journey

```
Mission Control  ──►  Time jump video  ──►  The 17 Space Ghosts
   /                 Pandastein rides       /ghosts
 Time Machine +     through time map, stories, quiz,
 Pandastein                               puzzle, voice

Warp screen ("1964")  ──►  Ranger 7 mission  ──►  back to Mission Control
       /warp                  /ranger-7         3D explorer + hub
                                                   + 4 stops
```

| Route | Screen | What happens |
|---|---|---|
| `/` | **Mission Control** | Pandastein greets the explorer beside the Time Machine. "Start the adventure" plays the time-travel jump (video + Pandastein) and lands on the campaign map — or opens the map straight away with reduced motion. |
| `/warp` | **Warp screen** | The stars stretch and the year becomes **1964**. |
| `/ranger-7` | **Ranger 7 mission** | A split screen: the 3D spacecraft on the left, the mission hub on the right (story · photos · briefing · challenge). |
| `/ranger-7/scene` | **Showcase** | The full-screen 3D scene — spacecraft, Moon, 1400 stars, nebula and sparkles. |
| `/ghosts` | **The 17 Space Ghosts** | The campaign map: a tall, scrolling field of 17 planets with the flight path drawn between them. Tap one to open its full story. |

Deep-linking to `/warp` or `/ranger-7` without launching sends the reader back to Mission Control.

---

## 🛰️ The 17 Space Ghosts

Every machine, its year, where it went and how it ended — all taken from the story bible, never invented.

| # | Machine | Year | Destination | Ending |
|---|---|---|---|---|
| 1 | Ranger 7 | 1964 | The Moon | crashed on purpose |
| 2 | Surveyor 1 | 1966 | The Moon | quiet on the Moon |
| 3 | Lunar Orbiter 1 | 1966 | The Moon | crashed on purpose |
| 4 | Eagle (Apollo 11 descent stage) | 1969 | The Moon | at rest on the Moon |
| 5 | Apollo 15 Lunar Roving Vehicle | 1971 | The Moon | at rest on the Moon |
| 6 | Pioneer 10 | 1972 | Deep space | gone quiet |
| 7 | Viking 1 | 1975 | Mars | gone quiet |
| 8 | Voyager 1 | 1977 | Deep space | still talking |
| 9 | Voyager 2 | 1977 | Deep space | still talking |
| 10 | Mars Pathfinder | 1996 | Mars | gone quiet |
| 11 | Sojourner | 1996 | Mars | gone quiet |
| 12 | Deep Space 1 | 1998 | Deep space | retired |
| 13 | Opportunity | 2003 | Mars | gone quiet |
| 14 | New Horizons | 2006 | Deep space | still talking |
| 15 | Phoenix | 2007 | Mars | gone quiet |
| 16 | InSight | 2018 | Mars | gone quiet |
| 17 | Ingenuity | 2021 | Mars | gone quiet |

**7 Moon · 7 Mars · 5 deep space** — and five different endings, each with its own colour on the map.

---

## 🎓 The Ranger 7 mission

The first mission is a full, hand-built experience — the same one the Time Machine lands on.
On a desktop it is a split screen: the **3D spacecraft always sits on the left**, the mission
steps on the right. On a phone the two become one column with a two-tab bar.

| Stop | What it holds |
|---|---|
| **Story** | Five beats that set up the mission, then hand over to the explorer. |
| **Photos** | The real NASA/JPL frames — A001 (the first picture of the Moon by a US spacecraft), A100, B200, A199 (the last camera-A frame, 2.3 seconds before impact). |
| **Briefing** | Pandastein's question, the printed answer, the Mission File and the robot voice. |
| **Challenge** | Four questions, instant feedback, an explanation, and an animated gold **Moon Watcher** badge. |

And always beside them, the **3D inspector**: the spacecraft as a real model. Drag to spin,
scroll to zoom, tap a marker — **cameras, solar panels, high-gain antenna, omni antenna,
structure** — with a progress bar that counts 5/5.

### Where the 3D data comes from

The impact site is not decoration — it is rebuilt from NASA data:

| Layer | Source |
|---|---|
| Elevation | **LOLA DEM 256 ppd** (NASA Moon Trek), 512 × 512, 16-bit PNG, 46.48 m/px, 937.76 m of relief across a 23.8 km tile |
| Colour | **LRO WAC global mosaic 303 ppd** (NASA Moon Trek) |
| Lighting | The **real Sun position on 31 July 1964** (sub-solar 21.68° N, 71.71° W) baked into a hillshade |
| Coordinates | IAU 2015 selenographic frame, impact at **10.70° S, 20.61° W**, Mare Cognitum |
| Moon | NASA's `moon_small.glb`, unit-radius sphere (1.2719 units) with a 4096 px equirectangular map |
| Spacecraft | A **procedurally modelled** Ranger 7 (1 unit = 1 m, 8 named nodes, 5 named materials), exported to GLB with the official `GLTFExporter` |

The terrain is rebuilt from scratch by `scripts/data/build-ranger7-terrain.sh` (downloads the NASA Moon Trek tiles) and `scripts/data/process-ranger7-terrain.py` (NumPy + Pillow: normals, hillshade, PNGs and the provenance manifest).

---

## 🔊 Voice & music

The voice is the heart of the app, so it is treated carefully.

**Microsoft text to speech, always first.**

- **English starts with the browser's own default voice**, and the reader can pick any other voice of the device from the story page. On Windows these are the Microsoft voices.
- **Bangla is a free choice**: every voice of the device that supports বাংলা is collected — `Microsoft Ruhul` (a man), `Microsoft Nayan` (a woman), `Google বাংলা`, and anything else that turns up — Microsoft voices first.
- Edge dresses its voices up (`Microsoft Aria Online (Natural) - English (United States)`); the app reads through the dressing and still knows it is Microsoft.

**No gibberish, ever.** Four rules guard every line that is spoken:

1. A line written in Bangla is **never** read by an English voice — the script is checked first.
2. The utterance always carries the voice's **own locale**, so the browser never guesses.
3. A voice picked from another language is ignored.
4. Long sentences are split into breaths of ≤ 110 characters, and a word is **never cut in half**.

Chrome stops talking after about fifteen seconds, so the story is read in short breaths with a 120 ms pause between them. The pace is deliberately calm (`0.82` in English, `0.78` in Bangla) and Pandastein lifts his voice on every third sentence.

**The music follows the voice.** The *Interstellar* theme plays ten seconds and loops — but only while Pandastein is talking, at 24% volume, through a hidden YouTube player. Nothing is downloaded and no video is ever shown.

**Nothing plays on its own.** The reading switch is deliberately *not* saved between visits: a fresh page always starts silent, and the app never talks until the reader asks it to.

### If you hear nothing

The app speaks through the **Web Speech API of the browser**, and some browsers simply have no voice to offer. The story page says so when it knows, but here is the whole truth:

| Setup | What happens | What to do |
|---|---|---|
| **Windows** Chrome / Edge / Brave | Microsoft voices are used out of the box | Nothing — press the sound button |
| **Android** Chrome / Brave | The phone's own TTS engine speaks | Make sure a voice is installed: Settings → Accessibility → Text-to-speech |
| **Linux** Firefox | Silent unless a speech engine is installed | `sudo apt install speech-dispatcher espeak-ng`, then restart Firefox |
| **Linux** Brave / Chromium | These builds come with **no voices at all** (no Google network voices) | Use Chrome or Edge, or open the app on a phone |
| **iOS / macOS** Safari | Speaks, but only after a tap | Start the reading with the sound button or a part's play button |

The first press of the sound button always starts reading at once — browsers only allow talking after a tap.

---

## 🌐 Multilanguage

| | |
|---|---|
| Languages | **English** and **বাংলা** |
| UI strings | **245 per locale**, 8 sections, identical key sets (TypeScript-enforced) |
| Story content | The whole story bible is bilingual — **119 stories in two languages** |
| Numbers | `Intl.NumberFormat` with `bn-BD` / `en-US` grouping |
| Digits | Local digits in the UI, plain digits where they must match the NASA photographs |

i18next and react-i18next drive the interface; the story bible uses its own tiny `pick(pair, language)` switch, so the bible text and the UI text never get in each other's way. The chosen language is stored, and `<html lang>` follows it.

---

## 🧩 The mission jigsaw

Each machine's cartoon is cut into a 3 × 3 board. **Four pieces stay; five are lifted out** into a tray and shuffled. The explorer drags a piece back to its hole — or taps a piece and then taps the hole, which works just as well on a phone. A wrong piece flashes and shakes; the board is finished when every slot holds its own piece. A live preview of the complete cartoon sits beside the board, and *Shuffle* deals a new set of holes.

---

## ⭐ The star quiz

Ten questions per machine, four options each, drawn from the machine's own Mission File — its year, its destination, how it ended, where it sits in the sequence, what the professor asked, four "which line belongs here?" questions and one about its voice. The options are shuffled with a seeded generator, so the same machine always asks the same quiz in the same order — but the right answer never sits in the same slot for every machine.

One star per correct answer, ten stars per machine, and the best score is kept for good. After each answer the explanation appears in the reader's language.

---

## 🛠 Getting started

```bash
npm install          # install the dependencies
npm run dev          # start the dev server (Vite, HMR, React Compiler)
npm run build        # type-check with tsc -b, then build to dist/
npm run preview      # serve the production build
npm test             # run the whole test suite (Vitest)
npm run lint         # oxlint
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server with hot reload and the React Compiler enabled through Babel. |
| `npm run build` | `tsc -b` (three projects: app, node, root) then a production build. |
| `npm run test` | The full Vitest suite. |
| `npm run lint` | oxlint with the React and TypeScript rule sets. |
| `node scripts/shots.mjs <url> <outDir> [--webgl]` | Playwright screenshot harness; records console errors and failed requests. |
| `node scripts/check-glb-assets.mjs` | Verifies the Moon GLB, the Ranger 7 nodes/materials, the terrain files and the story bible. |

> The screenshot harness points at `/usr/bin/brave-origin-stable`; change `executablePath` for a different browser.

---

## 🧱 Tech stack

| Layer | Chosen | Why |
|---|---|---|
| UI | **React 19** + **TypeScript 7** | React Compiler enabled through Babel; strict types over the whole content model. |
| Build | **Vite 8** + **Vitest 5** | One config for the app and the tests; jsdom environment. |
| 3D | **three 0.180** + **@react-three/fiber 9** + **drei 10** | The spacecraft, the Moon and the terrain; the same scene powers the inspector and the showcase. |
| Motion | **framer-motion 14** | The warp, the cards, the map and the mascot. |
| State | **Zustand 5** (+ `persist`) | Four keys survive a reload; everything else is thrown away on purpose. |
| Content | **Zod 4** | The story bible, the machines and the quiz are validated, not trusted. |
| Language | **i18next 27** + **react-i18next 18** | 245 strings × 2 locales, type-checked in both. |
| Icons | **lucide-react** | One consistent icon set. |
| Type | **Fredoka Variable**, **Baloo Da 2** | Bundled through `@fontsource`, so the app needs no network for its fonts. |
| Lint | **oxlint** | Fast, with the React and TypeScript rule sets. |
| Visual QA | **Playwright** | Screenshot harness with console and network capture. |

---

## 📁 Project structure

```
src/
├── app/            Shell: routes, lazy loading, the flow test
├── audio/          Voice (Microsoft TTS helpers) and music (YouTube player)
├── components/     Backdrop, mascot, time machine, shared UI
│   ├── backdrop/   Starfield, planets, station backdrop
│   ├── mascot/     Pandastein himself
│   ├── time-machine/
│   └── ui/         Logo, language toggle, big button, voice card, speech bubble
├── content/        All the words and the data
│   ├── journey.ts  The year we travel to
│   ├── ranger7/    Machines, stories, quiz, photos, hotspots, impact site
│   └── space-ghosts-story-bible.json   17 missions × 7 parts, bilingual
├── features/
│   ├── mission-control/   The Time Machine and Pandastein's greeting
│   ├── warp/              The jump to 1964
│   ├── ghosts-map/        The map, the stories, the quiz, the puzzle, the voice
│   └── ranger7/           The 3D mission: hub, inspect, site, photos, briefing, challenge
├── game/           Zustand store (persisted progress)
├── i18n/           i18next setup and the two locales
└── styles/         Design tokens and base styles
```

**Design:** CSS custom properties in `styles/tokens.css` drive the whole palette — deep space purple, sun yellow, candy cyan and pink. Every screen owns its own stylesheet next to its component.

---

## 🗺 Content model

The story bible is the single source of truth:

```jsonc
{
  "schema_version": "1.0.0",
  "document": {
    "story_format": { "machine_count": 17, "parts_per_machine": 7 }
  },
  "campaign_overview": [ { "#": "১", "রোবট": "রেঞ্জার ৭", "সাল": "১৯৬৪", "কোথায়": "চাঁদ", "শেষ অবস্থা": "…" } ],
  "missions": [
    {
      "id": "machine-01",
      "sequence": 1,
      "name": { "en": "Ranger 7", "bn": "রেঞ্জার ৭" },
      "year": 1964,
      "at_a_glance": { "en": "Launch: …\nDestination: …", "bn": "উৎক্ষেপণ: …" },
      "story_parts": [ { "part": 1, "title": "…", "text": { "en": "…", "bn": "…" } } ],
      "pandastein_question": { "en": "…", "bn": "…" },
      "robot_voice_card": { "en": "…", "bn": "…" }
    }
  ],
  "editorial_verification_notes": {
    "items_to_check": [ { "গল্প": "…", "যা মিলিয়ে নিতে হবে": "…" } ],
    "known_conflicts_and_current_printing_decisions": [ { "গল্প": "…", "…": "…" } ]
  }
}
```

The Bible is a faithful extraction of the supplied DOCX: it preserves the wording as printed and **keeps its editorial caveats visible** — **33 items to check** and **8 known conflicts** are carried into the app, so the briefing tells the reader to treat the details as "printed as written".

Both copies of the bible (`src/content/` and `public/data/`) are byte-identical, and the asset checker enforces it.

---

## 💾 State & persistence

A single Zustand store (`src/game/store.ts`) holds the progress, saved under the
localStorage key `space-ghosts`, **version 7**.

| Saved | Not saved |
|---|---|
| `language` — English or বাংলা | `hasLaunched` — the journey always starts at Mission Control |
| `ranger7` — the step, the hotspots found, the best score, whether it is done | `voiceEnabled` — **the reading is never remembered**, so the app never talks on its own |
| `quizStars` — the best star score per machine (0–10) | |
| `voiceChoice` — the voice picked for each language | |

Everything that comes back from storage is sanitised before it is used: a language must be one
of the two, a step must be a real step, a star score must be a whole number between 0 and 10,
and a machine id must look like `machine-07`. Older saved versions are migrated, and the old
reading switch is dropped on the way.

---

## 🧪 Testing

**22 test files · 156 test cases · jsdom.**

| Area | What is covered |
|---|---|
| Content | Every machine has 7 bilingual parts and 5 Mission File lines; the quiz has 10 questions with 4 options; the impact coordinates are sane; the photos resolve. |
| Map layout | The field lays out on wide and narrow screens; the flight path never paints over a planet. |
| Voice | Microsoft is preferred; the browser's default voice starts and the reader can pick any; Bangla collects every supporting voice; Bangla is never read by an English voice. |
| Music | The theme plays ten seconds and loops; pause and resume hold it where it is; it stays quiet. |
| Flow | Mission Control → warp → mission → map, and back again. |
| 3D | The asset contracts and the showcase framing maths. |

```bash
npm test                    # everything
npm run test:watch          # while you work
```

---

## ♿ Accessibility & comfort

- Every control is a real button with a label; the voice card is a labelled group.
- The story reader only speaks after the reader asks it to, and can be held and carried on.
- `prefers-reduced-motion` shortens the launch, stills the floating spacecraft and stops the pulsing.
- Colour is never the only signal: every ending also has a name, a shape and a colour.
- The layout reflows for phones (one column, two-column map) and for very wide screens.
- Nothing autoplays, nothing flashes, nothing scrolls the page on its own.

---

## 📜 Credits & sources

| What | Where it comes from |
|---|---|
| Spacecraft photographs | **NASA / JPL-Caltech**, **NASA / JPL**, **NASA / Ames**, **NASA / JHUAPL / SwRI** — credited per photo in the app. |
| Ranger 7 frames | NASA NSSDCA (A001, A100, B001, B200, A199). |
| Lunar elevation & colour | **NASA Moon Trek** — LOLA DEM 256 ppd and LRO WAC mosaic 303 ppd. |
| Lunar coordinates | IAU 2015 selenographic frame. |
| Moon model | NASA's Moon GLB. |
| Story text | The supplied *Space Ghosts Story Bible* (English + বাংলা), used as printed. |
| Background music | The *Interstellar* theme, streamed through the YouTube player — the app stores no audio of its own. |
| Type | **Fredoka Variable** and **Baloo Da 2** (SIL Open Font License). |

The app is an educational reconstruction. It is not affiliated with NASA, and the Ranger 7 model is a teaching model built from published plans and mission data — not a spacecraft recovered from the Moon.

---

## 📌 Known gaps

- The **impact-site explorer** (walk the Moon with the DEM) is fully built but not yet linked from the mission hub; it is reachable in code.
- The **showcase `panel` variant** is unused by the explorer, which uses the dedicated inspection lab instead.
- The story bible's editorial caveats are surfaced but not yet individually flagged in the UI.
- The Music Card of earlier builds is gone: the music now belongs to the voice, and only the voice card remains.

---

## 📄 License

Private project. The code, the copy and the assets belong to their owners; NASA imagery and data are used under NASA's public media guidelines, and every photograph is credited in the app.
