 /// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("TestP@ss123", 10);

  await prisma.user.upsert({
    where: { email: "asmita@example.com" },
    update: {},
    create: {
      email: "asmita@example.com",
      password: pw,
      name: "Asmita",
      age: 25,
    },
  });

  await prisma.user.upsert({
    where: { email: "esha@example.com" },
    update: {},
    create: {
      email: "esha@example.com",
      password: pw,
      name: "Esha",
      age: 24,
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });