import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WardrobeProvider, OutfitProvider, WearLogProvider } from './contexts';
import { ToastProvider } from './components/common';
import { AppShell } from './components/layout';
import { WardrobePage, OutfitsPage, CalendarPage, StatsPage, SettingsPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <WardrobeProvider>
          <OutfitProvider>
            <WearLogProvider>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<WardrobePage />} />
                  <Route path="/outfits" element={<OutfitsPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </WearLogProvider>
          </OutfitProvider>
        </WardrobeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
