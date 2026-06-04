import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { EventPage } from './components';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/events/:slug' element={<EventPage/>}/>
      </Routes>
    </BrowserRouter>
  );
};
