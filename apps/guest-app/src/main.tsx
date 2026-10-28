import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import './index.css';
import { EventPage } from './pages/EventPage';
import { GuestPage } from './pages/GuestPage';
import { StatusScreen } from './components/Screen';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route path="/events/:slug" element={<EventPage />} />
          <Route path="/events/:slug/guests/:guestId" element={<GuestPage />} />
          {/* old QR codes pointed here via the loading screen */}
          <Route path="/loading" element={<Navigate to="/" replace />} />
          <Route path="*" element={<StatusScreen title="Scan your invitation" body="Open the link or QR code your host shared to find your seat." />} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
