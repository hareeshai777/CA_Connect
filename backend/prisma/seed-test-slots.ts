/// <reference types="node" />
/**
 * Test slot seeder — adds available time slots for the demo CA for the next 7 days.
 * Run: npx ts-node prisma/seed-test-slots.ts
 * Does NOT modify any production code/logic.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ca = await prisma.cAProfessional.findFirst({
    where: { user: { email: "ca@demo.com" } },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!ca) {
    console.error("❌ Demo CA not found. Run: npx ts-node prisma/seed.ts first");
    process.exit(1);
  }

  console.log(`✅ Found CA: ${ca.firstName} ${ca.lastName} (${ca.id})`);

  const slots = [
    { start: "09:00", end: "10:00" },
    { start: "10:30", end: "11:30" },
    { start: "11:30", end: "12:30" },
    { start: "14:00", end: "15:00" },
    { start: "15:30", end: "16:30" },
    { start: "17:00", end: "18:00" },
  ];

  let created = 0;
  for (let d = 1; d <= 10; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    // Skip Sundays
    if (date.getDay() === 0) continue;

    const dateOnly = new Date(date.toISOString().split("T")[0]);

    for (const slot of slots) {
      const existing = await prisma.timeSlot.findFirst({
        where: {
          caProfessionalId: ca.id,
          date: dateOnly,
          startTime: slot.start,
        },
      });
      if (existing) continue;

      await prisma.timeSlot.create({
        data: {
          caProfessionalId: ca.id,
          date: dateOnly,
          startTime: slot.start,
          endTime: slot.end,
          isBooked: false,
          isBlocked: false,
        },
      });
      created++;
    }
  }

  console.log(`✅ Created ${created} time slots for the next 10 days`);
  console.log("\n─────────────────────────────────────────────────");
  console.log("TEST CREDENTIALS");
  console.log("─────────────────────────────────────────────────");
  console.log("Role    | Email              | Password");
  console.log("Client  | client@demo.com   | Client@123");
  console.log("CA      | ca@demo.com       | CA@123456");
  console.log("Admin   | admin@casaas.com  | Admin@123456");
  console.log("─────────────────────────────────────────────────");
  console.log("\nBOOKING FLOW (no Razorpay needed):");
  console.log("1. Login as client@demo.com / Client@123");
  console.log("2. Go to /services → pick any service");
  console.log("3. Click a CA → pick a date & time slot");
  console.log("4. Click 'Book & Pay' → payment auto-succeeds (demo mode)");
  console.log("5. Check /client/bookings for confirmation");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
