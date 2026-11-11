/**
 * The jump's soundtrack, made in the browser instead of downloaded.
 *
 * A short sci-fi whoosh is built from three layers: filtered noise sweeping
 * upwards, a low engine rumble, and a soft fifth that hangs in the air. A
 * bell marks the arrival. Nothing is fetched, so the jump starts the instant
 * the explorer taps a ghost, and it cannot stall on a slow connection.
 *
 * The browser may refuse to start audio before the explorer has interacted
 * with the page. That is fine: the jump still flies, it is just quiet.
 */

type AudioContextCtor = new () => AudioContext

const getAudioContext = (): AudioContextCtor | null => {
  if (typeof window === 'undefined') return null
  const scope = window as typeof window & { webkitAudioContext?: AudioContextCtor }
  return scope.AudioContext ?? scope.webkitAudioContext ?? null
}

/**
 * Plays the jump sound and returns a stop function. The stop function fades
 * the sound out and lets the browser reclaim the audio context, so a skipped
 * jump never leaves a hum behind.
 */
export function playWarpSound(durationMs: number): () => void {
  const AudioCtor = getAudioContext()
  if (!AudioCtor) return () => {}

  let context: AudioContext
  try {
    context = new AudioCtor()
  } catch {
    return () => {}
  }

  const duration = Math.max(0.4, durationMs / 1000)
  const now = context.currentTime

  const master = context.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(1, now + 0.15)
  master.gain.setValueAtTime(1, now + Math.max(0.25, duration - 0.4))
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  master.connect(context.destination)

  /** The whoosh: noise pushed through a band-pass filter that sweeps up. */
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const noiseData = noiseBuffer.getChannelData(0)
  for (let index = 0; index < noiseData.length; index += 1) {
    noiseData[index] = Math.random() * 2 - 1
  }
  const noise = context.createBufferSource()
  noise.buffer = noiseBuffer
  noise.loop = true

  const band = context.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 1.1
  band.frequency.setValueAtTime(240, now)
  band.frequency.exponentialRampToValueAtTime(4200, now + duration * 0.72)
  band.frequency.exponentialRampToValueAtTime(680, now + duration)

  const noiseGain = context.createGain()
  noiseGain.gain.setValueAtTime(0.0001, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.2, now + 0.3)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  noise.connect(band).connect(noiseGain).connect(master)
  noise.start(now)
  noise.stop(now + duration + 0.05)

  /** The engine: a low note that climbs as the ship gathers speed. */
  const rumble = context.createOscillator()
  rumble.type = 'sine'
  rumble.frequency.setValueAtTime(42, now)
  rumble.frequency.exponentialRampToValueAtTime(104, now + duration * 0.8)

  const rumbleGain = context.createGain()
  rumbleGain.gain.setValueAtTime(0.0001, now)
  rumbleGain.gain.exponentialRampToValueAtTime(0.17, now + 0.25)
  rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  rumble.connect(rumbleGain).connect(master)
  rumble.start(now)
  rumble.stop(now + duration + 0.05)

  /** The air of deep space: a quiet fifth, wobbling very slowly. */
  const pad = context.createOscillator()
  pad.type = 'sine'
  pad.frequency.value = 196

  const padGain = context.createGain()
  padGain.gain.setValueAtTime(0.0001, now)
  padGain.gain.exponentialRampToValueAtTime(0.05, now + 0.5)
  padGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  const wobble = context.createOscillator()
  wobble.frequency.value = 4.5
  const wobbleGain = context.createGain()
  wobbleGain.gain.value = 0.018
  wobble.connect(wobbleGain).connect(padGain.gain)

  const fifth = context.createOscillator()
  fifth.type = 'sine'
  fifth.frequency.value = 294

  pad.connect(padGain)
  fifth.connect(padGain)
  padGain.connect(master)
  pad.start(now)
  fifth.start(now)
  wobble.start(now)
  pad.stop(now + duration + 0.05)
  fifth.stop(now + duration + 0.05)
  wobble.stop(now + duration + 0.05)

  /** The arrival: one soft bell, just as the year lands. */
  const bell = context.createOscillator()
  bell.type = 'sine'
  bell.frequency.setValueAtTime(880, now + duration * 0.86)
  bell.frequency.exponentialRampToValueAtTime(660, now + duration)

  const bellGain = context.createGain()
  bellGain.gain.setValueAtTime(0.0001, now + duration * 0.86)
  bellGain.gain.exponentialRampToValueAtTime(0.12, now + duration * 0.9)
  bellGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.3)

  bell.connect(bellGain).connect(master)
  bell.start(now + duration * 0.86)
  bell.stop(now + duration + 0.35)

  // The browser may still be holding the context until the explorer taps.
  void context.resume?.().catch(() => undefined)

  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    try {
      const time = context.currentTime
      master.gain.cancelScheduledValues(time)
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), time)
      master.gain.exponentialRampToValueAtTime(0.0001, time + 0.14)
      window.setTimeout(() => {
        void context.close().catch(() => undefined)
      }, 260)
    } catch {
      /* the context is already gone */
    }
  }
}
