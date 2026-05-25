import { describe, it, expect } from "vitest";
import { hasPermission, getPermissions } from "../permissions";

describe("hasPermission", () => {
  describe("OWNER", () => {
    it("has all permissions", () => {
      expect(hasPermission("OWNER", "farms:create")).toBe(true);
      expect(hasPermission("OWNER", "farms:delete")).toBe(true);
      expect(hasPermission("OWNER", "users:remove")).toBe(true);
      expect(hasPermission("OWNER", "subscription:manage")).toBe(true);
    });
  });

  describe("VIEWER", () => {
    it("can read but not create or delete", () => {
      expect(hasPermission("VIEWER", "farms:read")).toBe(true);
      expect(hasPermission("VIEWER", "animals:read")).toBe(true);
      expect(hasPermission("VIEWER", "finance:read")).toBe(true);
      expect(hasPermission("VIEWER", "farms:create")).toBe(false);
      expect(hasPermission("VIEWER", "animals:create")).toBe(false);
      expect(hasPermission("VIEWER", "costs:pay")).toBe(false);
    });
  });

  describe("OPERATOR", () => {
    it("can register weighings and health events but not manage finances", () => {
      expect(hasPermission("OPERATOR", "weighings:create")).toBe(true);
      expect(hasPermission("OPERATOR", "health:create")).toBe(true);
      expect(hasPermission("OPERATOR", "costs:create")).toBe(false);
      expect(hasPermission("OPERATOR", "sales:create")).toBe(false);
      expect(hasPermission("OPERATOR", "users:invite")).toBe(false);
    });
  });

  describe("FINANCE", () => {
    it("can manage financial operations but not sanitary events", () => {
      expect(hasPermission("FINANCE", "purchases:create")).toBe(true);
      expect(hasPermission("FINANCE", "costs:pay")).toBe(true);
      expect(hasPermission("FINANCE", "sales:create")).toBe(true);
      expect(hasPermission("FINANCE", "health:create")).toBe(false);
      expect(hasPermission("FINANCE", "weighings:create")).toBe(false);
    });
  });

  describe("VETERINARY", () => {
    it("can manage health and weighings but not financial operations", () => {
      expect(hasPermission("VETERINARY", "health:create")).toBe(true);
      expect(hasPermission("VETERINARY", "weighings:create")).toBe(true);
      expect(hasPermission("VETERINARY", "costs:create")).toBe(false);
      expect(hasPermission("VETERINARY", "purchases:create")).toBe(false);
      expect(hasPermission("VETERINARY", "users:invite")).toBe(false);
    });
  });

  describe("MEMBER", () => {
    it("has minimal read-only access", () => {
      expect(hasPermission("MEMBER", "farms:read")).toBe(true);
      expect(hasPermission("MEMBER", "animals:read")).toBe(true);
      expect(hasPermission("MEMBER", "lots:read")).toBe(true);
      expect(hasPermission("MEMBER", "finance:read")).toBe(false);
      expect(hasPermission("MEMBER", "farms:create")).toBe(false);
    });
  });

  it("returns false for unknown role", () => {
    // @ts-expect-error testing with invalid role
    expect(hasPermission("UNKNOWN_ROLE", "farms:read")).toBe(false);
  });
});

describe("getPermissions", () => {
  it("returns array of permissions for a role", () => {
    const ownerPerms = getPermissions("OWNER");
    expect(Array.isArray(ownerPerms)).toBe(true);
    expect(ownerPerms.length).toBeGreaterThan(30);
    expect(ownerPerms).toContain("farms:delete");
    expect(ownerPerms).toContain("subscription:manage");
  });

  it("OWNER has more permissions than MANAGER", () => {
    expect(getPermissions("OWNER").length).toBeGreaterThan(getPermissions("MANAGER").length);
  });

  it("MANAGER has more permissions than VIEWER", () => {
    expect(getPermissions("MANAGER").length).toBeGreaterThan(getPermissions("VIEWER").length);
  });
});
