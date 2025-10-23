import { useState, useEffect } from 'react';

export interface VoiceCommand {
  command: string;
  action: () => void;
  confidence: number;
}

export class VoiceCommandHandler {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private commands: VoiceCommand[] = [];
  private onResult: (text: string) => void = () => {};

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      this.onResult(transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  addCommand(command: string, action: () => void, confidence = 0.8) {
    this.commands.push({ command: command.toLowerCase(), action, confidence });
  }

  setOnResult(callback: (text: string) => void) {
    this.onResult = callback;
  }

  private processCommand(transcript: string) {
    const matchedCommand = this.commands.find(cmd => 
      transcript.includes(cmd.command) && 
      this.calculateSimilarity(transcript, cmd.command) >= cmd.confidence
    );

    if (matchedCommand) {
      matchedCommand.action();
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  startListening() {
    if (!this.recognition || this.isListening) return;
    
    this.isListening = true;
    this.recognition.start();
  }

  stopListening() {
    if (!this.recognition || !this.isListening) return;
    
    this.recognition.stop();
    this.isListening = false;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           (window.SpeechRecognition || window.webkitSpeechRecognition) !== undefined;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

// Predefined voice commands for content creation
export const createContentVoiceCommands = (
  onGenerateContent: () => void,
  onSaveContent: () => void,
  onClearForm: () => void,
  onShowTrends: () => void,
  onShowAnalytics: () => void
): VoiceCommand[] => [
  {
    command: 'generate content',
    action: onGenerateContent,
    confidence: 0.8
  },
  {
    command: 'create content plan',
    action: onGenerateContent,
    confidence: 0.8
  },
  {
    command: 'save content',
    action: onSaveContent,
    confidence: 0.8
  },
  {
    command: 'save plan',
    action: onSaveContent,
    confidence: 0.8
  },
  {
    command: 'clear form',
    action: onClearForm,
    confidence: 0.8
  },
  {
    command: 'reset form',
    action: onClearForm,
    confidence: 0.8
  },
  {
    command: 'show trends',
    action: onShowTrends,
    confidence: 0.8
  },
  {
    command: 'trending topics',
    action: onShowTrends,
    confidence: 0.8
  },
  {
    command: 'show analytics',
    action: onShowAnalytics,
    confidence: 0.8
  },
  {
    command: 'analytics dashboard',
    action: onShowAnalytics,
    confidence: 0.8
  }
];

// Voice command component for React
export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceHandler, setVoiceHandler] = useState<VoiceCommandHandler | null>(null);

  useEffect(() => {
    const handler = new VoiceCommandHandler();
    handler.setOnResult(setTranscript);
    setVoiceHandler(handler);

    return () => {
      handler.stopListening();
    };
  }, []);

  const startListening = () => {
    if (voiceHandler) {
      voiceHandler.startListening();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (voiceHandler) {
      voiceHandler.stopListening();
      setIsListening(false);
    }
  };

  const addCommand = (command: string, action: () => void, confidence = 0.8) => {
    if (voiceHandler) {
      voiceHandler.addCommand(command, action, confidence);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    addCommand,
    isSupported: voiceHandler?.isSupported() || false
  };
};
