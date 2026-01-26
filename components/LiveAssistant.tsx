import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';

// Fix: Manual encoding/decoding functions as per Gemini API guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outAudioContextRef.current) {
        outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = gemini.connectLive({
        onOpen: () => {
          setIsActive(true);
          setIsConnecting(false);
          setTranscription(prev => [...prev, "System: Live session started. Speak now."]);
          
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = inputData[i] * 32768;
            }
            
            // Fix: Use manual encode function as per guidelines
            const base64 = encode(new Uint8Array(pcmData.buffer));

            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };

          source.connect(processor);
          processor.connect(audioContextRef.current!.destination);
        },
        onMessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && outAudioContextRef.current) {
            // Fix: Use manual decode and decodeAudioData as per guidelines for PCM streams
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, outAudioContextRef.current, 24000, 1);

            const source = outAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outAudioContextRef.current.destination);
            
            // Fix: Smooth gapless playback scheduling
            const startTime = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          if (message.serverContent?.interrupted) {
             sourcesRef.current.forEach(s => {
               try { s.stop(); } catch(e) {}
             });
             sourcesRef.current.clear();
             nextStartTimeRef.current = 0;
          }
        },
        onError: (e) => {
          console.error("Live Error:", e);
          setIsActive(false);
          setIsConnecting(false);
        },
        onClose: () => {
          setIsActive(false);
          setIsConnecting(false);
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      // Fix: Close session according to SDK rules
      if (sessionRef.current.close) sessionRef.current.close();
      setIsActive(false);
      setTranscription(prev => [...prev, "System: Session ended."]);
      sessionRef.current = null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col animate-in fade-in duration-700">
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Visualizer Background */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${isActive ? 'opacity-20' : 'opacity-0'}`}>
          <div className="flex items-center space-x-1 h-32">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 bg-sky-500 rounded-full animate-bounce`}
                style={{ 
                  height: `${Math.random() * 100}%`,
                  animationDuration: `${0.5 + Math.random()}s`,
                  animationDelay: `${i * 0.05}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative ${
            isActive ? 'bg-sky-500 shadow-[0_0_50px_rgba(14,165,233,0.5)] scale-110' : 'bg-slate-800'
          }`}>
             {isActive && (
               <div className="absolute inset-0 rounded-full animate-ping bg-sky-500/20"></div>
             )}
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-white' : 'text-slate-500'}>
               <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
             </svg>
          </div>

          <h2 className="text-3xl font-bold mt-8 mb-4">
            {isActive ? "Aether is Listening..." : isConnecting ? "Establishing Link..." : "Ready for Deployment"}
          </h2>
          <p className="text-slate-400 text-center max-w-md">
            {isActive 
              ? "Speak naturally to inquire about market trends, technical patterns, or portfolio advice." 
              : "Enable the voice interface to interact with our senior trading AI in real-time."
            }
          </p>

          <button
            onClick={isActive ? stopSession : startSession}
            disabled={isConnecting}
            className={`mt-10 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
              isActive 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20' 
                : 'bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20'
            } disabled:opacity-50`}
          >
            {isConnecting ? "Connecting..." : isActive ? "Deactivate Assistant" : "Engage Voice Link"}
          </button>
        </div>

        {/* Console/Transcription */}
        <div className="absolute bottom-8 left-8 right-8">
           <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 h-32 overflow-y-auto font-mono text-xs text-sky-400/80">
              {transcription.map((t, i) => (
                <div key={i} className="mb-1">{`> ${t}`}</div>
              ))}
              {isActive && <div className="animate-pulse">_</div>}
              {transcription.length === 0 && <div className="text-slate-600 italic">No activity detected.</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAssistant;