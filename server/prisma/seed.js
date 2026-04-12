import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting seed...\n");

    // Clear existing data (in reverse dependency order)
    console.log("🗑️  Clearing existing data...");
    await prisma.post.deleteMany({});
    await prisma.alertNotification.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.adminAction.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.foundPersonReport.deleteMany({});
    await prisma.missingPersonReport.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.district.deleteMany({});
    await prisma.division.deleteMany({});
    console.log("✅ Cleared all data\n");

    // Seed Divisions and Districts for Bangladesh
    console.log("🗺️  Seeding divisions and districts...");
    
    const divisions = [
      {
        name: "Dhaka",
        bn: "ঢাকা",
        districts: [
          { name: "Dhaka", bn: "ঢাকা" },
          { name: "Faridpur", bn: "ফরিদপুর" },
          { name: "Gazipur", bn: "গাজীপুর" },
          { name: "Gopalganj", bn: "গোপালগঞ্জ" },
          { name: "Manikganj", bn: "মানিকগঞ্জ" },
          { name: "Munshiganj", bn: "মুন্সিগঞ্জ" },
          { name: "Narayanganj", bn: "নারায়ণগঞ্জ" },
          { name: "Shariatpur", bn: "শরিয়তপুর" },
          { name: "Tangail", bn: "টাঙ্গাইল" },
        ]
      },
      {
        name: "Chittagong",
        bn: "চট্টগ্রাম",
        districts: [
          { name: "Chittagong", bn: "চট্টগ্রাম" },
          { name: "Bandarban", bn: "বান্দরবান" },
          { name: "Cox's Bazar", bn: "কক্সবাজার" },
          { name: "Khagrachari", bn: "খাগ্রাছড়ি" },
          { name: "Feni", bn: "ফেনী" },
          { name: "Lakshmipur", bn: "লক্ষ্মীপুর" },
          { name: "Noakhali", bn: "নোয়াখালী" },
        ]
      },
      {
        name: "Rajshahi",
        bn: "রাজশাহী",
        districts: [
          { name: "Rajshahi", bn: "রাজশাহী" },
          { name: "Bogura", bn: "বগুড়া" },
          { name: "Joypurhat", bn: "জয়পুরহাট" },
          { name: "Naogaon", bn: "নওগাঁ" },
          { name: "Natore", bn: "নাটোর" },
          { name: "Nawabganj", bn: "নবাবগঞ্জ" },
          { name: "Pabna", bn: "পাবনা" },
        ]
      },
      {
        name: "Khulna",
        bn: "খুলনা",
        districts: [
          { name: "Bagerhat", bn: "বাগেরহাট" },
          { name: "Chuadanga", bn: "চুয়াডাঙ্গা" },
          { name: "Jessore", bn: "যশোর" },
          { name: "Jhenaidah", bn: "ঝিনাইদহ" },
          { name: "Khulna", bn: "খুলনা" },
          { name: "Magura", bn: "মাগুরা" },
          { name: "Narail", bn: "নড়াইল" },
          { name: "Satkhira", bn: "সাতক্ষীরা" },
        ]
      },
      {
        name: "Barisal",
        bn: "বরিশাল",
        districts: [
          { name: "Barisal", bn: "বরিশাল" },
          { name: "Bhola", bn: "ভোলা" },
          { name: "Jhalokati", bn: "ঝালোকাঠী" },
          { name: "Patuakhali", bn: "পটুয়াখালী" },
          { name: "Pirojpur", bn: "পিরোজপুর" },
        ]
      },
      {
        name: "Sylhet",
        bn: "সিলেট",
        districts: [
          { name: "Sylhet", bn: "সিলেট" },
          { name: "Habiganj", bn: "হবিগঞ্জ" },
          { name: "Moulvibazar", bn: "মৌলভীবাজার" },
          { name: "Sunamganj", bn: "সুনামগঞ্জ" },
        ]
      },
      {
        name: "Rangpur",
        bn: "রংপুর",
        districts: [
          { name: "Rangpur", bn: "রংপুর" },
          { name: "Dinajpur", bn: "দিনাজপুর" },
          { name: "Gaibandha", bn: "গাইবাঁধা" },
          { name: "Kurigram", bn: "কুড়িগ্রাম" },
          { name: "Lalmonirhat", bn: "লালমনিরহাট" },
          { name: "Nilphamari", bn: "নীলফামারী" },
          { name: "Panchagarh", bn: "পঞ্চগড়" },
          { name: "Thakurgaon", bn: "ঠাকুরগাঁও" },
        ]
      },
      {
        name: "Mymensingh",
        bn: "ময়মনসিংহ",
        districts: [
          { name: "Mymensingh", bn: "ময়মনসিংহ" },
          { name: "Jamalpur", bn: "জামালপুর" },
          { name: "Netrokona", bn: "নেত্রকোণা" },
          { name: "Sherpur", bn: "শেরপুর" },
        ]
      }
    ];

    for (const divisionData of divisions) {
      const division = await prisma.division.create({
        data: {
          name: divisionData.name,
          bn: divisionData.bn,
        }
      });

      for (const districtData of divisionData.districts) {
        await prisma.district.create({
          data: {
            name: districtData.name,
            bn: districtData.bn,
            divisionId: division.id,
          }
        });
      }
      console.log(`✅ Created division: ${division.name} with ${divisionData.districts.length} districts`);
    }
    console.log("✅ All divisions and districts seeded\n");

    // Hash passwords
    console.log("🔐 Hashing passwords...");
    const testPassword = await bcrypt.hash("TestPass@123", 12);
    const userPassword = await bcrypt.hash("UserPass@123", 12);
    const johnPassword = await bcrypt.hash("JohnPass@123", 12);
    console.log("✅ Passwords hashed\n");

    // Get DHaka district for users
    const dhakaDistrict = await prisma.district.findFirst({
      where: { name: "Dhaka" }
    });

    const chittagongDistrict = await prisma.district.findFirst({
      where: { name: "Chittagong" }
    });

    const sylhetDistrict = await prisma.district.findFirst({
      where: { name: "Sylhet" }
    });

    // Create regular users
    console.log("👤 Creating regular users...");

    const user1 = await prisma.user.create({
      data: {
        firstName: "Asmita",
        lastName: "Esha",
        email: "asmita@example.com",
        phone: "01712345678",
        location: "Dhaka",
        district: "Dhaka",
        districtId: dhakaDistrict?.id,
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
        district: "Chittagong",
        districtId: chittagongDistrict?.id,
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
        district: "Sylhet",
        districtId: sylhetDistrict?.id,
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
    console.log("   Total Divisions: 8");
    console.log("   Total Districts: 64");
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
