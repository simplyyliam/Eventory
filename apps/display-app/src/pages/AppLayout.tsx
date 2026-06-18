import { Outlet } from "react-router-dom"


export const AppLayout = () => (
  <div className="flex items-center justify-center w-screen h-screen bg-[url('/SilverEye.jpg')] bg-cover bg-center">
    <Outlet />
  </div>
);