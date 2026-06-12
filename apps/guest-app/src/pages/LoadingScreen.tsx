import { LoadingBar } from "@app/shared"
import type { EventResponse } from "@app/shared/types/event.types"
import { API_BASE_URL } from "@app/shared/utils/api"
import axios from "axios"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"


export const LoadingScreen = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const { destination, slug, guestId } = location.state ?? {}

    const [guest, setGuest] = useState<EventResponse | null>(null)
    const [event, setEvent] = useState<EventResponse | null>(null)
    const [dataReady, setDataReady] = useState(false)
    const [animationReady, setAnimationReady] = useState(false)

    useEffect(() => {
        if(!guestId || !slug) return

        Promise.all([
            axios.get(`${API_BASE_URL}/events/${slug}/guests/${guestId}`),
            axios.get(`${API_BASE_URL}/events/${slug}`)
        ])
        .then(([guestRes, eventRes]) => {
            setGuest(guestRes.data)
            setEvent(eventRes.data)
        })
        .finally(() => {
            setDataReady(true)
        })
    }, [slug, guestId])

    useEffect(() => {
        if(!dataReady || !animationReady) return

        navigate(destination, {
            replace: true,
            state: {
                guest,
                event
            }
        })
    }, [dataReady, animationReady, guest, destination, navigate])

    return (
        <div className="flex flex-col gap-2.5 text-center font-dmSans font-medium items-center justify-center w-full h-screen Dotted">
            <span>Generating your ticket</span>
            <LoadingBar onComplete={() => setAnimationReady(true)}/>
        </div>
    )
}