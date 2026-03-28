import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  // Find a turf
  const turf = await prisma.turf.findFirst({
    include: { slots: true }
  })

  if (!turf) {
    console.log("No turf found to test")
    return
  }

  console.log(`Testing Turf: ${turf.name} (${turf.id})`)
  console.log(`Current Slots:`, turf.slots.map(s => `${s.dayOfWeek}: ${s.startTime}-${s.endTime} (${s.active})`))

  const testDate = new Date()
  const dayOfWeek = testDate.getDay()

  // 1. Test invalid slot (e.g., 03:00-04:00 which likely doesn't exist)
  const invalidStartTime = "03:00"
  const invalidEndTime = "04:00"

  console.log(`\nCase 1: Invalid slot (${invalidStartTime}-${invalidEndTime})`)
  const isSlotAvailable1 = turf.slots.some(slot => {
     return slot.dayOfWeek === dayOfWeek && slot.active && invalidStartTime >= slot.startTime && invalidEndTime <= slot.endTime;
  });
  console.log(`Expected result: Should fail. Internal logic says available? ${isSlotAvailable1}`)

  // 2. Test valid slot if exists
  const activeToday = turf.slots.find(s => s.dayOfWeek === dayOfWeek && s.active)
  if (activeToday) {
    console.log(`\nCase 2: Valid slot (${activeToday.startTime}-${activeToday.endTime})`)
    console.log(`Expected result: Should pass validation (might still fail due to existing booking)`)
  } else {
    console.log(`\nCase 2: No active slot today. Creating one for test...`)
    const newSlot = await prisma.timeSlot.create({
        data: {
            turfId: turf.id,
            dayOfWeek,
            startTime: "12:00",
            endTime: "13:00",
            active: true
        }
    })
    console.log(`Created test slot: ${newSlot.startTime}-${newSlot.endTime}`)
  }
}

test().finally(() => prisma.$disconnect())
