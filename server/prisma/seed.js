import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Check if users already exist
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log('✅ Database already has data. Skipping seed.');
      return;
    }

    console.log('👤 Creating test users...');
    const user1 = await prisma.user.create({
      data: {
        email: 'asmita@aponkhoj.com',
        name: 'Asmita Esha',
        password: 'password123',
        phone: '01700000001',
        location: 'ঢাকা',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'john@aponkhoj.com',
        name: 'John Doe',
        password: 'password123',
        phone: '01700000002',
        location: 'চট্টগ্রাম',
      },
    });

    const user3 = await prisma.user.create({
      data: {
        email: 'jane@aponkhoj.com',
        name: 'Jane Smith',
        password: 'password123',
        phone: '01700000003',
        location: 'খুলনা',
      },
    });

    console.log(`✅ Created 3 users`);

    console.log('📝 Creating test posts...');
    await prisma.post.create({
      data: {
        title: 'Missing Person - Dhaka District',
        content: 'Please help find my brother who went missing last week in Dhaka.',
        userId: user1.id,
      },
    });

    await prisma.post.create({
      data: {
        title: 'Found Person - Chittagong',
        content: 'Found a young man near the railway station in Chittagong.',
        userId: user2.id,
      },
    });

    await prisma.post.create({
      data: {
        title: 'Missing Senior Citizen',
        content: 'My grandfather is missing since yesterday morning from Mirpur area.',
        userId: user3.id,
      },
    });

    console.log(`✅ Created 3 posts`);
    console.log('\n✅✅✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });