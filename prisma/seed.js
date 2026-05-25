const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_ACCOUNTS = [
  // ─── RECEITAS ─────────────────────────────────────────────────────────────
  { code: "1", name: "Receitas", type: "INFLOW", dfcCategory: null },
  { code: "1.1", name: "Receitas Operacionais", type: "INFLOW", dfcCategory: "OPERATIONAL", parentCode: "1" },
  { code: "1.1.01", name: "Venda de Animais (Gado Gordo)", type: "INFLOW", dfcCategory: "OPERATIONAL", parentCode: "1.1" },
  { code: "1.1.02", name: "Venda de Animais (Cria/Desmame)", type: "INFLOW", dfcCategory: "OPERATIONAL", parentCode: "1.1" },
  { code: "1.1.03", name: "Venda de Subprodutos (Leite, Couro)", type: "INFLOW", dfcCategory: "OPERATIONAL", parentCode: "1.1" },
  { code: "1.2", name: "Outras Receitas", type: "INFLOW", dfcCategory: "INVESTMENT", parentCode: "1" },
  { code: "1.2.01", name: "Venda de Imobilizado (Máquinas/Terra)", type: "INFLOW", dfcCategory: "INVESTMENT", parentCode: "1.2" },

  // ─── DESPESAS / CUSTOS ─────────────────────────────────────────────────────
  { code: "2", name: "Despesas e Custos", type: "OUTFLOW", dfcCategory: null },
  { code: "2.1", name: "Custos Operacionais", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2" },
  { code: "2.1.01", name: "Nutrição (Ração, Mineral)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.1.02", name: "Saúde Animal (Medicamentos, Vacinas)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.1.03", name: "Mão de Obra (Salários, Encargos)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.1.04", name: "Despesas Administrativas (Energia, Internet)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.1.05", name: "Impostos e Taxas (Funrural)", type: "OUTFLOW", dfcCategory: "OPERATIONAL", parentCode: "2.1" },
  { code: "2.2", name: "Custos de Investimento", type: "OUTFLOW", dfcCategory: "INVESTMENT", parentCode: "2" },
  { code: "2.2.01", name: "Aquisição de Touros/Matrizes", type: "OUTFLOW", dfcCategory: "INVESTMENT", parentCode: "2.2" },
  { code: "2.2.02", name: "Compra de Tratores/Implementos", type: "OUTFLOW", dfcCategory: "INVESTMENT", parentCode: "2.2" },
  { code: "2.2.03", name: "Construção de Cercas/Currais", type: "OUTFLOW", dfcCategory: "INVESTMENT", parentCode: "2.2" },
  { code: "2.3", name: "Fluxos de Financiamento", type: "OUTFLOW", dfcCategory: "FINANCING", parentCode: "2" },
  { code: "2.3.01", name: "Amortização de Custeio Agrícola", type: "OUTFLOW", dfcCategory: "FINANCING", parentCode: "2.3" },
  { code: "2.3.02", name: "Juros sobre Empréstimos", type: "OUTFLOW", dfcCategory: "FINANCING", parentCode: "2.3" },
];

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

  // Seedar o Plano de Contas padrão de Pecuária para o tenant demo
  const createdAccounts = new Map();
  for (const item of DEFAULT_ACCOUNTS) {
    const parentId = item.parentCode ? createdAccounts.get(item.parentCode) : null;

    const account = await prisma.chartOfAccount.upsert({
      where: {
        tenantId_code: {
          tenantId: tenant.id,
          code: item.code,
        },
      },
      update: {
        name: item.name,
        type: item.type,
        dfcCategory: item.dfcCategory,
        parentId: parentId || null,
      },
      create: {
        tenantId: tenant.id,
        code: item.code,
        name: item.name,
        type: item.type,
        dfcCategory: item.dfcCategory,
        parentId: parentId || null,
      },
    });

    createdAccounts.set(item.code, account.id);
  }

  console.log(`Seed do Plano de Contas padrão concluido para ${tenantSlug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

