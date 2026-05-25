"use client";

import { useState, useTransition } from "react";
import { Plus, MoreHorizontal, Shield, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserInviteForm } from "@/components/forms/user-form";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/permissions";
import { updateUserRole, removeUser } from "@/server/actions/users";
import type { TenantRole } from "@prisma/client";

interface UserEntry {
  id: string;
  role: TenantRole;
  active: boolean;
  user: { id: string; name: string | null; email: string; image: string | null };
}

const ROLES: TenantRole[] = ["OWNER", "ADMIN", "MANAGER", "FINANCE", "VETERINARY", "OPERATOR", "VIEWER"];

const ROLE_COLORS: Record<TenantRole, string> = {
  OWNER: "bg-purple-100 text-purple-800",
  ADMIN: "bg-blue-100 text-blue-800",
  MANAGER: "bg-green-100 text-green-800",
  FINANCE: "bg-yellow-100 text-yellow-800",
  VETERINARY: "bg-teal-100 text-teal-800",
  OPERATOR: "bg-orange-100 text-orange-800",
  VIEWER: "bg-gray-100 text-gray-800",
  MEMBER: "bg-gray-100 text-gray-600",
};

export function UserManagementClient({ users }: { users: UserEntry[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleRoleChange(userId: string, role: TenantRole) {
    startTransition(async () => {
      const result = await updateUserRole({ userId, role });
      if (result.error) alert(result.error);
    });
  }

  function handleRemove(userId: string) {
    if (!confirm("Remover este usuário da organização?")) return;
    startTransition(async () => {
      const result = await removeUser(userId);
      if (result.error) alert(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Adicionar usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar usuário</DialogTitle>
            </DialogHeader>
            <UserInviteForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros da organização</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil de acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alterar perfil</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.user.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.active ? "success" : "secondary"}>
                      {u.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleRoleChange(u.user.id, v as TenantRole)}
                      disabled={pending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.role !== "OWNER" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(u.user.id)}
                        disabled={pending}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
