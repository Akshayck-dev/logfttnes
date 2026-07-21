import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  CheckCircle2,
  Bot,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { useFitnessStore } from '../../stores/useFitnessStore';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { parseNaturalLanguageInput } from '../../lib/aiParser';
import { AiDetectedEntity } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  entity?: AiDetectedEntity;
  timestamp: string;
}

export const AiCoachScreen: React.FC = () => {
  const { addMeal, addWorkout, addWeight, addWater, addSleep, addAiLog } = useFitnessStore();
  const { isListening, transcript, errorMessage, startListening, stopListening, simulateVoiceInput } = useVoiceRecognition();

  const [inputPrompt, setInputPrompt] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "Hello! I'm your FitLog AI Coach. Tell me what you ate, your workout session, current weight, water, or sleep! For example: \"I ate 3 eggs and oats for breakfast\"",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (transcript && isListening) {
      setInputPrompt(transcript);
    }
  }, [transcript, isListening]);

  const handleSendPrompt = (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');

    // Parse Intent via AI Engine
    const entity = parseNaturalLanguageInput(query);
    addAiLog(query, entity);

    // Automatically apply intent to fitness stores
    if (entity.intent === 'meal' && entity.mealData) {
      addMeal({
        userId: 'user-default-1',
        mealType: entity.mealData.mealType || 'snack',
        title: entity.mealData.title || query,
        totalCalories: entity.mealData.totalCalories || 450,
        totalProteinG: entity.mealData.totalProteinG || 30,
        totalCarbsG: entity.mealData.totalCarbsG || 40,
        totalFatG: entity.mealData.totalFatG || 14,
        totalFiberG: 5,
        items: entity.mealData.items || [],
        loggedAt: new Date().toISOString()
      });
    } else if (entity.intent === 'workout' && entity.workoutData) {
      addWorkout({
        userId: 'user-default-1',
        title: entity.workoutData.title || 'Workout Session',
        category: entity.workoutData.category || 'strength',
        durationMinutes: entity.workoutData.durationMinutes || 45,
        caloriesBurned: entity.workoutData.caloriesBurned || 350,
        exercises: entity.workoutData.exercises || [],
        loggedAt: new Date().toISOString()
      });
    } else if (entity.intent === 'weight' && entity.weightData) {
      addWeight(entity.weightData.weightKg || 76.4);
    } else if (entity.intent === 'water' && entity.waterData) {
      addWater(entity.waterData.amountMl || 250);
    } else if (entity.intent === 'sleep' && entity.sleepData) {
      addSleep({
        durationHours: entity.sleepData.durationHours || 8,
        qualityScore: entity.sleepData.qualityScore || 4,
        sleepTime: entity.sleepData.sleepTime || new Date().toISOString(),
        wakeTime: entity.sleepData.wakeTime || new Date().toISOString(),
        loggedAt: new Date().toISOString().split('T')[0]
      });
    }

    // AI Response Message
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Got it! ${entity.summaryText}. I've recorded this into your dashboard.`,
        entity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 400);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((finalText) => {
        setInputPrompt(finalText);
        handleSendPrompt(finalText);
      });
    }
  };

  const handleSimulateClick = () => {
    simulateVoiceInput((simulatedText) => {
      setInputPrompt(simulatedText);
      handleSendPrompt(simulatedText);
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-20 px-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl gradient-purple text-white shadow-lg">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">AI Fitness Coach</h1>
            <p className="text-xs text-zinc-400">Natural language voice & text parser</p>
          </div>
        </div>

        {/* Voice Simulation Button */}
        <button
          onClick={handleSimulateClick}
          className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-500/30 active:scale-95 transition-all flex items-center gap-1.5"
          title="Test Voice Input with AI Sample"
        >
          <Volume2 className="w-3.5 h-3.5" /> Test Voice
        </button>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleSimulateClick}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-white font-bold text-[10px] whitespace-nowrap"
          >
            Use Simulation
          </button>
        </motion.div>
      )}

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
        {[
          'I ate 3 eggs & 50g oats',
          'Completed 45 min chest workout',
          'Weighed 76.5 kg today',
          'Drank 750ml water',
          'Slept 8 hours'
        ].map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(promptText)}
            className="px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold text-purple-300 border border-purple-500/30 whitespace-nowrap hover:bg-purple-500/20 active:scale-95 transition-all"
          >
            "{promptText}"
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-1 py-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-3xl text-xs sm:text-sm font-medium space-y-2 ${
                msg.sender === 'user'
                  ? 'gradient-purple text-white rounded-br-none shadow-lg'
                  : 'glass-card border border-white/10 text-zinc-100 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-2">
                {msg.sender === 'ai' && <Bot className="w-4 h-4 text-purple-400" />}
                <span>{msg.text}</span>
              </div>

              {/* Parsed Entity Summary Card */}
              {msg.entity && (
                <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Automatically Saved to Dashboard
                  </span>
                  <p className="text-[11px] text-zinc-300 font-semibold">{msg.entity.summaryText}</p>
                </div>
              )}

              <span className="text-[9px] opacity-60 text-right block pt-1">{msg.timestamp}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Recording Visualizer Banner */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-2 p-3 rounded-2xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-between text-xs text-purple-200"
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold">Listening to voice...</span>
          </div>
          <span className="text-[10px] text-purple-300 italic max-w-[200px] truncate">
            {transcript || 'Speak now...'}
          </span>
        </motion.div>
      )}

      {/* Chat Input Bar */}
      <div className="pt-2 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-3.5 rounded-2xl text-white shadow-md transition-all ${
              isListening ? 'bg-rose-600 animate-pulse' : 'glass-card border border-white/10 hover:bg-white/10'
            }`}
            title={isListening ? 'Stop listening' : 'Start Voice Dictation'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            placeholder="Type or speak: 'I ate a chicken salad', 'Ran 5km'..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 glass-input rounded-2xl p-3.5 text-xs font-bold text-white shadow-inner"
          />

          <button
            type="submit"
            className="p-3.5 rounded-2xl gradient-purple text-white shadow-lg active:scale-95 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
