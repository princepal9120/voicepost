"use client";

import { useState, useRef } from 'react';
import { Mic, Square, Send, Twitter, Linkedin, Instagram, Loader2, Copy, Check } from 'lucide-react';

type Platform = 'twitter' | 'linkedin' | 'instagram';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<Record<Platform, string>>({
    twitter: '',
    linkedin: '',
    instagram: '',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'record' | 'transcribe' | 'generate' | 'post'>('record');
  const [copied, setCopied] = useState<Platform | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Please allow microphone access');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const transcribe = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setStep('transcribe');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.text);
      setStep('generate');
    } catch (err) {
      console.error('Transcription failed:', err);
      alert('Transcription failed');
    }
    setLoading(false);
  };

  const generatePosts = async () => {
    if (!transcript) return;
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      setGeneratedPosts(data.posts);
      setStep('post');
    } catch (err) {
      console.error('Generation failed:', err);
      alert('Generation failed');
    }
    setLoading(false);
  };

  const copyPost = (platform: Platform) => {
    navigator.clipboard.writeText(generatedPosts[platform]);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  const postToTwitter = async () => {
    // This would integrate with bird CLI or Twitter API
    alert('Twitter posting coming soon! For now, copy and paste.');
  };

  const reset = () => {
    setAudioBlob(null);
    setTranscript('');
    setGeneratedPosts({ twitter: '', linkedin: '', instagram: '' });
    setStep('record');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-violet-600" />
            <span className="font-semibold">VoicePost</span>
          </div>
          <span className="text-sm text-gray-500">Voice → Social Posts</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Step 1: Record */}
        {step === 'record' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Record your thoughts</h1>
            <p className="text-gray-500 mb-8">Talk naturally. We'll turn it into posts.</p>
            
            <div className="flex flex-col items-center gap-6">
              {!audioBlob ? (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-violet-600 hover:bg-violet-700'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span>Recording saved</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Re-record
                    </button>
                    <button
                      onClick={transcribe}
                      className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}
              
              {isRecording && (
                <p className="text-sm text-gray-500">Recording... Click to stop</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Transcribing */}
        {step === 'transcribe' && loading && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Transcribing...</h2>
            <p className="text-gray-500">Converting your voice to text</p>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 'generate' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your transcript</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-gray-700">{transcript}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Start over
              </button>
              <button
                onClick={generatePosts}
                disabled={loading}
                className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Posts →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Posts ready */}
        {step === 'post' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your posts are ready!</h2>
              <button
                onClick={reset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                New recording
              </button>
            </div>

            {/* Twitter */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Twitter className="w-5 h-5 text-sky-500" />
                <span className="font-medium">Twitter/X</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {generatedPosts.twitter.length}/280
                </span>
              </div>
              <p className="text-gray-700 mb-3">{generatedPosts.twitter}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => copyPost('twitter')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {copied === 'twitter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'twitter' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span className="font-medium">LinkedIn</span>
              </div>
              <p className="text-gray-700 whitespace-pre-line mb-3">{generatedPosts.linkedin}</p>
              <button
                onClick={() => copyPost('linkedin')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {copied === 'linkedin' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'linkedin' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Instagram */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Instagram className="w-5 h-5 text-pink-600" />
                <span className="font-medium">Instagram</span>
              </div>
              <p className="text-gray-700 whitespace-pre-line mb-3">{generatedPosts.instagram}</p>
              <button
                onClick={() => copyPost('instagram')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {copied === 'instagram' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'instagram' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
