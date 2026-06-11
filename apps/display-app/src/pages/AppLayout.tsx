import { Outlet } from "react-router-dom"


export const AppLayout = () => {
    return (
        <div className="flex items-center justify-center w-screen h-screen bg-[url('/mosh.jpg')] bg-cover bg-center mesh-gradient">
            <Outlet/>
        </div>
    )
}