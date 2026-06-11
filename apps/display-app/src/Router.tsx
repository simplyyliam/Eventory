import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { EventsList } from "./pages/EventsList";
import { DisplayScreen } from "./pages/DisplayScreen";
import { AppLayout } from "./pages/AppLayout";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />

        <Route path="/events" element={<AppLayout />}>
          <Route index element={<EventsList />} />
          <Route path=":slug" element={<DisplayScreen />} />
        </Route>

        {/* optional safety net */}
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </BrowserRouter>
  );
};