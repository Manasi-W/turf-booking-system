import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testNotifications() {
  const user = await prisma.user.findFirst()
  if (!user) return

  console.log(`Creating test notification for user: ${user.email}`)
  
  // Use raw query if model isn't generated yet, but let's try standard first
  try {
    const note = await (prisma as any).notification.create({
      data: {
        userId: user.id,
        title: "Test Notification",
        message: "This is a test notification from the verification script.",
        type: "SUCCESS",
        link: "/dashboard"
      }
    })
    console.log("Notification created successfully:", note.id)
  } catch (err) {
    console.error("Standard create failed, trying raw query...", err)
    // Fallback if prisma client doesn't have 'notification' yet
    await prisma.$executeRaw`
      INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "isRead", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${user.id}, 'Test Notification (Raw)', 'This was created via raw SQL.', 'INFO', false, now(), now())
    `
    console.log("Raw notification created.")
  }

  const count = await (prisma as any).notification?.count({ where: { userId: user.id } }) || "unknown (check DB)"
  console.log(`Total notifications for user: ${count}`)
}

testNotifications().finally(() => prisma.$disconnect())
