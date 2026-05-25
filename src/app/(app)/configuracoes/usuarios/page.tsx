import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/server/actions/users";
import { UserManagementClient } from "./user-management-client";

export default async function UsuariosPage() {
  const users = await getUsers();

  return (
    <>
      <Header
        title="Usuários"
        subtitle="Gerencie quem tem acesso ao sistema"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/configuracoes">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <UserManagementClient users={users} />
      </div>
    </>
  );
}
