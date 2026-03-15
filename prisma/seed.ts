import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create a Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@turf.com" },
    update: {
      role: "SUPER_ADMIN",
      name: "Super Admin",
    },
    create: {
      email: "admin@turf.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
    },
  });

  // Create an Owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {
      role: "TURF_OWNER",
      name: "Rajesh Kumar",
    },
    create: {
      email: "owner@example.com",
      password: hashedPassword,
      name: "Rajesh Kumar",
      role: "TURF_OWNER",
      phone: "+91 9876543210",
    },
  });

  // Create a Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      password: hashedPassword,
      name: "Suresh Raina",
      role: "CUSTOMER",
      phone: "+91 9999999999",
    },
  });

  // Create some Turfs
  const turfs = [
    {
      name: "Arena One Sports",
      location: "Andheri East, Mumbai",
      pricePerHour: 1200,
      sportType: "Football",
      description: "Premium FIFA quality turf with high-speed floodlights and ample parking space.",
      images: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
      ownerId: owner.id,
      isApproved: true,
    },
    {
      name: "The Greenfield Complex",
      location: "HSR Layout, Bangalore",
      pricePerHour: 1500,
      sportType: "Cricket",
      description: "State-of-the-art multi-sport facility. Ideal for both 5-a-side football and box cricket.",
      images: "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1521733912048-0058ec107c91?q=80&w=800&auto=format&fit=crop",
      ownerId: owner.id,
      isApproved: true,
    },
    {
      name: "Kick-Off Sports Center",
      location: "Anna Nagar, Chennai",
      pricePerHour: 1000,
      sportType: "Football",
      description: "Centrally located with excellent pitch maintenance and shower facilities.",
      images: "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop",
      ownerId: owner.id,
      isApproved: true,
    }
  ];

  for (const turfData of turfs) {
    const turf = await prisma.turf.create({
      data: turfData,
    });

    // Create some default slots for each turf
    const slots = [];
    for (let day = 0; day < 7; day++) {
      // 6 AM to 11 PM
      for (let hour = 6; hour < 23; hour++) {
        slots.push({
          turfId: turf.id,
          dayOfWeek: day,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        });
      }
    }
    await prisma.timeSlot.createMany({ data: slots });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
