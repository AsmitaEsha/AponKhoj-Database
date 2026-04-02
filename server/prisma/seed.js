import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting seed...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✅ Cleared all data\n");

    // Hash passwords
    console.log("🔐 Hashing passwords...");
    const testPassword = await bcrypt.hash("TestPass@123", 12);
    const userPassword = await bcrypt.hash("UserPass@123", 12);
    const johnPassword = await bcrypt.hash("JohnPass@123", 12);
    console.log("✅ Passwords hashed\n");

    // Create regular users
    console.log("👤 Creating regular users...");

    const user1 = await prisma.user.create({
      data: {
        firstName: "Asmita",
        lastName: "Esha",
        email: "asmita@example.com",
        phone: "01712345678",
        location: "Dhaka",
        password: testPassword,
        role: "user",
      },
    });
    console.log(`✅ Created user: ${user1.email}`);

    const user2 = await prisma.user.create({
      data: {
        firstName: "Esha",
        lastName: "Khan",
        email: "esha@example.com",
        phone: "01787654321",
        location: "Chittagong",
        password: userPassword,
        role: "user",
      },
    });
    console.log(`✅ Created user: ${user2.email}`);

    const user3 = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "01912345678",
        location: "Sylhet",
        password: johnPassword,
        role: "user",
      },
    });
    console.log(`✅ Created user: ${user3.email}\n`);

    // Create sample posts
    console.log("📝 Creating sample posts...");

    await prisma.post.create({
      data: {
        title: "Missing Person Alert - Dhaka",
        content: "সাহায্য খুঁজছি। আমার ভাই রহিম গত ৩ দিন থেকে গায়েব হয়ে গেছে।",
        userId: user1.id,
      },
    });
    console.log("✅ Created post: Missing Person Alert - Dhaka");

    await prisma.post.create({
      data: {
        title: "Found - Person Located in Chittagong",
        content: "চট্টগ্রামে একজন মহিলা পাওয়া গেছেন যার পরিচয় জানা যাচ্ছে না।",
        userId: user2.id,
      },
    });
    console.log("✅ Created post: Found - Person Located in Chittagong");

    await prisma.post.create({
      data: {
        title: "Successfully Found - Thank You",
        content: "আমাদের পরিবারের সদস্যকে সফলভাবে খুঁজে পাওয়া গেছে।",
        userId: user3.id,
      },
    });
    console.log("✅ Created post: Successfully Found - Thank You\n");

    // Summary
    console.log("═".repeat(60));
    console.log("✅ SEED COMPLETED SUCCESSFULLY!\n");

    console.log("📊 Database Summary:");
    console.log("   Total Users: 3");
    console.log("   Total Posts: 3\n");

    console.log("🔐 Test Credentials (Regular Users):");
    console.log("   1. Email: asmita@example.com");
    console.log("      Password: TestPass@123\n");
    console.log("   2. Email: esha@example.com");
    console.log("      Password: UserPass@123\n");
    console.log("   3. Email: john@example.com");
    console.log("      Password: JohnPass@123\n");

    console.log("👨‍💼 Admin Credentials (from .env):");
    console.log("   1. Email: humayrabintekazal@gmail.com");
    console.log("      Password: admin123\n");
    console.log("   2. Email: asmitaesha123@gmail.com");
    console.log("      Password: admin456\n");
    console.log("   3. Email: jamilamuhammad18052000@gmail.com");
    console.log("      Password: admin789\n");

    console.log("═".repeat(60));
  } catch (error) {
    console.error("❌ Error during seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();