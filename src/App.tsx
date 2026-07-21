import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';
import { AuthModal } from './features/auth/AuthModal';
import { HomeScreen } from './features/home/HomeScreen';
import { MealScreen } from './features/meals/MealScreen';
import { WorkoutScreen } from './features/workouts/WorkoutScreen';
import { ProgressScreen } from './features/progress/ProgressScreen';
import { AiCoachScreen } from './features/ai-coach/AiCoachScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col max-w-md md:max-w-2xl lg:max-w-4xl mx-auto border-x border-zinc-900/50 shadow-2xl relative">
          {/* Header */}
          <AppHeader onOpenAi={() => {}} />

          {/* Main Content Viewport */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomeScreen onOpenAi={() => {}} />} />
              <Route path="/meals" element={<MealScreen />} />
              <Route path="/workouts" element={<WorkoutScreen />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/ai-coach" element={<AiCoachScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
          </main>

          {/* Bottom Navigation */}
          <BottomNav />

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
