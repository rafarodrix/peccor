import type { TenantRole } from "@prisma/client";

// ─── Permission Keys ─────────────────────────────────────────────────────────

export type Permission =
  // Fazendas
  | "farms:read"
  | "farms:create"
  | "farms:edit"
  | "farms:delete"
  // Áreas
  | "areas:read"
  | "areas:create"
  | "areas:edit"
  | "areas:delete"
  // Rebanho
  | "animals:read"
  | "animals:create"
  | "animals:edit"
  | "animals:delete"
  // Lotes
  | "lots:read"
  | "lots:create"
  | "lots:edit"
  | "lots:close"
  // Compras
  | "purchases:read"
  | "purchases:create"
  | "purchases:edit"
  // Vendas
  | "sales:read"
  | "sales:create"
  | "sales:edit"
  // Pesagens
  | "weighings:read"
  | "weighings:create"
  // Custos
  | "costs:read"
  | "costs:create"
  | "costs:edit"
  | "costs:delete"
  | "costs:pay"
  // Manejo Sanitário
  | "health:read"
  | "health:create"
  | "health:edit"
  // Financeiro
  | "finance:read"
  // Relatórios
  | "reports:read"
  // Configurações / Usuários
  | "settings:read"
  | "users:read"
  | "users:invite"
  | "users:edit_role"
  | "users:remove"
  // Assinatura
  | "subscription:read"
  | "subscription:manage";

