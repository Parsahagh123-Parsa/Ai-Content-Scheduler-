'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

interface VoiceCommandsHook {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  commands: VoiceCommand[];
  addCommand: (command: VoiceCommand) => void;
  removeCommand: (command: string) => void;
  clearTranscript: () => void;
}

export function useVoiceCommands(): VoiceCommandsHook {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);
          
          // Process commands when we have final results
          if (finalTranscript) {
            processCommand(finalTranscript.toLowerCase().trim());
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Default commands
    const defaultCommands: VoiceCommand[] = [
      {
        command: 'generate content',
        action: () => {
          const generateBtn = document.querySelector('[data-voice-action="generate"]') as HTMLButtonElement;
          if (generateBtn) generateBtn.click();
        },
        description: 'Generate new content plan'
      },
      {
        command: 'optimize post',
        action: () => {
          const optimizeBtn = document.querySelector('[data-voice-action="optimize"]') as HTMLButtonElement;
          if (optimizeBtn) optimizeBtn.click();
        },
        description: 'Optimize current post for virality'
      },
      {
        command: 'open dashboard',
        action: () => {
          const dashboardBtn = document.querySelector('[data-voice-action="dashboard"]') as HTMLButtonElement;
          if (dashboardBtn) dashboardBtn.click();
        },
        description: 'Open 3D dashboard'
      },
      {
        command: 'show trends',
        action: () => {
          const trendsBtn = document.querySelector('[data-voice-action="trends"]') as HTMLButtonElement;
          if (trendsBtn) trendsBtn.click();
        },
        description: 'Show trending topics'
      },
      {
        command: 'ai coach',
        action: () => {
          const coachBtn = document.querySelector('[data-voice-action="coach"]') as HTMLButtonElement;
          if (coachBtn) coachBtn.click();
        },
        description: 'Open AI coaching chat'
      },
      {
        command: 'pricing',
        action: () => {
          const pricingBtn = document.querySelector('[data-voice-action="pricing"]') as HTMLButtonElement;
          if (pricingBtn) pricingBtn.click();
        },
        description: 'Show pricing plans'
      },
      {
        command: 'help',
        action: () => {
          showVoiceHelp();
        },
        description: 'Show available voice commands'
      },
      {
        command: 'stop listening',
        action: () => {
          stopListening();
        },
        description: 'Stop voice recognition'
      }
    ];

    setCommands(defaultCommands);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processCommand = (command: string) => {
    // Find matching command
    const matchedCommand = commands.find(cmd => 
      command.includes(cmd.command) || cmd.command.includes(command)
    );

    if (matchedCommand) {
      // Add visual feedback
      showVoiceFeedback(`Executing: ${matchedCommand.description}`);
      matchedCommand.action();
    } else {
      // Try fuzzy matching
      const fuzzyMatch = findFuzzyMatch(command, commands);
      if (fuzzyMatch) {
        showVoiceFeedback(`Did you mean: ${fuzzyMatch.description}?`);
      } else {
        showVoiceFeedback(`Command not recognized. Say "help" for available commands.`);
      }
    }
  };

  const findFuzzyMatch = (command: string, commandList: VoiceCommand[]): VoiceCommand | null => {
    const words = command.split(' ');
    let bestMatch: VoiceCommand | null = null;
    let bestScore = 0;

    for (const cmd of commandList) {
      const cmdWords = cmd.command.split(' ');
      let score = 0;
      
      for (const word of words) {
        for (const cmdWord of cmdWords) {
          if (cmdWord.includes(word) || word.includes(cmdWord)) {
            score++;
          }
        }
      }
      
      if (score > bestScore && score > 0) {
        bestScore = score;
        bestMatch = cmd;
      }
    }

    return bestMatch;
  };

  const showVoiceFeedback = (message: string) => {
    // Create or update feedback element
    let feedbackEl = document.getElementById('voice-feedback');
    if (!feedbackEl) {
      feedbackEl = document.createElement('div');
      feedbackEl.id = 'voice-feedback';
      feedbackEl.className = 'fixed top-4 right-4 z-50 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg max-w-sm';
      document.body.appendChild(feedbackEl);
    }
    
    feedbackEl.textContent = message;
    feedbackEl.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (feedbackEl) {
        feedbackEl.style.display = 'none';
      }
    }, 3000);
  };

  const showVoiceHelp = () => {
    const helpText = commands.map(cmd => `• "${cmd.command}" - ${cmd.description}`).join('\n');
    showVoiceFeedback(`Available commands:\n${helpText}`);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        showVoiceFeedback('🎤 Listening... Say a command');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        showVoiceFeedback('Error starting voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      showVoiceFeedback('Voice recognition stopped');
    }
  };

  const addCommand = (command: VoiceCommand) => {
    setCommands(prev => [...prev, command]);
  };

  const removeCommand = (command: string) => {
    setCommands(prev => prev.filter(cmd => cmd.command !== command));
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    commands,
    addCommand,
    removeCommand,
    clearTranscript
  };
}

// Voice command component
export function VoiceCommandButton() {
  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    clearTranscript
  } = useVoiceCommands();

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <p className="text-yellow-800">
          Voice commands are not supported in this browser. Please use Chrome or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
          }`}
        >
          {isListening ? '🛑 Stop Listening' : '🎤 Start Voice Commands'}
        </button>
        
        {transcript && (
          <button
            onClick={clearTranscript}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      
      {transcript && (
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 max-w-md">
          <p className="text-white text-sm">
            <span className="font-semibold">You said:</span> {transcript}
          </p>
        </div>
      )}
      
      <div className="text-center text-gray-300 text-sm">
        <p>Try saying: "generate content", "optimize post", "show trends", or "help"</p>
      </div>
    </div>
  );
}

// Voice command integration for existing components
export function addVoiceDataAttributes() {
  // Add data attributes to buttons for voice command integration
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    const text = button.textContent?.toLowerCase() || '';
    
    if (text.includes('generate') || text.includes('content')) {
      button.setAttribute('data-voice-action', 'generate');
    } else if (text.includes('optimize') || text.includes('virality')) {
      button.setAttribute('data-voice-action', 'optimize');
    } else if (text.includes('dashboard') || text.includes('3d')) {
      button.setAttribute('data-voice-action', 'dashboard');
    } else if (text.includes('trend') || text.includes('trending')) {
      button.setAttribute('data-voice-action', 'trends');
    } else if (text.includes('coach') || text.includes('chat')) {
      button.setAttribute('data-voice-action', 'coach');
    } else if (text.includes('pricing') || text.includes('upgrade')) {
      button.setAttribute('data-voice-action', 'pricing');
    }
  });
}

// Auto-initialize voice commands
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', addVoiceDataAttributes);
}
