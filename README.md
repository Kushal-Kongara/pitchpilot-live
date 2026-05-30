# PitchPilot Live

AI-powered pitch coach for hackathon teams and founders. Practice your demo live — get real-time coaching, delivery scores, and a full post-session debrief.

**Live app:** [pitchpilot-live.vercel.app](https://pitchpilot-live.vercel.app)

## Features

- **Pitch Analyzer** — paste your pitch + upload a slide/screenshot, get an instant score and rewritten 30-second version
- **Live Coach** — practice with your camera on, get real-time cues on delivery, pacing, and content gaps
- **Session Summary** — after your live session, get a full debrief: strengths, persistent weaknesses, priority fixes, and demo readiness verdict

## Tech Stack

- Next.js 16 (App Router)
- Gemini 2.5 Flash (multimodal — text + image)
- Tailwind CSS v4

## Local Setup

1. Clone the repo
2. Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com)
3. Create `.env.local`:
   ```
   GOOGLE_GENAI_API_KEY=your_key_here
   ```
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```
