import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const turfs = await prisma.turf.findMany()
  const coords = [
    { lat: 19.1235, lng: 72.8903 }, // Mumbai Example
    { lat: 19.1550, lng: 72.8480 }, // Mumbai Example 2
    { lat: 19.0800, lng: 72.9000 }, // Mumbai Example 3
    { lat: 19.2100, lng: 72.8500 }, // Mumbai Example 4
  ]

  for (let i = 0; i < turfs.length; i++) {
    const coord = coords[i % coords.length]
    await prisma.turf.update({
      where: { id: turfs[i].id },
      data: { 
        lat: coord.lat, 
        lng: coord.lng 
      }
    })
    console.log(`Updated ${turfs[i].name} with ${coord.lat}, ${coord.lng}`)
  }
}

main().finally(() => prisma.$disconnect())
