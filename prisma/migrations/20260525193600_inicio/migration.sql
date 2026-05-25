-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'FINANCE', 'VETERINARY', 'OPERATOR', 'VIEWER', 'MEMBER');

-- CreateEnum
CREATE TYPE "SaaSPlan" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "FarmOperation" AS ENUM ('CRIA', 'RECRIA', 'ENGORDA', 'CONFINAMENTO', 'CICLO_COMPLETO');

-- CreateEnum
CREATE TYPE "FarmAreaType" AS ENUM ('PASTO', 'CURRAL', 'PIQUETE', 'BAIA', 'CONFINAMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "CattlePhase" AS ENUM ('CRIA', 'RECRIA', 'ENGORDA', 'TERMINACAO', 'CONFINAMENTO');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('ACTIVE', 'SOLD', 'CLOSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AnimalSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AnimalCategory" AS ENUM ('BEZERRO', 'BEZERRA', 'GARROTE', 'NOVILHA', 'NOVILHO', 'VACA', 'BOI', 'TOURO');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ACTIVE', 'SOLD', 'DEAD', 'TRANSFERRED', 'LOST');

-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('FUNCIONARIO', 'ENERGIA', 'ARRENDAMENTO', 'RACAO', 'SAL_MINERAL', 'VACINA', 'MEDICAMENTO', 'FRETE', 'MANUTENCAO', 'COMISSAO', 'COMBUSTIVEL', 'VETERINARIO', 'OUTROS');

-- CreateEnum
CREATE TYPE "CostStatus" AS ENUM ('OPEN', 'PAID', 'CANCELED');

-- CreateEnum
CREATE TYPE "HealthEventType" AS ENUM ('VACINA', 'VERMIFUGO', 'MEDICAMENTO', 'DOENCA', 'MORTE', 'OUTRO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUser" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TenantRole" NOT NULL DEFAULT 'MEMBER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plan" "SaaSPlan" NOT NULL DEFAULT 'FREE',
    "maxAnimals" INTEGER NOT NULL DEFAULT 50,
    "maxFarms" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "trialEndsAt" TIMESTAMP(3),
    "renewsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "stateReg" TEXT,
    "state" TEXT,
    "city" TEXT,
    "totalArea" DECIMAL(10,2),
    "pastureArea" DECIMAL(10,2),
    "operation" "FarmOperation" NOT NULL DEFAULT 'CICLO_COMPLETO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmArea" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FarmAreaType" NOT NULL DEFAULT 'PASTO',
    "capacityHead" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CattleLot" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "areaId" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "phase" "CattlePhase" NOT NULL DEFAULT 'ENGORDA',
    "status" "LotStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "initialQuantity" INTEGER NOT NULL DEFAULT 0,
    "currentQuantity" INTEGER NOT NULL DEFAULT 0,
    "initialAvgWeight" DECIMAL(10,2),
    "currentAvgWeight" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CattleLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "lotId" TEXT,
    "tag" TEXT,
    "electronicTag" TEXT,
    "sisbov" TEXT,
    "breed" TEXT,
    "sex" "AnimalSex" NOT NULL DEFAULT 'MALE',
    "category" "AnimalCategory" NOT NULL DEFAULT 'BOI',
    "birthDate" TIMESTAMP(3),
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitDate" TIMESTAMP(3),
    "entryWeight" DECIMAL(10,2),
    "currentWeight" DECIMAL(10,2),
    "purchaseCost" DECIMAL(10,2),
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalWeight" DECIMAL(10,2),
    "animalValue" DECIMAL(10,2) NOT NULL,
    "freightValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "commissionValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherCosts" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "lotId" TEXT,
    "animalId" TEXT,
    "quantity" INTEGER NOT NULL,
    "avgWeight" DECIMAL(10,2),
    "unitValue" DECIMAL(10,2),
    "totalValue" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalWeight" DECIMAL(10,2),
    "pricePerArroba" DECIMAL(10,2),
    "animalValue" DECIMAL(10,2) NOT NULL,
    "freightValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "commissionValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(10,2) NOT NULL,
    "netValue" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "lotId" TEXT,
    "animalId" TEXT,
    "quantity" INTEGER NOT NULL,
    "avgWeight" DECIMAL(10,2),
    "unitValue" DECIMAL(10,2),
    "totalValue" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weighing" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "lotId" TEXT,
    "animalId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" DECIMAL(10,2) NOT NULL,
    "previousWeight" DECIMAL(10,2),
    "weightGain" DECIMAL(10,2),
    "daysSinceLast" INTEGER,
    "dailyGain" DECIMAL(10,4),
    "responsible" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Weighing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cost" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "lotId" TEXT,
    "category" "CostCategory" NOT NULL,
    "type" "CostType" NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "amount" DECIMAL(10,2) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "status" "CostStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthEvent" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "HealthEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "productName" TEXT,
    "dosage" TEXT,
    "withdrawalDays" INTEGER,
    "responsible" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalMovement" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "fromLotId" TEXT,
    "toLotId" TEXT,
    "fromAreaId" TEXT,
    "toAreaId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnimalMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "TenantUser_userId_active_idx" ON "TenantUser"("userId", "active");

-- CreateIndex
CREATE INDEX "TenantUser_tenantId_role_active_idx" ON "TenantUser"("tenantId", "role", "active");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUser_tenantId_userId_key" ON "TenantUser"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tenantId_key" ON "Subscription"("tenantId");

-- CreateIndex
CREATE INDEX "Farm_tenantId_active_idx" ON "Farm"("tenantId", "active");

-- CreateIndex
CREATE INDEX "FarmArea_farmId_active_idx" ON "FarmArea"("farmId", "active");

-- CreateIndex
CREATE INDEX "CattleLot_farmId_status_idx" ON "CattleLot"("farmId", "status");

-- CreateIndex
CREATE INDEX "CattleLot_areaId_status_idx" ON "CattleLot"("areaId", "status");

-- CreateIndex
CREATE INDEX "CattleLot_createdAt_idx" ON "CattleLot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CattleLot_farmId_code_key" ON "CattleLot"("farmId", "code");

-- CreateIndex
CREATE INDEX "Animal_farmId_status_idx" ON "Animal"("farmId", "status");

-- CreateIndex
CREATE INDEX "Animal_lotId_status_idx" ON "Animal"("lotId", "status");

-- CreateIndex
CREATE INDEX "Animal_tag_idx" ON "Animal"("tag");

-- CreateIndex
CREATE INDEX "Animal_entryDate_idx" ON "Animal"("entryDate");

-- CreateIndex
CREATE INDEX "Purchase_farmId_date_idx" ON "Purchase"("farmId", "date");

-- CreateIndex
CREATE INDEX "Purchase_dueDate_idx" ON "Purchase"("dueDate");

-- CreateIndex
CREATE INDEX "Purchase_paidAt_idx" ON "Purchase"("paidAt");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseItem_lotId_idx" ON "PurchaseItem"("lotId");

-- CreateIndex
CREATE INDEX "PurchaseItem_animalId_idx" ON "PurchaseItem"("animalId");

-- CreateIndex
CREATE INDEX "Sale_farmId_date_idx" ON "Sale"("farmId", "date");

-- CreateIndex
CREATE INDEX "Sale_dueDate_idx" ON "Sale"("dueDate");

-- CreateIndex
CREATE INDEX "Sale_paidAt_idx" ON "Sale"("paidAt");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_lotId_idx" ON "SaleItem"("lotId");

-- CreateIndex
CREATE INDEX "SaleItem_animalId_idx" ON "SaleItem"("animalId");

-- CreateIndex
CREATE INDEX "Weighing_farmId_date_idx" ON "Weighing"("farmId", "date");

-- CreateIndex
CREATE INDEX "Weighing_lotId_date_idx" ON "Weighing"("lotId", "date");

-- CreateIndex
CREATE INDEX "Weighing_animalId_date_idx" ON "Weighing"("animalId", "date");

-- CreateIndex
CREATE INDEX "Cost_farmId_status_date_idx" ON "Cost"("farmId", "status", "date");

-- CreateIndex
CREATE INDEX "Cost_lotId_status_idx" ON "Cost"("lotId", "status");

-- CreateIndex
CREATE INDEX "Cost_dueDate_idx" ON "Cost"("dueDate");

-- CreateIndex
CREATE INDEX "HealthEvent_animalId_date_idx" ON "HealthEvent"("animalId", "date");

-- CreateIndex
CREATE INDEX "HealthEvent_type_date_idx" ON "HealthEvent"("type", "date");

-- CreateIndex
CREATE INDEX "AnimalMovement_animalId_date_idx" ON "AnimalMovement"("animalId", "date");

-- CreateIndex
CREATE INDEX "AnimalMovement_fromLotId_date_idx" ON "AnimalMovement"("fromLotId", "date");

-- CreateIndex
CREATE INDEX "AnimalMovement_toLotId_date_idx" ON "AnimalMovement"("toLotId", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmArea" ADD CONSTRAINT "FarmArea_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CattleLot" ADD CONSTRAINT "CattleLot_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CattleLot" ADD CONSTRAINT "CattleLot_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "FarmArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "CattleLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "CattleLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "CattleLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weighing" ADD CONSTRAINT "Weighing_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weighing" ADD CONSTRAINT "Weighing_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "CattleLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weighing" ADD CONSTRAINT "Weighing_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cost" ADD CONSTRAINT "Cost_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cost" ADD CONSTRAINT "Cost_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "CattleLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthEvent" ADD CONSTRAINT "HealthEvent_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalMovement" ADD CONSTRAINT "AnimalMovement_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
