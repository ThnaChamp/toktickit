import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories (spec Section 7.4) ─────────────────────────────────────────
  const categories = [
    "Account and Access",
    "Hardware",
    "Software",
    "Network",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }
  console.log(`  ✓ ${categories.length} categories`);

  // ── Related Systems (spec Section 7.4) ────────────────────────────────────
  const relatedSystems = [
    "Email",
    "Campus Wi-Fi",
    "VPN",
    "LEB2 App",
    "Grade Submission App",
    "Printer",
    "Corporate Laptop",
  ];

  for (const name of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }
  console.log(`  ✓ ${relatedSystems.length} related systems`);

  // ── Development Requesters (spec Section 7.4) ─────────────────────────────
  // Active requesters appear in the selector (BR-04)
  // Inactive requester must NOT appear in the selector (BR-04)
  const requesters = [
    { name: "Jennifer Anderson", email: "jennifer.anderson@example.com", isActive: true  },
    { name: "Michael Brown",     email: "michael.brown@example.com",     isActive: true  },
    { name: "Sarah Johnson",     email: "sarah.johnson@example.com",     isActive: true  },
    { name: "David Lee",         email: "david.lee@example.com",         isActive: true  },
    { name: "Alex Turner",       email: "alex.turner@example.com",       isActive: false }, // inactive
  ];

  for (const { name, email, isActive } of requesters) {
    await prisma.requesterUser.upsert({
      where:  { email },
      update: { name, isActive },
      create: { name, email, isActive },
    });
  }

  const activeCount = requesters.filter((r) => r.isActive).length;
  console.log(`  ✓ ${activeCount} active, 1 inactive requester`);

  console.log("✅ Seeding finished.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });