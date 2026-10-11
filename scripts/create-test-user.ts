
import { prisma } from "../lib/prisma";

// Create a temporary user for local development.
async function main() {
  const user = await prisma.user.upsert({
    // Avoid creating duplicate users if we run this script again.
    where: {
      email: "test@jobpilot.local",
    },
    update: {},
    create: {
      name: "JobPilot Test User",
      email: "test@jobpilot.local",

      // Temporary placeholder only.
      // Never use this as a real login password.
      password: "TEMPORARY_TEST_ACCOUNT_NO_LOGIN",
    },
  });

  console.log("Test user ready:", {
    id: user.id,
    email: user.email,
  });
}

main()
  .catch((error) => {
    console.error("Could not create test user:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
