// scripts/create-test-user.js
// This script creates a test user for E2E testing in CI environments

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log("🔧 Creating test user for E2E tests...");

    const email = process.env.E2E_EMAIL || "test@gmail.com";
    const password = process.env.E2E_PASSWORD || "Test1234";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create or update the test user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        hashedPassword,
        emailVerified: new Date(),
      },
      create: {
        email,
        name: "Test User",
        hashedPassword,
        emailVerified: new Date(),
        image: null,
      },
    });

    console.log("✅ Test user created/updated:", user.email);

    // Create a default profile for the test user
    const profile = await prisma.profile.upsert({
      where: { id: `profile-${user.id}` },
      update: {},
      create: {
        id: `profile-${user.id}`,
        name: "Test Profile",
        userId: user.id,
      },
    });

    console.log("✅ Test profile created:", profile.name);

    await prisma.$disconnect();

    console.log("\n✅ Test user setup complete!");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestUser();
