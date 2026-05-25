import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  hasPermission,
} from "@/lib/permissions";
import type { TenantRole } from "@prisma/client";
import { Check, X, ChevronLeft } from "lucide-react";

const ROLES: TenantRole[] = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "FINANCE",
  "VETERINARY",
  "OPERATOR",
  "VIEWER",
];

const ROLE_COLORS: Record<TenantRole, string> = {
  OWNER: "text-purple-700 bg-purple-50",
  ADMIN: "text-blue-700 bg-blue-50",
  MANAGER: "text-green-700 bg-green-50",
  FINANCE: "text-yellow-700 bg-yellow-50",
  VETERINARY: "text-teal-700 bg-teal-50",
  OPERATOR: "text-orange-700 bg-orange-50",
  VIEWER: "text-gray-700 bg-gray-50",
  MEMBER: "text-gray-600 bg-gray-50",
};

export default function PerfisPage() {
  return (
    <>
      <Header
        title="Perfis de acesso"
        subtitle="Veja as permissões de cada perfil disponível no sistema"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/configuracoes">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />
      <div className="p-6 space-y-6">
        {/* Cards de resumo por perfil */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ROLES.map((role) => (
            <Card key={role}>
              <CardHeader className="pb-2">
                <div className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_COLORS[role]}`}>
                  {ROLE_LABELS[role]}
                </div>
                <CardDescription className="text-xs mt-2">
                  {ROLE_DESCRIPTIONS[role]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {PERMISSION_GROUPS.reduce(
                    (count, group) =>
                      count +
                      group.permissions.filter((p) => hasPermission(role, p)).length,
                    0
                  )}{" "}
                  permissões
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Matriz de permissões por grupo */}
        {PERMISSION_GROUPS.map((group) => (
          <Card key={group.label}>
            <CardHeader>
              <CardTitle className="text-base">{group.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Permissão</TableHead>
                      {ROLES.map((role) => (
                        <TableHead key={role} className="text-center text-xs">
                          <span className={`inline-flex rounded-full px-2 py-0.5 ${ROLE_COLORS[role]}`}>
                            {ROLE_LABELS[role]}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.permissions.map((permission) => (
                      <TableRow key={permission}>
                        <TableCell className="text-sm">{PERMISSION_LABELS[permission]}</TableCell>
                        {ROLES.map((role) => (
                          <TableCell key={role} className="text-center">
                            {hasPermission(role, permission) ? (
                              <Check className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
