import { machineDetails, machines } from './machines'
import type { Machine } from './machines'
import type { Bilingual } from '../storyBible'

/**
 * The ten-question star quiz, generated from the story bible itself.
 *
 * Every machine gets the same ten kinds of question, so the quiz is fair and
 * predictable, but the facts and the wrong answers are drawn from that
 * machine's own Mission File and from the other sixteen missions. Nothing is
 * invented: a question only ever asks about a line the Bible already prints,
 * and the explanation is that same line (or Pandastein's printed answer).
 *
 * Options are shuffled with a seed made from the machine id and the question
 * kind, so a machine always presents the same quiz, while the correct answer
 * does not sit in the same slot every time.
 */

export interface QuizQuestion {
  id: string
  prompt: Bilingual
  options: Bilingual[]
  correctIndex: number
  /** Shown after answering, always quoting the Bible. */
  explain: Bilingual
}

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

/** A number in the reader's digits, without thousands separators. */
const numberIn = (value: number, language: 'en' | 'bn'): string =>
  language === 'bn'
    ? String(value).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)])
    : String(value)

const numberPair = (value: number): Bilingual => ({
  en: numberIn(value, 'en'),
  bn: numberIn(value, 'bn'),
})

const DESTINATION_OPTIONS: Bilingual[] = [
  { en: 'The Moon', bn: 'চাঁদ' },
  { en: 'Mars', bn: 'মঙ্গল' },
  { en: 'Deep space', bn: 'মহাকাশের গভীরে' },
  { en: 'Earth orbit', bn: 'পৃথিবীর কক্ষপথ' },
]

const normalize = (value: string): string => value.trim().toLowerCase()

