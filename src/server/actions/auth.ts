"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations/auth";
import { slugify } from "@/lib/utils";

export async function registerUser(data: unknown) {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { orgName, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email já cadastrado" };

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const baseSlug = slugify(orgName);
  let slug = baseSlug;
  let count = 0;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++count}`;
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: orgName,
      slug,
      users: { create: { userId: user.id, role: "OWNER" } },
      subscription: {
        create: { plan: "FREE", maxAnimals: 50, maxFarms: 1 },
      },
    },
  });

  return { success: true, tenantId: tenant.id };
}
