import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  X,
  CheckCircle2,
  Edit3,
  Save,
  Volume2,
  Utensils,
  Dumbbell,
  Scale,
  Droplets,
  Moon,
  AlertCircle
} from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { parseNaturalLanguageWithGemini } from '../../lib/aiParser';
import { AiDetectedEntity } from '../../types';
import { useFitnessStore } from '../../stores/useFitnessStore';

interface AiQuickLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiQuickLogSheet: React.FC<AiQuickLogSheetProps> = ({ isOpen, onClose }) => {
  const { addMeal, addWorkout, addWeight, addWater, addSleep, addAiLog } = useFitnessStore();
  const { isListening, transcript, errorMessage, startListening, stopListening, simulateVoiceInput } = useVoiceRecognition();

  const [promptText, setPromptText] = useState('');
  const [detectedEntity, setDetectedEntity] = useState<AiDetectedEntity | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    if (transcript && isListening) {
      setPromptText(transcript);
    }
  }, [transcript, isListening]);

  const handleProcessPrompt = async (textOverride?: string) => {
    const textToParse = textOverride || promptText;
    if (!textToParse.trim()) return;

    const entity = await parseNaturalLanguageWithGemini(textToParse);
    setDetectedEntity(entity);
  };

  const handleConfirmSave = () => {
    if (!detectedEntity) return;

    const query = promptText || 'Natural language entry';
    addAiLog(query, detectedEntity);

    if (detectedEntity.intent === 'meal' && detectedEntity.mealData) {
      addMeal({
        userId: 'user-default-1',
        mealType: detectedEntity.mealData.mealType || 'snack',
        title: detectedEntity.mealData.title || query,
        totalCalories: detectedEntity.mealData.totalCalories || 450,
        totalProteinG: detectedEntity.mealData.totalProteinG || 30,
        totalCarbsG: detectedEntity.mealData.totalCarbsG || 40,
        totalFatG: detectedEntity.mealData.totalFatG || 14,
        totalFiberG: 5,
        items: detectedEntity.mealData.items || [],
        loggedAt: new Date().toISOString()
      });
    } else if (detectedEntity.intent === 'workout' && detectedEntity.workoutData) {
      addWorkout({
        userId: 'user-default-1',
        title: detectedEntity.workoutData.title || 'Workout Session',
        category: detectedEntity.workoutData.category || 'strength',
        durationMinutes: detectedEntity.workoutData.durationMinutes || 45,
        caloriesBurned: detectedEntity.workoutData.caloriesBurned || 350,
        exercises: detectedEntity.workoutData.exercises || [],
        loggedAt: new Date().toISOString()
      });
    } else if (detectedEntity.intent === 'weight' && detectedEntity.weightData) {
      addWeight(detectedEntity.weightData.weightKg || 76.4);
    } else if (detectedEntity.intent === 'water' && detectedEntity.waterData) {
      addWater(detectedEntity.waterData.amountMl || 250);
    } else if (detectedEntity.intent === 'sleep' && detectedEntity.sleepData) {
      addSleep({
        durationHours: detectedEntity.sleepData.durationHours || 8,
        qualityScore: detectedEntity.sleepData.qualityScore || 4,
        sleepTime: detectedEntity.sleepData.sleepTime || new Date().toISOString(),
        wakeTime: detectedEntity.sleepData.wakeTime || new Date().toISOString(),
        loggedAt: new Date().toISOString().split('T')[0]
      });
    }

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      setDetectedEntity(null);
      setPromptText('');
      onClose();
    }, 1200);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((finalText) => {
        setPromptText(finalText);
        handleProcessPrompt(finalText);
      });
    }
  };

  const handleSimulateVoice = () => {
    simulateVoiceInput((simulatedText) => {
      setPromptText(simulatedText);
      handleProcessPrompt(simulatedText);
    });
  };

  const presetPrompts = [
    { label: "🍗 I had chicken & rice", query: "I ate grilled chicken breast and rice for lunch" },
    { label: "🏋 I completed chest workout", query: "Completed 45 min chest workout squatted 80kg" },
    { label: "💧 I drank 500ml water", query: "Drank 500ml water" },
    { label: "⚖ My weight is 79.4 kg", query: "My weight today is 79.4 kg" }
  ];

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'meal': return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'workout': return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case 'weight': return <Scale className="w-5 h-5 text-purple-400" />;
      case 'water': return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'sleep': return <Moon className="w-5 h-5 text-indigo-400" />;
      default: return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xl"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto glass-card rounded-t-[40px] border-t border-white/20 p-6 z-10 no-scrollbar shadow-2xl space-y-6"
          >
            {/* iOS Pill Handle */}
            <div className="flex justify-center">
              <div className="w-12 h-1.5 bg-zinc-600/60 rounded-full" />
            </div>

            {/* Sheet Title */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">What happened today?</h3>
                <p className="text-xs text-purple-300 font-semibold mt-0.5">
                  "Just talk. We'll track everything."
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={handleSimulateVoice}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-white font-bold text-[10px]"
                >
                  Simulation
                </button>
              </div>
            )}

            {/* Confirmation Card when Entity Detected */}
            {detectedEntity && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-3xl glass-card border border-purple-500/40 bg-gradient-to-br from-purple-950/40 to-black space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/10">
                      {getIntentIcon(detectedEntity.intent)}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 block">
                        Detected Intent
                      </span>
                      <h4 className="text-sm font-extrabold text-white capitalize">
                        {detectedEntity.intent} Logged
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {Math.round(detectedEntity.confidence * 100)}% Confidence
                  </span>
                </div>

                <p className="text-xs text-zinc-200 font-semibold leading-relaxed">
                  {detectedEntity.summaryText}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleConfirmSave}
                    className="flex-1 py-3 rounded-2xl gradient-purple text-white font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isSavedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Confirm & Save Log
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDetectedEntity(null)}
                    className="px-4 py-3 rounded-2xl bg-white/10 text-zinc-300 hover:text-white font-bold text-xs border border-white/10 active:scale-95 transition-all"
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            )}

            {/* Large Microphone Dictation Pulsing Button */}
            <div className="flex flex-col items-center justify-center space-y-3 py-2">
              <button
                onClick={handleMicToggle}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
                  isListening
                    ? 'bg-rose-600 animate-pulse ring-8 ring-rose-500/30 scale-105'
                    : 'gradient-purple hover:scale-105 active:scale-95'
                }`}
              >
                {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
              <span className="text-xs font-bold text-zinc-400">
                {isListening ? 'Listening... Speak now' : 'Tap microphone to speak'}
              </span>

              {/* Simulation Pill */}
              <button
                onClick={handleSimulateVoice}
                className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1 mt-1"
              >
                <Volume2 className="w-3.5 h-3.5" /> Test Voice Simulation
              </button>
            </div>

            {/* Text Input Area & Action */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder='Or type naturally: "I ate 2 eggs and oats for breakfast"'
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="flex-1 glass-input rounded-2xl p-3.5 text-xs text-white resize-none"
                />
                <button
                  onClick={() => handleProcessPrompt()}
                  className="px-4 rounded-2xl gradient-purple text-white font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Suggested Prompts Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Suggested Prompts
              </span>
              <div className="grid grid-cols-2 gap-2">
                {presetPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptText(p.query);
                      handleProcessPrompt(p.query);
                    }}
                    className="glass-card-interactive p-3 rounded-2xl text-left text-xs font-semibold text-zinc-300 border border-white/10 hover:border-purple-500/40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
