import { LoadingBar } from "@app/shared"
import { API_BASE_URL } from "@app/shared/utils/api"
import axios from "axios"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"


export const LoadingScreen = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const { destination, slug, guestId } = location.state ?? {}

    const [guest, setGuest] = useState(null)
    const [dataReady, setDataReady] = useState(false)
    const [animationReady, setAnimationReady] = useState(false)

    useEffect(() => {
        if(!guestId || !slug) return

        axios
            .get(`${API_BASE_URL}/events/${slug}/guests/${guestId}`)
            .then((res) => setGuest(res.data))
            .finally(() => {setDataReady(true)})
    }, [slug, guestId])

    useEffect(() => {
        if(!dataReady || !animationReady) return

        navigate(destination, {
            replace: true,
            state: {
                guest,
            }
        })
    }, [dataReady, animationReady, guest, destination, navigate])

    return (
        <div className="flex flex-col gap-2.5 text-center items-center justify-center w-full h-screen Dotted">
            <span>Generating your ticket</span>
            <LoadingBar onComplete={() => setAnimationReady(true)}/>
        </div>
    )
}