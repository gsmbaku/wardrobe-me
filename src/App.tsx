import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WardrobeProvider, OutfitProvider, WearLogProvider, NotesProvider, StorageSpaceProvider } from './contexts';
import { ToastProvider } from './components/common';
import { AppShell } from './components/layout';
import { WardrobePage, OutfitsPage, CalendarPage, StatsPage, SettingsPage, NotesPage, OrganizePage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <WardrobeProvider>
          <OutfitProvider>
            <WearLogProvider>
              <NotesProvider>
                <StorageSpaceProvider>
                  <Routes>
                    <Route element={<AppShell />}>
                      <Route path="/" element={<WardrobePage />} />
                      <Route path="/outfits" element={<OutfitsPage />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/stats" element={<StatsPage />} />
                      <Route path="/notes" element={<NotesPage />} />
                      <Route path="/organize" element={<OrganizePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                  </Routes>
                </StorageSpaceProvider>
              </NotesProvider>
            </WearLogProvider>
          </OutfitProvider>
        </WardrobeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
