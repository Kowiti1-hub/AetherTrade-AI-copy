import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";

export class GeminiService {
  /**
   * Always initialize a new GoogleGenAI instance right before making an API call 
   * to ensure it uses the most up-to-date environment configuration.
   */
  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getMarketInsights(query: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: 'You are AetherTrade AI, a senior market analyst. Provide deep, data-driven insights with grounding references. Use markdown for formatting.'
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
      })) || [];

      return {
        text: response.text || "No insights found.",
        sources
      };
    } catch (error) {
      console.error("Error in getMarketInsights:", error);
      throw error;
    }
  }

  async generateStrategy(prompt: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a professional trading strategy based on: ${prompt}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              riskProfile: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              entryCondition: { type: Type.STRING },
              exitCondition: { type: Type.STRING },
              timeframe: { type: Type.STRING }
            },
            required: ['name', 'riskProfile', 'indicators', 'entryCondition', 'exitCondition', 'timeframe']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Error in generateStrategy:", error);
      throw error;
    }
  }

  connectLive(callbacks: {
    onOpen: () => void;
    onMessage: (message: LiveServerMessage) => void;
    onError: (e: any) => void;
    onClose: () => void;
  }) {
    return this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: callbacks.onOpen,
        onmessage: callbacks.onMessage,
        onerror: callbacks.onError,
        onclose: callbacks.onClose,
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        systemInstruction: 'You are AetherTrade AI, an expert voice assistant for real-time market trading. Be concise, professional, and helpful.',
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        }
      }
    });
  }
}

export const gemini = new GeminiService();