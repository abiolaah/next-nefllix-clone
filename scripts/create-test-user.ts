// scripts/create-test-user.js
// This script creates a test user for E2E testing in CI environments

// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcrypt");

import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createTestUser() {
  const email = process.env.E2E_EMAIL || "test@gmail.com";
  const password = process.env.E2E_PASSWORD || "Test1234";

  console.log("🔧 Creating test user for E2E tests...");

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create or update the test user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        hashedPassword,
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
    // Since there's no unique constraint on userId+name, we check if profile exists first
    const existingProfile = await prisma.profile.findFirst({
      where: {
        userId: user.id,
        name: "Test Profile",
      },
    });

    let profile;

    if (existingProfile) {
      console.log("✅ Test profile already exists:", existingProfile.name);
      profile = existingProfile;
    } else {
      profile = await prisma.profile.create({
        data: {
          name: "Test Profile",
          userId: user.id,
          avatar:
            "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696100/default-blue_oqkthi.png",
          hasPin: false,
        },
      });
      console.log("✅ Test profile created:", profile.name);
    }

    console.log("🎉 Test setup complete!");
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
