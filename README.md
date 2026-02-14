# VoicePost 🎙️

> Record your voice, get social media posts for Twitter, LinkedIn, and Instagram.

## Features

- 🎤 **Voice Recording** — Record directly in browser
- ✨ **AI Transcription** — OpenAI Whisper converts speech to text
- 📝 **Smart Generation** — GPT creates platform-optimized posts
- 📋 **One-Click Copy** — Copy posts to clipboard instantly
- 🎯 **Multi-Platform** — Twitter, LinkedIn, Instagram formats

## Quick Start

```bash
# Install dependencies
npm install

# Add your OpenAI API key
cp .env.example .env.local
# Edit .env.local with your OPENAI_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Record** — Click the mic and speak your thoughts
2. **Transcribe** — AI converts your voice to text
3. **Generate** — Get optimized posts for each platform
4. **Post** — Copy and paste to your social accounts

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **AI:** OpenAI Whisper + GPT-4o-mini
- **Icons:** Lucide React

## Future Plans

- [ ] Direct posting to Twitter/X via API
- [ ] LinkedIn API integration
- [ ] Voice profiles (learn your style)
- [ ] Thread generation for long content
- [ ] Scheduling posts
- [ ] Mobile PWA
- [ ] Team collaboration
- [ ] Analytics dashboard

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for Whisper + GPT |

## Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel
```

## License

MIT
