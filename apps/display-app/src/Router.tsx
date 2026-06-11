import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EventsList } from "./pages/EventsList";
import { DisplayScreen } from "./pages/DisplayScreen";
import { AppLayout } from "./pages/AppLayout";


export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index path="/events" element={<EventsList />} />
          <Route path="/events/:slug" element={<DisplayScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};