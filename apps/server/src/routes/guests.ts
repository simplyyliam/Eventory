import express from "express"
import { prisma } from "@app/database"

const router = express.Router()

router.get('/:guestId', async (req, res) => {
    const { guestId } = req.body

    try {
        const guest = await prisma.guest.findUnique({
            where: {
                id: guestId
            }
        })
        if(!guest) {
            return res.status(404).json({ error: "Guest not found" })
        }

        res.json(guest)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch guest" })
    }
})

export default router