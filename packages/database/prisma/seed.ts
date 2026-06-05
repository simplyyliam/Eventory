import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean slate
  await prisma.guest.deleteMany()
  await prisma.table.deleteMany()
  await prisma.event.deleteMany()

  const wedding = await prisma.event.create({
    data: {
      name: "Sarah's Wedding",
      slug: "sarahs-wedding",
      status: 'draft',
      tables: {
        create: [
          { name: 'Table 1', tableNumber: 1, seatCount: 8, shape: 'circle',    textureId: 'white-oak' },
          { name: 'Table 2', tableNumber: 2, seatCount: 8, shape: 'rectangle', textureId: 'white-oak' },
          { name: 'Table 3', tableNumber: 3, seatCount: 8, shape: 'circle',    textureId: 'dark-walnut' },
        ],
      },
    },
    include: { tables: true },
  })

  const [t1, t2, t3] = wedding.tables.sort((a, b) => a.tableNumber - b.tableNumber)

  await prisma.guest.createMany({
    data: [
      {
        name: 'Liam',
        email: null,
        dietary: [],
        comments: null,
        status: 'confirmed',
        seat: `${t2.id}-seat-7`,
        tableId: t2.id,
        eventId: wedding.id,
      },
      {
        name: 'Joe Doe',
        email: 'joedoe@gmail.com',
        dietary: ['Nut-Free', 'Halal', 'Shellfish-Free'],
        comments: 'Good food!',
        status: 'confirmed',
        seat: `${t1.id}-seat-7`,
        tableId: t1.id,
        eventId: wedding.id,
      },
      {
        name: 'Marry Doe',
        email: 'marrydoe@gmail.com',
        dietary: ['Nut-Free', 'Shellfish-Free', 'Vegetarian'],
        comments: 'Not bad',
        status: 'confirmed',
        seat: `${t1.id}-seat-6`,
        tableId: t1.id,
        eventId: wedding.id,
      },
      {
        name: 'Sarah Doe',
        email: 'sarahdoe@gmail.com',
        dietary: ['Vegan', 'Dairy-Free', 'Egg-Free'],
        comments: 'Great',
        status: 'pending',
        seat: `${t1.id}-seat-5`,
        tableId: t1.id,
        eventId: wedding.id,
      },
      {
        name: 'John Wilson',
        email: 'johnwilson@gmail.com',
        dietary: ['Dairy-Free'],
        comments: 'Could be better',
        status: 'pending',
        seat: `${t3.id}-seat-7`,
        tableId: t3.id,
        eventId: wedding.id,
      },
      // Unseated guests
      {
        name: 'Emma Clarke',
        email: 'emma@gmail.com',
        dietary: ['Gluten-Free'],
        comments: null,
        status: 'pending',
        seat: null,
        tableId: null,
        eventId: wedding.id,
      },
      {
        name: 'James Patel',
        email: 'james@gmail.com',
        dietary: [],
        comments: null,
        status: 'pending',
        seat: null,
        tableId: null,
        eventId: wedding.id,
      },
    ],
  })

  console.log(`✅ Created event: ${wedding.name}`)
  console.log(`   Tables: ${wedding.tables.length}`)
  console.log(`   Guests: 7 (5 seated, 2 unseated)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })