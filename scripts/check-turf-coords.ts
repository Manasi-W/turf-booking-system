import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTurf() {
  const turfId = 'cmmoui86p006tve3gevdqszne'
  const turf = await prisma.turf.findUnique({
    where: { id: turfId },
    select: { id: true, name: true, lat: true, lng: true }
  })
  
  if (turf) {
    console.log(`Turf found: ${turf.name}`)
    console.log(`Lat: ${turf.lat}, Lng: ${turf.lng}`)
  } else {
    console.log(`Turf not found: ${turfId}`)
  }
}

checkTurf().finally(() => prisma.$disconnect())
