import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WardrobeProvider, OutfitProvider, WearLogProvider, NotesProvider, StorageSpaceProvider, ChatProvider, EventProvider } from './contexts';
import { ToastProvider } from './components/common';
import { AppShell } from './components/layout';
import { WardrobePage, OutfitsPage, CalendarPage, StatsPage, SettingsPage, NotesPage, OrganizePage, AssistantPage, EventsPage, ItemPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <WardrobeProvider>
          <OutfitProvider>
            <WearLogProvider>
              <NotesProvider>
                <StorageSpaceProvider>
                  <ChatProvider>
                    <EventProvider>
                      <Routes>
                        <Route element={<AppShell />}>
                          <Route path="/" element={<WardrobePage />} />
                          <Route path="/items/:id" element={<ItemPage />} />
                          <Route path="/outfits" element={<OutfitsPage />} />
                          <Route path="/calendar" element={<CalendarPage />} />
                          <Route path="/stats" element={<StatsPage />} />
                          <Route path="/notes" element={<NotesPage />} />
                          <Route path="/organize" element={<OrganizePage />} />
                          <Route path="/assistant" element={<AssistantPage />} />
                          <Route path="/events" element={<EventsPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                      </Routes>
                    </EventProvider>
                  </ChatProvider>
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
