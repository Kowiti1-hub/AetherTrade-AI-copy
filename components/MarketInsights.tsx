import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { ICONS } from '../constants';
import { LiveServerMessage } from '@google/genai';

// Manual base64 encoding helper as per Gemini API guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

type DateRange = '24h' | '7d' | '30d' | 'all';
type AssetType = 'All' | 'Crypto' | 'Stocks' | 'Forex' | 'Commodities';
type Sentiment = 'All' | 'Bullish' | 'Bearish' | 'Neutral';

const MarketInsights: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{ text: string, sources: Array<{title: string, uri: string}> } | null>(null);
  
  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('24h');
  const [assetType, setAssetType] = useState<AssetType>('All');
  const [sentiment, setSentiment] = useState<Sentiment>('All');

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnectingVoice, setIsConnectingVoice] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isPausedRef = useRef(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    // Stop listening if search is triggered
    if (isListening) stopVoiceSearch();

    setLoading(true);
    try {
      // Construct an enriched prompt based on filters
      const enrichedQuery = `
        Analysis focus: ${query}
        Time Horizon: ${dateRange === 'all' ? 'Historical' : 'Last ' + dateRange}
        Asset Category: ${assetType}
        Desired Sentiment Context: ${sentiment === 'All' ? 'Objective/Unbiased' : sentiment}
        
        Please provide a deep market analysis strictly considering these parameters.
      `;
      const res = await gemini.getMarketInsights(enrichedQuery);
      setInsights(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceSearch = async () => {
    setIsConnectingVoice(true);
    setIsPaused(false);
    isPausedRef.current = false;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const sessionPromise = gemini.connectLive({
        onOpen: () => {
          setIsListening(true);
          setIsConnectingVoice(false);
          
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            if (isPausedRef.current) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = inputData[i] * 32768;
            }
            const base64 = encode(new Uint8Array(pcmData.buffer));
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };

          source.connect(processor);
          processor.connect(audioContextRef.current!.destination);
          (processor as any)._source = source;
          (sessionRef.current as any)._processor = processor;
        },
        onMessage: (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            setQuery(prev => {
              const lastChar = prev.trim().slice(-1);
              const needsSpace = prev.length > 0 && lastChar !== '';
              return prev + (needsSpace ? ' ' : '') + text;
            });
          }
        },
        onError: (e) => {
          console.error("Voice Search Error:", e);
          stopVoiceSearch();
        },
        onClose: () => {
          stopVoiceSearch();
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnectingVoice(false);
    }
  };

  const stopVoiceSearch = () => {
    setIsListening(false);
    setIsConnectingVoice(false);
    setIsPaused(false);
    isPausedRef.current = false;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (sessionRef.current) {
      if (sessionRef.current._processor) {
        sessionRef.current._processor.disconnect();
        if (sessionRef.current._processor._source) {
          sessionRef.current._processor._source.disconnect();
        }
      }
      sessionRef.current = null;
    }
  };

  const toggleVoiceSearch = () => {
    if (isListening || isConnectingVoice) {
      stopVoiceSearch();
    } else {
      startVoiceSearch();
    }
  };

  const togglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    isPausedRef.current = nextState;
  };

  useEffect(() => {
    return () => stopVoiceSearch();
  }, []);

  const suggestions = [
    "What's the current sentiment on Bitcoin?",
    "Recent news affecting NVDA stock",
    "Compare Ethereum vs Solana growth potential",
    "Impact of federal reserve rates on tech stocks"
  ];

  const FilterBadge = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
        active 
          ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.1)]' 
          : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-500">
          AI Intelligence Hub
        </h1>
        <p className="text-slate-400 text-lg">
          Get real-time market analysis and verified data insights.
        </p>
      </div>

      <div className="relative group space-y-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? (isPaused ? "Voice Input Paused" : "Listening for your query...") : "Ask anything about the markets..."}
              className={`w-full bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-48 text-lg focus:outline-none transition-all shadow-2xl backdrop-blur-md text-slate-900 dark:text-white ${isListening ? (isPaused ? 'border-amber-500/30' : 'border-sky-500/50 ring-4 ring-sky-500/10') : 'focus:border-sky-500/50'}`}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors">
              <ICONS.Search />
            </div>
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-all border ${showFilters ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-sky-400'}`}
                title="Advanced Filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9v6l4 3v-9L22 3z"/></svg>
              </button>

              {isListening && !isConnectingVoice && (
                <button
                  type="button"
                  onClick={togglePause}
                  className={`p-2.5 rounded-xl transition-all border ${isPaused ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-white'}`}
                  title={isPaused ? "Resume Listening" : "Pause Listening"}
                >
                  {isPaused ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="16" x="6" y="4" rx="1"/><rect width="4" height="16" x="14" y="4" rx="1"/></svg>
                  )}
                </button>
              )}

              <button 
                type="button"
                onClick={toggleVoiceSearch}
                className={`p-2.5 rounded-xl transition-all relative ${isListening ? (isPaused ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-rose-500 text-white animate-pulse') : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-sky-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
                title={isListening ? "Stop Voice Search" : "Voice Search"}
              >
                {isConnectingVoice ? (
                  <div className="w-5 h-5 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                )}
                {isListening && !isPaused && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-400 rounded-full border-2 border-slate-900"></span>}
              </button>
              
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Time Horizon</label>
                <div className="flex flex-wrap gap-2">
                  {(['24h', '7d', '30d', 'all'] as DateRange[]).map(t => (
                    <FilterBadge key={t} label={t} active={dateRange === t} onClick={() => setDateRange(t)} />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Asset Class</label>
                <div className="flex flex-wrap gap-2">
                  {(['All', 'Crypto', 'Stocks', 'Forex', 'Commodities'] as AssetType[]).map(t => (
                    <FilterBadge key={t} label={t} active={assetType === t} onClick={() => setAssetType(t)} />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Target Sentiment</label>
                <div className="flex flex-wrap gap-2">
                  {(['All', 'Bullish', 'Bearish', 'Neutral'] as Sentiment[]).map(t => (
                    <FilterBadge key={t} label={t} active={sentiment === t} onClick={() => setSentiment(t)} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 italic">Parameters will be ingested into the AI reasoning matrix.</span>
              <button 
                onClick={() => { setDateRange('24h'); setAssetType('All'); setSentiment('All'); }}
                className="text-[10px] font-bold text-sky-500 hover:text-sky-600 transition-colors uppercase tracking-widest"
              >
                Reset Matrix
              </button>
            </div>
          </div>
        )}
      </div>

      {!insights && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(s); }}
              className="text-left p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-sky-500/30 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all group"
            >
              <div className="text-sm text-slate-400 mb-1 group-hover:text-sky-300 transition-colors">Suggestion</div>
              <div className="font-medium text-slate-800 dark:text-slate-200">{s}</div>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-4 p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 animate-pulse"></div>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8 leading-relaxed text-slate-800 dark:text-slate-200 shadow-xl prose prose-slate dark:prose-invert max-w-none transition-colors">
             <div className="whitespace-pre-wrap">{insights.text}</div>
          </div>

          {insights.sources.length > 0 && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-sm">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Verification Sources</h4>
              <div className="flex flex-wrap gap-3">
                {insights.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    <span className="truncate max-w-[150px]">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketInsights;