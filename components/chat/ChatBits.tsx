'use client';

import * as React from 'react';

export const CHAT_EMOJIS = ['😀', '😁', '😂', '🥰', '😍', '👍', '🙏', '🎉', '❤️', '🔥', '✅', '😢', '😮', '👏', '💯', '🌹'];

export function ChatMedia({
  url,
  kind,
  name,
}: {
  url: string;
  kind?: string | null;
  name?: string | null;
}) {
  if (kind === 'image') {
    return <img src={url} alt={name || 'Shared image'} className="max-h-52 rounded-xl object-cover" />;
  }
  if (kind === 'video') {
    return <video src={url} controls className="max-h-52 rounded-xl" />;
  }
  if (kind === 'audio') {
    return <audio src={url} controls className="w-full max-w-[220px]" />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="underline break-all">
      {name || 'Download file'}
    </a>
  );
}

export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="absolute bottom-12 left-2 z-40 grid grid-cols-8 gap-1 rounded-2xl border border-[#E8DACB] bg-white p-2 shadow-lg">
      {CHAT_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="h-8 w-8 rounded-lg text-lg hover:bg-[#FAF0E6]"
          onClick={() => onPick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function useVoiceNote(onFile: (file: File) => void) {
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [error, setError] = React.useState('');

  const toggle = async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const type = recorder.mimeType || 'audio/webm';
        onFile(new File(chunks, 'voice-note.webm', { type }));
        setRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setRecording(false);
      setError('Allow the microphone, then try the voice note again.');
    }
  };

  return { recording, error, toggle };
}
