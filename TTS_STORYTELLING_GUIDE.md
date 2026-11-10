# 🎙️ Best Free TTS & Voice Cloning for Character Storytelling
### (Kung Fu Panda / Jack Black & Optimus Prime Styles)

This guide covers the top free tools, libraries, and pipelines to generate dramatic, expressive character voices for storytelling in your web app, videos, or games.

---

## ⚡ Quick Comparison

| Tool / Engine | Type | Best For | Character Mimicry Accuracy | Free Cost / Limits |
| :--- | :--- | :--- | :--- | :--- |
| **XTTS v2 (Coqui)** | Local AI / Colab | Realistic voice cloning from a 6-second clip | ⭐⭐⭐⭐⭐ (Near perfect) | 100% Free & Open Source |
| **RVC v2 (Voice Conversion)** | Local AI / Web | Kung Fu Panda & Optimus Prime pre-trained models | ⭐⭐⭐⭐⭐ (Exact timbre & resonance) | 100% Free & Open Source |
| **ElevenLabs** | Cloud Web API | Instant plug-and-play voice library | ⭐⭐⭐⭐⭐ (Studio quality) | Free tier: 10,000 characters/mo |
| **Edge-TTS (Microsoft)** | CLI / Python / JS | Clean narrative baseline with pitch & speed shifts | ⭐⭐⭐ (Good base, needs effects) | 100% Free & Unlimited |
| **FakeYou** | Web App | Community-curated character models | ⭐⭐⭐⭐ (Recognizable characters) | Free daily queue |

---

## 1. 🏆 Option A: XTTS v2 (Best Quality Free Voice Cloning)

XTTS-v2 allows you to provide a **5–10 second clean audio clip** of Jack Black (Po) or Peter Cullen (Optimus Prime), and it will speak any text in that exact tone and vocal style.

### How to use with Python:

```bash
pip install TTS soundfile
```

```python
from TTS.api import TTS
import soundfile as sf

# Load XTTS v2 model (runs on GPU or CPU)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)

# 1. For Kung Fu Panda / Po style:
tts.tts_to_file(
    text="There is no secret ingredient! It's just you, Panda explorer!",
    file_path="po_story.wav",
    speaker_wav="samples/jack_black_po_sample.wav",  # 5-10s clean audio of Po
    language="en"
)

# 2. For Optimus Prime style:
tts.tts_to_file(
    text="Autobots, roll out across the stars. Our mission begins now.",
    file_path="optimus_story.wav",
    speaker_wav="samples/optimus_prime_sample.wav",   # 5-10s clip of Optimus
    language="en"
)
```

> **Tip:** You can download clean 6-second reference audio clips from YouTube or movie soundboards.

---

## 2. 🤖 Option B: RVC v2 (Retrieval-based Voice Conversion)

RVC is widely used in gaming and content creation because communities have already trained thousands of downloadable `.pth` character voice models for **Optimus Prime** and **Jack Black / Po**.

### How the Pipeline Works:
1. Generate base speech using any clean voice (e.g. Edge-TTS or your own voice).
2. Convert it into Po or Optimus Prime using an RVC model.

### How to Use:
1. **Web / Local UI:** Download **Applio** or **RVC WebUI** from GitHub ([RVC-Project](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI)).
2. **Download Character Models:**
   - Go to [Weights.gg](https://weights.gg/) or [HuggingFace](https://huggingface.co/).
   - Search for **"Optimus Prime"** or **"Kung Fu Panda" / "Po"**.
   - Download the model files (`.pth` and `.index`).
3. **Convert:** Drop your base audio file into the UI, select the character model, and click **Convert**.

---

## 3. 🌐 Option C: ElevenLabs (Fastest Setup & Highest Quality)

If you want immediate voice output without setting up Python or AI packages locally:

1. Sign up for a free account at [ElevenLabs.io](https://elevenlabs.io) (10,000 free chars/month).
2. Go to **Voices** → **Community Voice Library**.
3. Search for:
   - **"Optimus Prime"** or **"Peter Cullen"** (Commanding, deep robotic hero).
   - **"Jack Black"** or **"Energetic Cartoon Hero"** (Bouncy, dynamic comedic hero).
4. Click **Add to VoiceLab** and generate your audio directly or via their Node.js / REST API.

### Web API usage:
```javascript
const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
  },
  body: JSON.stringify({
    text: "Welcome, explorer! Prepare for launch!",
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.85,
    },
  }),
});
```

---

## 4. 💻 Option D: Microsoft Edge-TTS (100% Free, Unlimited & Local)

If you need a free, fast, zero-credential solution that runs straight in Node.js or Python with natural neural voices:

### Installation:
```bash
pip install edge-tts
# or in node.js:
npm install edge-tts-node
```

### Optimus Prime Style (Deep Pitch Shift):
Using a deep male voice (e.g. `en-US-ChristopherNeural` or `en-US-EricNeural`) with lowered pitch:
```bash
edge-tts --voice en-US-ChristopherNeural --text "Autobots, initialize warp speed." --pitch="-25Hz" --rate="-10%" --write-media optimus.mp3
```

### Energetic Storyteller / Po Style:
Using a warm, dynamic male voice (e.g. `en-US-GuyNeural`):
```bash
edge-tts --voice en-US-GuyNeural --text "Whoa! Look at that spacecraft! Skadoosh!" --pitch="+5Hz" --rate="+10%" --write-media po.mp3
```

---

## 🎛️ Sound Design Recipe: Making it Sound Exactly Like Optimus Prime

No matter which base TTS you choose, Optimus Prime's iconic voice has two audio effects added:
1. **Pitch Shift:** -3 to -5 semitones (makes the voice deep and resonant).
2. **Ring Modulation / Flanger / Chorus:** A light robotic metallic undertone (30–45Hz frequency).

### Free One-Click Effect in Audacity / Web Audio:
- **Audacity (Free):** `Effect` → `Pitch and Tempo` → `Change Pitch` (-15%).
- Then apply `Effect` → `Distortion` or `Vocoder` with wet mix at 15%.

