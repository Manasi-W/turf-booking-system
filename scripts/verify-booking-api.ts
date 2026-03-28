import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testApi() {
  const turf = await prisma.turf.findFirst()
  if (!turf) return

  console.log(`Testing API for Turf: ${turf.id}`)
  
  // Directly simulate the API logic
  const bookings = await prisma.booking.findMany({
    where: { turfId: turf.id, paymentStatus: { in: ["PAID", "PENDING"] } },
    select: { date: true, startTime: true, endTime: true }
  })

  console.log(`Found ${bookings.length} bookings:`)
  bookings.forEach(b => console.log(`- ${b.date.toISOString().split('T')[0]} ${b.startTime}-${b.endTime}`))
}

testApi().finally(() => prisma.$disconnect())
