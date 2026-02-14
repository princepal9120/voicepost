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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    // Convert to buffer for OpenAI
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Create a File object that OpenAI can accept
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await getOpenAI().audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
