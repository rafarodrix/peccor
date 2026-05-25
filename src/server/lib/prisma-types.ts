import type { Prisma, PrismaClient } from "@prisma/client";

export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type PrismaTransactionClient = Prisma.TransactionClient extends never
  ? TransactionClient
  : Prisma.TransactionClient;
