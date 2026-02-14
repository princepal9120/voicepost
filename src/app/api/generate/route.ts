import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy init to avoid build errors
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const PROMPTS = {
  twitter: `Convert this transcript into a compelling Twitter/X post (max 280 characters).
Rules:
- Hook in the first line
- Conversational, punchy tone
- End with insight or engagement prompt
- No hashtags unless essential
- Be authentic, not salesy

Transcript:`,

  linkedin: `Convert this transcript into a LinkedIn post (800-1200 characters).
Rules:
- Strong hook in first 2 lines (this is what shows in preview)
- Use line breaks for readability
- Include a personal story or insight
- End with a question or call-to-action
- Professional but human tone
- Avoid corporate jargon

Transcript:`,

  instagram: `Convert this transcript into an Instagram caption (under 2000 characters).
Rules:
- Engaging opening line
- Use emojis naturally (2-4 max)
- Tell a story or share value
- Include a call-to-action
- Add 3-5 relevant hashtags at the end
- Conversational, authentic tone

Transcript:`,
};

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript' }, { status: 400 });
    }

    const client = getOpenAI();

    // Generate posts for all platforms in parallel
    const [twitterRes, linkedinRes, instagramRes] = await Promise.all([
      client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert social media copywriter.' },
          { role: 'user', content: `${PROMPTS.twitter}\n\n${transcript}` },
        ],
        max_tokens: 150,
      }),
      client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert social media copywriter.' },
          { role: 'user', content: `${PROMPTS.linkedin}\n\n${transcript}` },
        ],
        max_tokens: 500,
      }),
      client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert social media copywriter.' },
          { role: 'user', content: `${PROMPTS.instagram}\n\n${transcript}` },
        ],
        max_tokens: 400,
      }),
    ]);

    const posts = {
      twitter: twitterRes.choices[0]?.message?.content?.trim() || '',
      linkedin: linkedinRes.choices[0]?.message?.content?.trim() || '',
      instagram: instagramRes.choices[0]?.message?.content?.trim() || '',
    };

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}
