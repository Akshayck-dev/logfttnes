import { useState, useRef, useCallback } from 'react';

const voiceSimulations = [
  "I ate 3 scrambled eggs, 2 slices of whole wheat toast and half an avocado for breakfast",
  "Just finished a 45 minute chest and triceps workout, squatted 90kg",
  "My weight today is 76.2 kilograms",
  "I drank 750ml of cold water after my run",
  "Slept 8 hours last night with deep REM sleep quality 5"
];

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback((onFinalTranscript?: (text: string) => void) => {
    setErrorMessage(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser environment. Try Chrome, Edge, or iOS Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (event.results[0].isFinal && onFinalTranscript) {
          onFinalTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in browser settings.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please try speaking closer to your microphone.');
        } else {
          setErrorMessage(`Speech error: ${event.error}. Use keyboard or quick simulation.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
      setErrorMessage('Could not initialize speech recognition. Check microphone access.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const simulateVoiceInput = useCallback((onSimulatedText?: (text: string) => void) => {
    setIsListening(true);
    setErrorMessage(null);
    setTranscript('Listening to voice input...');

    setTimeout(() => {
      const sample = voiceSimulations[Math.floor(Math.random() * voiceSimulations.length)];
      setTranscript(sample);
      setIsListening(false);
      if (onSimulatedText) {
        onSimulatedText(sample);
      }
    }, 1200);
  }, []);

  return {
    isListening,
    transcript,
    errorMessage,
    startListening,
    stopListening,
    simulateVoiceInput
  };
}
