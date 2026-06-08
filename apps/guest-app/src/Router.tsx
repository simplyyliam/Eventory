import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GuestListPage } from './pages/EventPage';
import { WelcomeScreen } from './pages/WelcomeScreen';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/events/:slug" element={<GuestListPage />} />
          <Route path="/guests/:guestId" element={<WelcomeScreen />} />
      </Routes>
    </BrowserRouter>
  );
};
