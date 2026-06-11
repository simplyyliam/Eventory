import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EventsList } from "./pages/EventsList";
import { DisplayScreen } from "./pages/DisplayScreen";
import { AppLayout } from "./pages/AppLayout";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/events" element={<AppLayout />}>
          <Route index element={<EventsList />} />
          <Route path=":slug" element={<DisplayScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};