/** Small deterministic PRNG, so every machine's quiz is stable across visits. */
const hashSeed = (seed: string): number => {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const randomGenerator = (seed: string): (() => number) => {
  let state = hashSeed(seed)
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const shuffle = <T,>(items: T[], seed: string): T[] => {
  const copy = [...items]
  const random = randomGenerator(seed)
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Up to `count` pool entries that share neither language's text with the
 * correct answer. Two missions can print different English statuses that
 * translate to the same Bangla line, so checking only one language would let
 * two identical options appear on screen.
 */
const chooseDistinct = (
  pool: Bilingual[],
  correct: Bilingual,
  count: number,
  seed: string,
): Bilingual[] => {
  const seenEn = new Set([normalize(correct.en)])
  const seenBn = new Set([normalize(correct.bn)])
  const picked: Bilingual[] = []
  for (const candidate of shuffle(pool, seed)) {
    const candidateEn = normalize(candidate.en)
    const candidateBn = normalize(candidate.bn)
    if (seenEn.has(candidateEn) || seenBn.has(candidateBn)) continue
    seenEn.add(candidateEn)
    seenBn.add(candidateBn)
    picked.push(candidate)
    if (picked.length === count) break
  }
  return picked
}

const buildQuestion = (
  id: string,
  prompt: Bilingual,
  correct: Bilingual,
  distractors: Bilingual[],
  explain: Bilingual,
  seed: string,
): QuizQuestion => {
  const options = shuffle([correct, ...distractors], `${seed}-options`)
  const correctIndex = options.findIndex(
    (option) => option.en === correct.en && option.bn === correct.bn,
  )
  return { id, prompt, options, correctIndex, explain }
}

interface GlanceLine {
  machineId: string
  index: number
  en: string
  bn: string
  labelEn: string
}

const labelOf = (line: string): string => {
  const colon = line.indexOf(':')
  return colon >= 0 ? line.slice(0, colon).trim() : ''
}

const valueOf = (line: string): string => {
  const colon = line.indexOf(':')
  return colon >= 0 ? line.slice(colon + 1).trim() : line.trim()
}

const glanceLinesFor = (machineId: string): GlanceLine[] => {
  const detail = machineDetails[machineId]
  const enLines = detail.atAGlance.en.split('\n').filter((line) => line.trim())
  const bnLines = detail.atAGlance.bn.split('\n').filter((line) => line.trim())
  return enLines.map((line, index) => ({
    machineId,
    index,
    en: line,
    bn: bnLines[index] ?? line,
    labelEn: labelOf(line),
  }))
}

const ALL_GLANCE_LINES = machines.flatMap((machine) => glanceLinesFor(machine.id))

/** Wrong lines for a Mission File question: same kind of fact first, then same position. */
const glanceDistractors = (
  machine: Machine,
  correct: GlanceLine,
  count: number,
  seed: string,
): Bilingual[] => {
  const targetLines = glanceLinesFor(machine.id)
  const facts = new Map<string, string>()
  for (const line of targetLines) {
    facts.set(normalize(line.labelEn), normalize(valueOf(line.en)))
  }
  // Status is the machine's ending even when its Mission File does not print a
  // Status line (Voyager 1, for example). Excluding that value keeps a
  // distractor from being accidentally true.
  facts.set('status', normalize(machine.status.en))

  const candidates = ALL_GLANCE_LINES.filter((candidate) => {
    if (candidate.machineId === machine.id) return false
    if (normalize(candidate.en) === normalize(correct.en)) return false
    const targetValue = facts.get(normalize(candidate.labelEn))
    if (targetValue && targetValue === normalize(valueOf(candidate.en))) return false
    return true
  })

  const ordered = [0, 1, 2].flatMap((priority) =>
    shuffle(
      candidates
        .filter((candidate) =>
          priority === 0
            ? normalize(candidate.labelEn) === normalize(correct.labelEn)
            : priority === 1
              ? candidate.index === correct.index
              : true,
        )
        .filter((candidate) =>
          priority === 1
            ? normalize(candidate.labelEn) !== normalize(correct.labelEn)
            : true,
        )
        .filter((candidate) =>
          priority === 2
            ? candidate.index !== correct.index &&
              normalize(candidate.labelEn) !== normalize(correct.labelEn)
            : true,
        )
        .map((candidate) => candidate),
      `${seed}-${priority}`,
    ),
  )

  const seenEn = new Set([normalize(correct.en)])
  const seenBn = new Set([normalize(correct.bn)])
  const picked: Bilingual[] = []
  for (const candidate of ordered) {
    const pair = { en: candidate.en, bn: candidate.bn }
    const candidateEn = normalize(pair.en)
    const candidateBn = normalize(pair.bn)
    if (seenEn.has(candidateEn) || seenBn.has(candidateBn)) continue
    seenEn.add(candidateEn)
    seenBn.add(candidateBn)
    picked.push(pair)
    if (picked.length === count) break
  }
  return picked
}

const stripVoicePrefix = (voice: string): string =>
  voice.replace(/^\s*(Imagined voice|কল্পিত কণ্ঠ)\s*:\s*/i, '').trim()

const UNIQUE_STATUSES = machines
  .map((machine) => machine.status)
  .filter(
    (status, index, all) =>
      all.findIndex((other) => normalize(other.en) === normalize(status.en)) === index,
  )

const buildQuiz = (machine: Machine): QuizQuestion[] => {
  const detail = machineDetails[machine.id]
  const name = machine.name
  const year = numberPair(machine.yearNumber)
  const sequence = numberPair(machine.sequence)
  const total = numberPair(machines.length)
  const lines = glanceLinesFor(machine.id)
  const id = (kind: string) => `${machine.id}-${kind}`
  const seed = (kind: string) => `${machine.id}-${kind}`

  const questions: QuizQuestion[] = []

  // 1. The year the Bible prints.
  const yearPool = machines.map((other) => numberPair(other.yearNumber))
  questions.push(
    buildQuestion(
      id('year'),
      { en: `In which year did ${name.en} fly?`, bn: `${name.bn} কোন সালে উড়েছিল?` },
      year,
      chooseDistinct(yearPool, year, 3, seed('year')),
      { en: `${name.en} flew in ${year.en}.`, bn: `${name.bn} উড়েছিল ${year.bn} সালে।` },
      seed('year'),
    ),
  )

  // 2. The destination.
  questions.push(
    buildQuestion(
      id('destination'),
      { en: `Where did ${name.en} go?`, bn: `${name.bn} কোথায় গিয়েছিল?` },
      machine.location,
      chooseDistinct(DESTINATION_OPTIONS, machine.location, 3, seed('destination')),
      {
        en: `Its destination was ${machine.location.en}.`,
        bn: `তার গন্তব্য ছিল ${machine.location.bn}।`,
      },
      seed('destination'),
    ),
  )

  // 3. The ending printed on the robot voice card.
  questions.push(
    buildQuestion(
      id('ending'),
      {
        en: `How did ${name.en}'s mission end?`,
        bn: `${name.bn}-এর অভিযান কীভাবে শেষ হলো?`,
      },
      machine.status,
      chooseDistinct(UNIQUE_STATUSES, machine.status, 3, seed('ending')),
      {
        en: `The Mission File says: ${machine.status.en}.`,
        bn: `মিশন ফাইলে আছে: ${machine.status.bn}।`,
      },
      seed('ending'),
    ),
  )

  // 4. The machine's place in the journey.
  const sequencePool = machines.map((other) => numberPair(other.sequence))
  questions.push(
    buildQuestion(
      id('sequence'),
      {
        en: `Which mission number is ${name.en} in the Space Ghosts journey?`,
        bn: `স্পেস গোস্টস যাত্রায় ${name.bn} কত নম্বর মিশন?`,
      },
      sequence,
      chooseDistinct(sequencePool, sequence, 3, seed('sequence')),
      {
        en: `${name.en} is mission ${sequence.en} of ${total.en}.`,
        bn: `${name.bn} ${total.bn}টি মিশনের মধ্যে ${sequence.bn} নম্বর।`,
      },
      seed('sequence'),
    ),
  )

  // 5. Pandastein's printed question and answer.
  const answerPool = machines.map((other) => machineDetails[other.id].answer)
  questions.push(
    buildQuestion(
      id('pandastein'),
      detail.question,
      detail.answer,
      chooseDistinct(answerPool, detail.answer, 3, seed('pandastein')),
      detail.answer,
      seed('pandastein'),
    ),
  )

  // 6-9. Four of the five Mission File lines, each as "which line belongs here?"
  // The fifth is the Status line, which the ending question already covers.
  for (const line of lines.slice(0, 4)) {
    const correct = { en: line.en, bn: line.bn }
    questions.push(
      buildQuestion(
        id(`file-${line.index}`),
        {
          en: `Which line belongs in ${name.en}'s Mission File?`,
          bn: `${name.bn}-এর মিশন ফাইলে কোন লাইনটি আছে?`,
        },
        correct,
        glanceDistractors(machine, line, 3, seed(`file-${line.index}`)),
        {
          en: `The Mission File says: ${line.en}.`,
          bn: `মিশন ফাইলে আছে: ${line.bn}।`,
        },
        seed(`file-${line.index}`),
      ),
    )
  }

  // 10. The playful imagined voice.
  const quote = {
    en: stripVoicePrefix(detail.imaginedVoice.en),
    bn: stripVoicePrefix(detail.imaginedVoice.bn),
  }
  const namePool = machines.map((other) => other.name)
  questions.push(
    buildQuestion(
      id('voice'),
      {
        en: `Which robot is saying this?\n\n${quote.en}`,
        bn: `এখানে কোন রোবট কথা বলছে?\n\n${quote.bn}`,
      },
      name,
      chooseDistinct(namePool, name, 3, seed('voice')),
      { en: `That voice belongs to ${name.en}.`, bn: `ওই কণ্ঠ ${name.bn}-এর।` },
      seed('voice'),
    ),
  )

  return questions
}

/** Ten bilingual questions for each machine, keyed by the machine's story bible id. */
export const machineQuizzes: Record<string, QuizQuestion[]> = Object.fromEntries(
  machines.map((machine) => [machine.id, buildQuiz(machine)]),
)
