"use client";

import { useState, useTransition } from "react";
import { Plus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { UserInviteForm } from "@/components/forms/user-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/permissions";
import { removeUser, updateUserRole } from "@/server/actions/users";

type TenantRole = keyof typeof ROLE_LABELS;

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
      if (result.error) toast.error(result.error);
    });
  }

  function handleRemove(userId: string) {
    if (!confirm("Remover este usuário da organização?")) return;
    startTransition(async () => {
      const result = await removeUser(userId);
      if (result.error) toast.error(result.error);
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
          <div className="space-y-3 md:hidden">
            {users.map((userEntry) => (
              <article key={userEntry.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{userEntry.user.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{userEntry.user.email}</p>
                  </div>
                  <Badge variant={userEntry.active ? "success" : "secondary"}>
                    {userEntry.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Perfil atual</p>
                    <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[userEntry.role]}`}>
                      {ROLE_LABELS[userEntry.role]}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Alterar perfil</p>
                    <Select
                      value={userEntry.role}
                      onValueChange={(value) => handleRoleChange(userEntry.user.id, value as TenantRole)}
                      disabled={pending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-2 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[userEntry.role]}</p>
                  </div>

                  {userEntry.role !== "OWNER" && (
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => handleRemove(userEntry.user.id)}
                      disabled={pending}
                    >
                      <UserMinus className="h-4 w-4" />
                      Remover usuário
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
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
                {users.map((userEntry) => (
                  <TableRow key={userEntry.id}>
                    <TableCell className="font-medium">{userEntry.user.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{userEntry.user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[userEntry.role]}`}>
                        {ROLE_LABELS[userEntry.role]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userEntry.active ? "success" : "secondary"}>
                        {userEntry.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={userEntry.role}
                        onValueChange={(value) => handleRoleChange(userEntry.user.id, value as TenantRole)}
                        disabled={pending}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {userEntry.role !== "OWNER" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemove(userEntry.user.id)}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
