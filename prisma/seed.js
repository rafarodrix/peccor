const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@peccor.local";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "changeme123";
  const tenantName = process.env.SEED_TENANT_NAME ?? "Peccor Demo";
  const tenantSlug = process.env.SEED_TENANT_SLUG ?? "peccor-demo";

  const hashedPassword = await bcrypt.hash(ownerPassword, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      name: "Owner Demo",
      password: hashedPassword,
    },
    create: {
      name: "Owner Demo",
      email: ownerEmail,
      password: hashedPassword,
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {
      name: tenantName,
      active: true,
    },
    create: {
      name: tenantName,
      slug: tenantSlug,
      active: true,
    },
  });

  await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: owner.id,
      },
    },
    update: {
      active: true,
      role: "OWNER",
    },
    create: {
      tenantId: tenant.id,
      userId: owner.id,
      role: "OWNER",
      active: true,
    },
  });

  await prisma.subscription.upsert({
    where: { tenantId: tenant.id },
    update: {
      plan: "FREE",
      active: true,
      maxAnimals: 50,
      maxFarms: 1,
    },
    create: {
      tenantId: tenant.id,
      plan: "FREE",
      active: true,
      maxAnimals: 50,
      maxFarms: 1,
    },
  });

  console.log(`Seed concluido para ${ownerEmail} em tenant ${tenantSlug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