// ─── Role → Permission Matrix ─────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<TenantRole, Permission[]> = {
  OWNER: [
    "farms:read", "farms:create", "farms:edit", "farms:delete",
    "areas:read", "areas:create", "areas:edit", "areas:delete",
    "animals:read", "animals:create", "animals:edit", "animals:delete",
    "lots:read", "lots:create", "lots:edit", "lots:close",
    "purchases:read", "purchases:create", "purchases:edit",
    "sales:read", "sales:create", "sales:edit",
    "weighings:read", "weighings:create",
    "costs:read", "costs:create", "costs:edit", "costs:delete", "costs:pay",
    "health:read", "health:create", "health:edit",
    "finance:read",
    "reports:read",
    "settings:read",
    "users:read", "users:invite", "users:edit_role", "users:remove",
    "subscription:read", "subscription:manage",
  ],
  ADMIN: [
    "farms:read", "farms:create", "farms:edit",
    "areas:read", "areas:create", "areas:edit",
    "animals:read", "animals:create", "animals:edit", "animals:delete",
    "lots:read", "lots:create", "lots:edit", "lots:close",
    "purchases:read", "purchases:create", "purchases:edit",
    "sales:read", "sales:create", "sales:edit",
    "weighings:read", "weighings:create",
    "costs:read", "costs:create", "costs:edit", "costs:delete", "costs:pay",
    "health:read", "health:create", "health:edit",
    "finance:read",
    "reports:read",
    "settings:read",
    "users:read", "users:invite", "users:edit_role",
    "subscription:read",
  ],
  MANAGER: [
    "farms:read", "farms:edit",
    "areas:read", "areas:create", "areas:edit",
    "animals:read", "animals:create", "animals:edit",
    "lots:read", "lots:create", "lots:edit", "lots:close",
    "purchases:read", "purchases:create",
    "sales:read", "sales:create",
    "weighings:read", "weighings:create",
    "costs:read", "costs:create", "costs:edit",
    "health:read", "health:create",
    "finance:read",
    "reports:read",
    "settings:read",
    "users:read",
  ],
  FINANCE: [
    "farms:read",
    "areas:read",
    "animals:read",
    "lots:read",
    "purchases:read", "purchases:create", "purchases:edit",
    "sales:read", "sales:create", "sales:edit",
    "costs:read", "costs:create", "costs:edit", "costs:pay",
    "finance:read",
    "reports:read",
    "settings:read",
  ],
  VETERINARY: [
    "farms:read",
    "areas:read",
    "animals:read", "animals:edit",
    "lots:read",
    "weighings:read", "weighings:create",
    "health:read", "health:create", "health:edit",
    "reports:read",
    "settings:read",
  ],
  OPERATOR: [
    "farms:read",
    "areas:read",
    "animals:read",
    "lots:read",
    "weighings:read", "weighings:create",
    "health:read", "health:create",
    "costs:read",
  ],
  VIEWER: [
    "farms:read",
    "areas:read",
    "animals:read",
    "lots:read",
    "purchases:read",
    "sales:read",
    "weighings:read",
    "costs:read",
    "health:read",
    "finance:read",
    "reports:read",
  ],
  MEMBER: [
    "farms:read",
    "animals:read",
    "lots:read",
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasPermission(role: TenantRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: TenantRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ROLE_LABELS: Record<TenantRole, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  FINANCE: "Financeiro",
  VETERINARY: "Veterinário",
  OPERATOR: "Operador",
  VIEWER: "Visualizador",
  MEMBER: "Membro",
};

export const ROLE_DESCRIPTIONS: Record<TenantRole, string> = {
  OWNER: "Acesso total ao sistema, incluindo assinatura e exclusão de dados",
  ADMIN: "Gerencia fazendas, usuários e todas as operações, exceto assinatura",
  MANAGER: "Gerencia operações do dia a dia: lotes, animais, compras e vendas",
  FINANCE: "Acesso ao financeiro: compras, vendas, custos e relatórios",
  VETERINARY: "Gerencia saúde animal: vacinas, pesagens e manejo sanitário",
  OPERATOR: "Registra pesagens e eventos sanitários no campo",
  VIEWER: "Visualiza todos os dados sem permissão de edição",
  MEMBER: "Acesso básico de leitura",
};

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: "Fazendas",
    permissions: ["farms:read", "farms:create", "farms:edit", "farms:delete"],
  },
  {
    label: "Áreas",
    permissions: ["areas:read", "areas:create", "areas:edit", "areas:delete"],
  },
  {
    label: "Rebanho",
    permissions: ["animals:read", "animals:create", "animals:edit", "animals:delete"],
  },
  {
    label: "Lotes",
    permissions: ["lots:read", "lots:create", "lots:edit", "lots:close"],
  },
  {
    label: "Compras",
    permissions: ["purchases:read", "purchases:create", "purchases:edit"],
  },
  {
    label: "Vendas",
    permissions: ["sales:read", "sales:create", "sales:edit"],
  },
  {
    label: "Pesagens",
    permissions: ["weighings:read", "weighings:create"],
  },
  {
    label: "Custos",
    permissions: ["costs:read", "costs:create", "costs:edit", "costs:delete", "costs:pay"],
  },
  {
    label: "Saúde",
    permissions: ["health:read", "health:create", "health:edit"],
  },
  {
    label: "Financeiro",
    permissions: ["finance:read", "reports:read"],
  },
  {
    label: "Usuários",
    permissions: ["users:read", "users:invite", "users:edit_role", "users:remove"],
  },
  {
    label: "Sistema",
    permissions: ["settings:read", "subscription:read", "subscription:manage"],
  },
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "farms:read": "Visualizar",
  "farms:create": "Criar",
  "farms:edit": "Editar",
  "farms:delete": "Excluir",
  "areas:read": "Visualizar",
  "areas:create": "Criar",
  "areas:edit": "Editar",
  "areas:delete": "Excluir",
  "animals:read": "Visualizar",
  "animals:create": "Criar",
  "animals:edit": "Editar",
  "animals:delete": "Excluir",
  "lots:read": "Visualizar",
  "lots:create": "Criar",
  "lots:edit": "Editar",
  "lots:close": "Fechar",
  "purchases:read": "Visualizar",
  "purchases:create": "Criar",
  "purchases:edit": "Editar",
  "sales:read": "Visualizar",
  "sales:create": "Criar",
  "sales:edit": "Editar",
  "weighings:read": "Visualizar",
  "weighings:create": "Registrar",
  "costs:read": "Visualizar",
  "costs:create": "Criar",
  "costs:edit": "Editar",
  "costs:delete": "Excluir",
  "costs:pay": "Pagar",
  "health:read": "Visualizar",
  "health:create": "Criar",
  "health:edit": "Editar",
  "finance:read": "Ver financeiro",
  "reports:read": "Ver relatórios",
  "settings:read": "Ver configurações",
  "users:read": "Listar usuários",
  "users:invite": "Convidar",
  "users:edit_role": "Alterar perfil",
  "users:remove": "Remover",
  "subscription:read": "Ver assinatura",
  "subscription:manage": "Gerenciar assinatura",
};
