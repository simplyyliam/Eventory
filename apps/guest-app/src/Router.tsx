import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GuestListPage } from './pages/EventPage';
import { GuestDetailsScreen } from './pages/GuestDetailsScreen';
import { LoadingScreen } from './pages/LoadingScreen';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/events/:slug" element={<GuestListPage />} />
          <Route path="/events/:slug/guests/:guestId" element={<GuestDetailsScreen />} />
          <Route path='/loading' element={<LoadingScreen/>}/>
      </Routes>
    </BrowserRouter>
  );
};
