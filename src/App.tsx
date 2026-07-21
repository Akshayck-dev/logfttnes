import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';
import { AuthModal } from './features/auth/AuthModal';
import { AiQuickLogSheet } from './components/common/AiQuickLogSheet';
import { SkeletonCard, SkeletonRing } from './components/common/Skeleton';

// Code Splitting / Lazy Loading for Performance Optimization
const HomeScreen = lazy(() => import('./features/home/HomeScreen').then((m) => ({ default: m.HomeScreen })));
const JournalScreen = lazy(() => import('./features/journal/JournalScreen').then((m) => ({ default: m.JournalScreen })));
const MealScreen = lazy(() => import('./features/meals/MealScreen').then((m) => ({ default: m.MealScreen })));
const WorkoutScreen = lazy(() => import('./features/workouts/WorkoutScreen').then((m) => ({ default: m.WorkoutScreen })));
const ProgressScreen = lazy(() => import('./features/progress/ProgressScreen').then((m) => ({ default: m.ProgressScreen })));
const AiCoachScreen = lazy(() => import('./features/ai-coach/AiCoachScreen').then((m) => ({ default: m.AiCoachScreen })));
const SettingsScreen = lazy(() => import('./features/settings/SettingsScreen').then((m) => ({ default: m.SettingsScreen })));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="space-y-4 p-4">
    <SkeletonRing />
    <div className="grid grid-cols-2 gap-3">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

export function App() {
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col max-w-md md:max-w-2xl lg:max-w-4xl mx-auto border-x border-zinc-900/50 shadow-2xl relative">
          {/* Header */}
          <AppHeader onOpenAi={() => setIsAiSheetOpen(true)} />

          {/* Main Content Viewport */}
          <main className="flex-1" aria-label="Fitness Tracking Viewport">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<HomeScreen onOpenAiLog={() => setIsAiSheetOpen(true)} />} />
                <Route path="/journal" element={<JournalScreen onOpenAiLog={() => setIsAiSheetOpen(true)} />} />
                <Route path="/meals" element={<MealScreen />} />
                <Route path="/workouts" element={<WorkoutScreen />} />
                <Route path="/progress" element={<ProgressScreen />} />
                <Route path="/ai-coach" element={<AiCoachScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
              </Routes>
            </Suspense>
          </main>

          {/* Floating Navigation */}
          <BottomNav onOpenAiLog={() => setIsAiSheetOpen(true)} />

          {/* AI Quick Log Sheet */}
          <AiQuickLogSheet
            isOpen={isAiSheetOpen}
            onClose={() => setIsAiSheetOpen(false)}
          />

          {/* PWA Installation Prompt */}
          <PwaInstallPrompt />

          {/* Auth Modal */}
          <AuthModal />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
