"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { RegisterSchema } from "@/lib/validations/auth";
import { fail, ok, type ActionResult } from "@/server/lib/action-result";
import { CURRENT_TENANT_COOKIE } from "@/server/services/tenant";

export async function registerUser(
  data: unknown
): Promise<ActionResult<{ tenantId: string }>> {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR");
  }

  const { orgName, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return fail("Email ja cadastrado", "EMAIL_ALREADY_EXISTS");

  const hashed = await bcrypt.hash(password, 12);

  const baseSlug = slugify(orgName);
  let slug = baseSlug;
  let count = 0;

  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++count}`;
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, password: hashed },
    });

    return tx.tenant.create({
      data: {
        name: orgName,
        slug,
        users: { create: { userId: user.id, role: "OWNER" } },
        subscription: {
          create: { plan: "FREE", maxAnimals: 50, maxFarms: 1 },
        },
      },
      select: { id: true },
    });
  });

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_TENANT_COOKIE, result.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return ok({ tenantId: result.id });
}
